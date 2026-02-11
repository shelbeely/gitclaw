import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, "utf-8"));
const eventName = process.env.GITHUB_EVENT_NAME!;
const repo = process.env.GITHUB_REPOSITORY!;
const issueNumber: number = event.issue.number;
const workflowStartTime = Date.now();

// Continuation constants
const DEFAULT_CONTINUATION_THRESHOLD_MINUTES = 330; // 5.5 hours
const DEFAULT_MAX_CONTINUATION_RUNS = 4; // 24 hours total
const CONTINUATION_MARKER = "🔄 **Auto-continuation";
const SAFETY_BUFFER_MINUTES = 15; // Buffer before hard timeout for safe shutdown

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
  token: string; // Security token to verify legitimate continuation
}

function getContinuationState(): ContinuationState | null {
  const stateFile = `state/issues/${issueNumber}-continuation.json`;
  if (existsSync(stateFile)) {
    return JSON.parse(readFileSync(stateFile, "utf-8"));
  }
  return null;
}

function saveContinuationState(state: ContinuationState) {
  mkdirSync("state/issues", { recursive: true });
  const stateFile = `state/issues/${issueNumber}-continuation.json`;
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
}

function getElapsedMinutes(): number {
  return (Date.now() - workflowStartTime) / 60000;
}

function getTimeoutLimit(): number {
  return parseInt(process.env.AGENT_TIMEOUT_MINUTES || "360", 10);
}

function getRemainingMinutes(): number {
  return getTimeoutLimit() - getElapsedMinutes();
}

function isApproachingTimeout(): boolean {
  return getRemainingMinutes() <= SAFETY_BUFFER_MINUTES;
}

function getTimeStatusMessage(): string {
  const elapsed = Math.floor(getElapsedMinutes());
  const remaining = Math.floor(getRemainingMinutes());
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;
  return `⏱️ Runtime: ${hours}h ${minutes}m | Remaining: ${remaining} minutes`;
}

function shouldContinue(): boolean {
  const enableContinuation = process.env.ENABLE_AUTO_CONTINUATION === "true";
  if (!enableContinuation) return false;

  const thresholdMinutes = parseInt(process.env.CONTINUATION_THRESHOLD_MINUTES || String(DEFAULT_CONTINUATION_THRESHOLD_MINUTES));
  const elapsedMinutes = getElapsedMinutes();
  
  return elapsedMinutes >= thresholdMinutes;
}

function checkContinuationLimit(): boolean {
  const maxRuns = parseInt(process.env.MAX_CONTINUATION_RUNS || String(DEFAULT_MAX_CONTINUATION_RUNS));
  const state = getContinuationState();
  
  if (!state) return true; // First run, allow continuation
  
  return state.runCount < maxRuns;
}

async function triggerContinuation() {
  const maxRuns = parseInt(process.env.MAX_CONTINUATION_RUNS || String(DEFAULT_MAX_CONTINUATION_RUNS));
  const state = getContinuationState() || {
    runCount: 0,
    startedAt: new Date().toISOString(),
    lastRunAt: new Date().toISOString(),
    token: crypto.randomUUID(),
  };
  
  state.runCount += 1;
  state.lastRunAt = new Date().toISOString();
  
  // Generate new token for this continuation if it doesn't exist
  if (!state.token) {
    state.token = crypto.randomUUID();
  }
  
  saveContinuationState(state);
  
  const continuationMessage = `${CONTINUATION_MARKER} ${state.runCount}/${maxRuns}**

${getTimeStatusMessage()}

Approaching timeout limit. All work has been committed and pushed safely. Continuing in next run...

_Session will resume automatically with full context._

<!-- continuation-token: ${state.token} -->`;
  
  await gh("issue", "comment", String(issueNumber), "--body", continuationMessage);
  console.log(`Triggered continuation run ${state.runCount}`);
  console.log(getTimeStatusMessage());
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
    // Check if this is an auto-continuation comment with valid token
    if (commentBody.includes(CONTINUATION_MARKER) && event.comment.user.login === "github-actions[bot]") {
      // Extract token from HTML comment
      const tokenMatch = commentBody.match(/<!-- continuation-token: ([a-f0-9-]+) -->/);
      const commentToken = tokenMatch ? tokenMatch[1] : null;
      
      // Verify token matches our saved state
      const state = getContinuationState();
      if (state && commentToken === state.token) {
        isContinuation = true;
        prompt = "Continue working on the task. Resume from where you left off and keep making progress until complete or you approach the time limit again.";
        console.log("Valid continuation token verified");
      } else {
        console.log("Invalid continuation token, treating as regular comment");
        prompt = commentBody;
      }
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
  const agentType = process.env.AGENT_TYPE || "pi";
  const provider = process.env.PI_PROVIDER;
  const model = process.env.PI_MODEL;
  const thinking = process.env.PI_THINKING;
  
  let agentText = "";
  
  if (agentType === "opencode") {
    console.log("Using OpenCode agent");
    
    // Build OpenCode arguments
    const opencodeArgs = ["opencode", "run", prompt];
    
    // Add agent mode (default to build for full permissions)
    const agentMode = process.env.OPENCODE_AGENT || "build";
    opencodeArgs.push("--agent", agentMode);
    
    // Disable TUI for non-interactive execution
    opencodeArgs.push("--no-tui");
    
    // Map provider configuration to OpenCode format if available
    if (provider) {
      opencodeArgs.push("--provider", provider);
    }
    if (model) {
      opencodeArgs.push("--model", model);
    }
    
    // Execute OpenCode
    const opencode = Bun.spawn(opencodeArgs, { 
      stdout: "pipe", 
      stderr: "pipe",
      cwd: process.cwd()
    });
    
    // Capture output
    const output = await new Response(opencode.stdout).text();
    const errors = await new Response(opencode.stderr).text();
    
    if (errors) {
      console.error("OpenCode stderr:", errors);
    }
    
    // OpenCode outputs results directly, extract the response
    // Parse output (OpenCode may include formatting, extract the core response)
    agentText = output.trim();
    
    await opencode.exited;
    
    console.log(`OpenCode completed with status: ${opencode.exitCode}`);
  } else {
    console.log("Using pi agent");
    
    // Build pi arguments
    const piArgs = ["bunx", "pi", "--mode", "json", "--session-dir", "./state/sessions", "-p", prompt];
    if (mode === "resume" && sessionPath) {
      piArgs.push("--session", sessionPath);
    }
    
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
    agentText = await new Response(jq.stdout).text();
    await jq.exited;
  }

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

  // --- Log time status ---
  console.log(getTimeStatusMessage());
  
  // --- Check for approaching timeout ---
  if (isApproachingTimeout()) {
    const remainingMinutes = Math.floor(getRemainingMinutes());
    console.warn(`⚠️  WARNING: Approaching hard timeout! Only ${remainingMinutes} minutes remaining.`);
    console.warn("All changes have been committed and pushed. Safe to timeout.");
  }

  // --- Check for auto-continuation ---
  if (shouldContinue() && checkContinuationLimit()) {
    console.log("Triggering auto-continuation...");
    await triggerContinuation();
  } else if (!checkContinuationLimit()) {
    console.log("Maximum continuation runs reached, stopping.");
    console.log(`Final status: ${getTimeStatusMessage()}`);
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
