import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, "utf-8"));
const eventName = process.env.GITHUB_EVENT_NAME!;
const repo = process.env.GITHUB_REPOSITORY!;
const issueNumber: number = event.issue.number;
const workflowStartTime = Date.now();

async function run(cmd: string[], opts?: { stdin?: any }): Promise<{ exitCode: number; stdout: string }> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "inherit",
    stdin: opts?.stdin,
  });
  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout: stdout.trim() };
}

async function gh(...args: string[]): Promise<string> {
  const { stdout } = await run(["gh", ...args]);
  return stdout;
}

// Continuation support
interface ContinuationState {
  runCount: number;
  startedAt: string;
  lastRunAt: string;
}

function getContinuationState(): ContinuationState | null {
  const stateFile = `state/issues/${issueNumber}-continuation.json`;
  if (existsSync(stateFile)) {
    return JSON.parse(readFileSync(stateFile, "utf-8"));
  }
  return null;
}

function saveContinuationState(state: ContinuationState) {
  const stateFile = `state/issues/${issueNumber}-continuation.json`;
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
}

function shouldContinue(): boolean {
  const enableContinuation = process.env.ENABLE_AUTO_CONTINUATION === "true";
  if (!enableContinuation) return false;

  const thresholdMinutes = parseInt(process.env.CONTINUATION_THRESHOLD_MINUTES || "330");
  const elapsedMinutes = (Date.now() - workflowStartTime) / 60000;
  
  return elapsedMinutes >= thresholdMinutes;
}

function checkContinuationLimit(): boolean {
  const maxRuns = parseInt(process.env.MAX_CONTINUATION_RUNS || "4");
  const state = getContinuationState();
  
  if (!state) return true; // First run, allow continuation
  
  return state.runCount < maxRuns;
}

async function triggerContinuation() {
  const state = getContinuationState() || {
    runCount: 0,
    startedAt: new Date().toISOString(),
    lastRunAt: new Date().toISOString(),
  };
  
  state.runCount += 1;
  state.lastRunAt = new Date().toISOString();
  saveContinuationState(state);
  
  const continuationMessage = `🔄 **Auto-continuation ${state.runCount}/${process.env.MAX_CONTINUATION_RUNS || "4"}**

Approaching timeout limit. Continuing work in next run...

_Session will resume automatically with full context._`;
  
  await gh("issue", "comment", String(issueNumber), "--body", continuationMessage);
  console.log(`Triggered continuation run ${state.runCount}`);
}

// Load reaction state from preinstall
const reactionState = existsSync("/tmp/reaction-state.json")
  ? JSON.parse(readFileSync("/tmp/reaction-state.json", "utf-8"))
  : null;

try {
  // --- Fetch issue ---
  const title = await gh("issue", "view", String(issueNumber), "--json", "title", "--jq", ".title");
  const body = await gh("issue", "view", String(issueNumber), "--json", "body", "--jq", ".body");

  // --- Resolve session ---
  mkdirSync("state/issues", { recursive: true });
  mkdirSync("state/sessions", { recursive: true });

  let mode = "new";
  let sessionPath = "";
  const mappingFile = `state/issues/${issueNumber}.json`;

  if (existsSync(mappingFile)) {
    const mapping = JSON.parse(readFileSync(mappingFile, "utf-8"));
    if (existsSync(mapping.sessionPath)) {
      mode = "resume";
      sessionPath = mapping.sessionPath;
      console.log(`Found existing session: ${sessionPath}`);
    } else {
      console.log("Mapped session file missing, starting fresh");
    }
  } else {
    console.log("No session mapping found, starting fresh");
  }

  // --- Configure git ---
  await run(["git", "config", "user.name", "gitclaw[bot]"]);
  await run(["git", "config", "user.email", "gitclaw[bot]@users.noreply.github.com"]);

  // --- Build prompt ---
  let prompt: string;
  let isContinuation = false;
  
  if (eventName === "issue_comment") {
    const commentBody = event.comment.body;
    // Check if this is an auto-continuation comment
    if (commentBody.includes("🔄 **Auto-continuation") && event.comment.user.login === "github-actions[bot]") {
      isContinuation = true;
      prompt = "continue"; // Simple continuation prompt
    } else {
      prompt = commentBody;
    }
  } else {
    prompt = `${title}\n\n${body}`;
  }
  
  // For continuation, always resume the session
  if (isContinuation && existsSync(mappingFile)) {
    const mapping = JSON.parse(readFileSync(mappingFile, "utf-8"));
    if (existsSync(mapping.sessionPath)) {
      mode = "resume";
      sessionPath = mapping.sessionPath;
      console.log(`Continuation detected, resuming session: ${sessionPath}`);
    }
  }

  // --- Run agent ---
  const piArgs = ["bunx", "pi", "--mode", "json", "--session-dir", "./state/sessions", "-p", prompt];
  if (mode === "resume" && sessionPath) {
    piArgs.push("--session", sessionPath);
  }
  
  // Optional provider and model configuration
  const provider = process.env.PI_PROVIDER;
  const model = process.env.PI_MODEL;
  const thinking = process.env.PI_THINKING;
  if (provider) {
    piArgs.push("--provider", provider);
  }
  if (model) {
    piArgs.push("--model", model);
  }
  if (thinking) {
    piArgs.push("--thinking", thinking);
  }

  const pi = Bun.spawn(piArgs, { stdout: "pipe", stderr: "ignore" });
  const tee = Bun.spawn(["tee", "/tmp/agent-raw.jsonl"], { stdin: pi.stdout, stdout: "inherit" });
  await tee.exited;

  // Extract text from the agent's final message
  const tac = Bun.spawn(["tac", "/tmp/agent-raw.jsonl"], { stdout: "pipe" });
  const jq = Bun.spawn(
    ["jq", "-r", "-s", '[ .[] | select(.type == "message_end") ] | .[0].message.content[] | select(.type == "text") | .text'],
    { stdin: tac.stdout, stdout: "pipe" }
  );
  const agentText = await new Response(jq.stdout).text();
  await jq.exited;

  // Find latest session file
  const { stdout: latestSession } = await run([
    "bash", "-c", "ls -t state/sessions/*.jsonl 2>/dev/null | head -1",
  ]);

  // --- Save session mapping ---
  if (latestSession) {
    writeFileSync(
      mappingFile,
      JSON.stringify({
        issueNumber,
        sessionPath: latestSession,
        updatedAt: new Date().toISOString(),
      }, null, 2) + "\n"
    );
    console.log(`Saved mapping: issue #${issueNumber} -> ${latestSession}`);
  } else {
    console.log("Warning: no session file found to map");
  }

  // --- Commit and push ---
  await run(["git", "add", "-A"]);
  const { exitCode } = await run(["git", "diff", "--cached", "--quiet"]);
  if (exitCode !== 0) {
    await run(["git", "commit", "-m", `gitclaw: work on issue #${issueNumber}`]);
  }

  for (let i = 1; i <= 3; i++) {
    const push = await run(["git", "push", "origin", "main"]);
    if (push.exitCode === 0) break;
    console.log(`Push failed, rebasing and retrying (${i}/3)...`);
    await run(["git", "pull", "--rebase", "origin", "main"]);
  }

  // --- Comment on issue ---
  const commentBody = agentText.slice(0, 60000);
  await gh("issue", "comment", String(issueNumber), "--body", commentBody);

  // --- Check for auto-continuation ---
  if (shouldContinue() && checkContinuationLimit()) {
    console.log("Triggering auto-continuation...");
    await triggerContinuation();
  } else if (!checkContinuationLimit()) {
    console.log("Maximum continuation runs reached, stopping.");
  }

} finally {
  // --- Remove eyes reaction ---
  if (reactionState?.reactionId) {
    try {
      const { reactionId, reactionTarget, commentId } = reactionState;
      if (reactionTarget === "comment" && commentId) {
        await gh("api", `repos/${repo}/issues/comments/${commentId}/reactions/${reactionId}`, "-X", "DELETE");
      } else {
        await gh("api", `repos/${repo}/issues/${issueNumber}/reactions/${reactionId}`, "-X", "DELETE");
      }
    } catch (e) {
      console.error("Failed to remove reaction:", e);
    }
  }
}
