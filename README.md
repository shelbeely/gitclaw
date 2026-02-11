![gitclaw banner](banner.jpeg)

A personal AI assistant that runs entirely through GitHub Issues and Actions. Like [OpenClaw](https://github.com/openclaw/openclaw), but no servers or extra infrastructure.

**100% serverless** - Powered by the [pi coding agent](https://github.com/badlogic/pi-mono) or [OpenCode](https://github.com/anomalyco/opencode). Every issue becomes a chat thread with an AI agent. Conversation history is committed to git, giving the agent long-term memory across sessions. It can search prior context, edit or summarize past conversations, and all changes are versioned.

Since the agent can read and write files, you can build an evolving software project that updates itself as you open issues. Try asking it to set up a GitHub Pages site, then iterate on it issue by issue.

**Both agents run entirely in GitHub Actions** - no servers, no daemons, no infrastructure to maintain.

## How it works

1. **Create an issue** → the agent processes your request and replies as a comment.
2. **Comment on the issue** → the agent resumes the same session with full prior context.
3. **Everything is committed** → sessions and changes are pushed to the repo after every turn.

The agent reacts with 👀 while working and removes it when done.

### Repo as storage

All state lives in the repo:

```
state/
  issues/
    1.json          # maps issue #1 -> its session file
  sessions/
    2026-02-04T..._abc123.jsonl    # full conversation for issue #1
```

Since sessions are in git, the agent can grep its own history and edit or summarize past conversations.

## Setup

1. **Fork this repo**
2. **Add your API key** - go to **Settings → Secrets and variables → Actions → Secrets** and create a secret for your chosen provider:
   - `ANTHROPIC_API_KEY` for Anthropic Claude (default)
   - `OPENROUTER_API_KEY` for OpenRouter (access to 100+ models) **[Recommended]**
   - `OPENAI_API_KEY` for OpenAI
   
   **Note:** If you add `OPENROUTER_API_KEY`, the daily pricing update workflow will automatically fetch and update model pricing in [OPENROUTER_MODELS.md](OPENROUTER_MODELS.md).

3. **Open an issue** - the agent starts automatically.
4. **Comment on the issue** - the agent resumes where it left off.

## Agent Skills

**Yes, gitclaw supports Agent Skills!** ✅

Pi (and by extension, gitclaw) has a comprehensive skills system that allows you to extend the agent's capabilities with modular packages. Skills provide specialized knowledge, workflows, and tools.

**Built-in skills:**
- `memory` - Session memory and recall
- `skill-creator` - Create new skills

**Creating custom skills:**
- Extend gitclaw with domain-specific capabilities
- Bundle scripts, references, and assets
- Progressive loading (efficient context usage)
- Easy to add, remove, and share

**Image generation plugin?**
- **Effort:** 2-8 hours to implement
- Uses skills system for clean integration
- See [AGENT_SKILLS.md](AGENT_SKILLS.md) for complete guide

👉 **Full documentation:** [AGENT_SKILLS.md](AGENT_SKILLS.md)

## Security

The workflow only responds to repository **owners, members, and collaborators**. Random users cannot trigger the agent on public repos.

If you plan to use gitclaw for anything private, **make the repo private**. Public repos mean your conversation history is visible to everyone, but get generous GitHub Actions usage.

### ⚠️ Dangerously Skip Permissions

**WARNING: USE AT YOUR OWN RISK** - See [SECURITY_SKIP_PERMISSIONS.md](SECURITY_SKIP_PERMISSIONS.md) for complete risk analysis.

You can allow **anyone** to trigger the agent by setting:
```
Variable Name: DANGEROUSLY_SKIP_PERMISSIONS
Value: true
```

**When to use this:**
- Public demo repositories (actively monitored, with spending limits)
- Private repositories with internal teams
- Educational workshops (temporary, supervised usage)
- Testing with non-privileged accounts (development/staging)

**⚠️ CRITICAL SECURITY RISKS:**

1. **API Cost Abuse**: Anyone can trigger unlimited API calls, costing you money
2. **Resource Exhaustion**: Malicious users can exhaust your API quotas
3. **Rate Limiting**: Your API keys may hit rate limits from abuse
4. **Workflow Minutes**: GitHub Actions minutes will be consumed by anyone

**Recommended Safeguards:**

- ✅ Use with **budget-friendly models only** (e.g., Kimi K2.5 at $0.45/$2.25 per 1M tokens)
- ✅ Set up **billing alerts** on your AI provider account
- ✅ Use **dedicated API keys** with spending limits
- ✅ Monitor usage frequently
- ✅ Consider making repository **private** with selected collaborators
- ✅ Set `MAX_CONTINUATION_RUNS=1` to limit per-issue cost
- ✅ Set `AGENT_TIMEOUT_MINUTES=60` for shorter runs

**Example Safe Configuration:**
```
DANGEROUSLY_SKIP_PERMISSIONS = true
PI_PROVIDER = openrouter
PI_MODEL = kimi/k2.5  # Cheap model
MAX_CONTINUATION_RUNS = 1
AGENT_TIMEOUT_MINUTES = 60
```

> **Note**: Even with this enabled, workflow secrets (API keys) are never exposed to the running code or users. However, usage of those API keys is unrestricted.

## Configuration

You can customize the agent's behavior by setting repository variables and editing the workflow file.

### Using Different Providers

The agent supports multiple AI providers. To switch providers:

1. **Add your API key as a secret** (Settings → Secrets and variables → Actions → Secrets):
   - `ANTHROPIC_API_KEY` - for Anthropic Claude
   - `OPENROUTER_API_KEY` - for OpenRouter (access to 100+ models)
   - `OPENAI_API_KEY` - for OpenAI

2. **Set provider and model as variables** (Settings → Secrets and variables → Actions → Variables):
   - `PI_PROVIDER` - provider name (e.g., `openrouter`, `openai`, `anthropic`)
   - `PI_MODEL` - model name (e.g., `anthropic/claude-3.5-sonnet`, `openai/gpt-4`, `google/gemini-pro-1.5`)
   - `PI_THINKING` - thinking level: `off`, `minimal`, `low`, `medium`, `high`, `xhigh` (optional)
   - `AGENT_TIMEOUT_MINUTES` - job timeout in minutes, max 360 for GitHub-hosted (default: 360)

### Choosing Between Pi and OpenCode

Gitclaw supports two coding agents: **pi** (default) and **OpenCode**. Choose based on your needs:

**Pi (default):**
- Lightweight and fast
- Simple CLI invocation
- Proven stability
- Works great for most use cases

**OpenCode:**
- LSP integration for superior code intelligence
- Multi-agent system (build/plan/general)
- 75+ AI provider support
- Desktop app available
- Exceptional terminal UI

**To use OpenCode** (Settings → Actions → Variables):
- `AGENT_TYPE` - set to `opencode` (default: `pi`)
- `OPENCODE_AGENT` - agent mode: `build`, `plan`, or `general` (default: `build`)

Both agents share the same `PI_PROVIDER` and `PI_MODEL` configuration.

3. **Optional: Enable auto-continuation for 24+ hour runs** (Settings → Actions → Variables):
   - `ENABLE_AUTO_CONTINUATION` - set to `true` to enable automatic continuation across multiple runs
   - `CONTINUATION_THRESHOLD_MINUTES` - when to trigger continuation (default: 330 = 5.5 hours)
   - `MAX_CONTINUATION_RUNS` - maximum number of runs per issue (default: 4 = 24 hours)

4. **⚠️ Optional: Skip permissions (DANGEROUS)** (Settings → Actions → Variables):
   - `DANGEROUSLY_SKIP_PERMISSIONS` - set to `true` to allow **anyone** to trigger the agent
   - **WARNING**: Only use with spending limits and cheap models! See [Security](#security) section for risks.

**Example configurations** (set these as repository variables in Settings → Actions → Variables):

**Using pi with OpenRouter (default, recommended):**
```
Variable Name: AGENT_TYPE
Value: pi

Variable Name: PI_PROVIDER
Value: openrouter

Variable Name: PI_MODEL  
Value: anthropic/claude-3.5-sonnet

Variable Name: PI_THINKING
Value: medium
```

**Using OpenCode with LSP intelligence:**
```
Variable Name: AGENT_TYPE
Value: opencode

Variable Name: OPENCODE_AGENT
Value: build

Variable Name: PI_PROVIDER
Value: openrouter

Variable Name: PI_MODEL
Value: anthropic/claude-3.5-sonnet
```

**Budget-conscious with Kimi K2.5:**
```
Variable Name: AGENT_TYPE
Value: pi

Variable Name: PI_PROVIDER
Value: openrouter

Variable Name: PI_MODEL
Value: kimi/k2.5
```

Variable Name: AGENT_TIMEOUT_MINUTES
Value: 360
```

Enable 24-hour autonomous operation with auto-continuation:
```
Variable Name: ENABLE_AUTO_CONTINUATION
Value: true

Variable Name: CONTINUATION_THRESHOLD_MINUTES
Value: 330

Variable Name: MAX_CONTINUATION_RUNS
Value: 4
```

If no provider/model is specified, the agent defaults to Anthropic's Claude with `ANTHROPIC_API_KEY`.

### Advanced Configuration

Edit `.github/workflows/agent.yml` to customize:

- **Tools:** Restrict with `--tools read,grep,find,ls` for read-only analysis.
- **Thinking:** Add `--thinking high` for harder tasks.
- **Trigger:** Adjust the `on:` block to filter by labels, assignees, etc.
- **Timeout:** Set `timeout-minutes: 360` (max 6 hours on GitHub-hosted runners).

## Session Duration & Autonomous Operation

### How Long Can a Session Run?

**GitHub-hosted runners**: Each workflow job has a **6-hour (360 minute) maximum**. This is a hard limit imposed by GitHub Actions.

**What happens in a single run:**
1. Agent receives your prompt
2. Processes it with full access to tools (read, write, bash, edit)
3. Can make multiple file changes, run tests, install dependencies, etc.
4. Commits changes and responds in one comment
5. Stops until you comment again

### "YOLO Mode" - Autonomous App Building

Yes! You can have the agent build and debug an app from scratch with **zero interaction after the initial prompt**. The key is crafting a comprehensive initial prompt.

**Example autonomous prompt:**

```markdown
Build a complete todo app from scratch:

1. Create a Next.js app with TypeScript
2. Set up Tailwind CSS for styling
3. Implement:
   - Todo list display
   - Add todo functionality
   - Mark as complete
   - Delete todos
   - Local storage persistence
4. Add proper TypeScript types
5. Style it to look modern and clean
6. Create a README with setup instructions
7. Test that it works by running `npm run dev`
8. Fix any errors you encounter
9. Make sure the build succeeds with `npm run build`

Take your time and work through each step carefully. Don't stop until everything works.
```

**Tips for autonomous operation:**

- **Be specific**: List exact requirements, tech stack, features
- **Include validation**: Ask the agent to test and fix errors
- **Set success criteria**: "make sure tests pass", "verify the app runs"
- **Use incremental steps**: The agent will work through your list methodically
- **Leverage thinking**: Add `--thinking high` in the workflow for complex tasks

### Breaking the 6-Hour Limit: Auto-Continuation

You can now enable **automatic continuation** to work around the 6-hour GitHub Actions timeout. The agent will automatically trigger additional runs to continue work on complex tasks.

**How it works:**

1. When approaching the timeout (e.g., at 5.5 hours), the agent automatically posts a continuation comment
2. This triggers a new workflow run that resumes the session with full context
3. The agent continues working from where it left off
4. This repeats up to a configurable maximum (default: 4 runs = 24 hours total)

**To enable auto-continuation:**

Set these repository variables (Settings → Actions → Variables):
```
Variable Name: ENABLE_AUTO_CONTINUATION
Value: true

Variable Name: MAX_CONTINUATION_RUNS
Value: 4
```

**Example: 24-hour autonomous app build**

```markdown
Build a complete e-commerce platform from scratch with full testing:

[... detailed requirements ...]

This is a large project - take as much time as needed across multiple continuation runs.
```

With `ENABLE_AUTO_CONTINUATION=true` and `MAX_CONTINUATION_RUNS=4`, the agent will:
- Run 1 (0-6h): Set up project structure, database, authentication
- Run 2 (6-12h): Build product catalog, shopping cart
- Run 3 (12-18h): Implement checkout, payment integration
- Run 4 (18-24h): Add admin panel, testing, documentation

The agent automatically continues between runs with no interaction needed.

**Safety features:**
- **Max run limit**: Prevents infinite loops (default: 4 runs)
- **Continuation tracking**: State saved in git prevents duplicate runs
- **Clear status**: Continuation comments show run count and progress

**Note**: Each continuation comment counts as a new workflow run. Ensure you have sufficient GitHub Actions minutes.

### Multi-Turn Projects (Manual Approach)

For projects without auto-continuation enabled:

1. **First issue**: "Build the foundation: Next.js app with authentication"
2. **Second issue**: "Add the dashboard and data visualization"
3. **Third issue**: "Implement the API integration and error handling"

Each issue continues the previous session - the agent has full memory of prior work.

### Session Limits

**Time per run**: 6 hours maximum per job on GitHub-hosted runners (configurable via `AGENT_TIMEOUT_MINUTES`, max 360)  
**Total time with continuation**: Up to 24 hours (or more) with `ENABLE_AUTO_CONTINUATION=true`  
**Context**: Sessions persist across runs and issues via git-committed conversation history  
**Tokens**: Limited by your API provider (typically 100K+ tokens per request)  
**Actions**: Unlimited tool calls within time limit - agent decides when it's done

> **Note**: Self-hosted runners support longer timeouts (up to 5 days), but require additional workflow and runner configuration not covered here.

### Safe Timeout Handling

The agent implements multiple safety mechanisms to ensure work isn't lost:

**Automatic Safeguards:**
- All changes are committed and pushed to git before timeout
- Continuation triggers at 5.5 hours (15-minute safety buffer)
- Time status logged: "⏱️ Runtime: 5h 30m | Remaining: 30 minutes"
- Warning issued when <15 minutes remain

**How It Works:**
1. Agent completes its work and commits all changes
2. At 5h 30m, checks for continuation eligibility
3. Pushes all commits safely to repository
4. Posts continuation comment if enabled
5. If timeout occurs, all work is already saved

**Manual Safety:**
- Keep CONTINUATION_THRESHOLD_MINUTES at default (330) for safety
- Use AGENT_TIMEOUT_MINUTES to set a conservative limit if needed
- Monitor GitHub Actions logs for time warnings

**The 15-minute buffer ensures:**
- Time to commit and push large changesets
- GitHub Actions cleanup operations complete
- Continuation comment is posted successfully
- No work is ever lost to timeout

## Cost Estimation

See **[COST_ESTIMATION.md](COST_ESTIMATION.md)** for detailed pricing analysis and budget planning.

**Quick Reference:**

| Provider | Model | 6-Hour Build | 24-Hour Build |
|----------|-------|--------------|---------------|
| **MoonshotAI** | Kimi K2.5 | $1-5 | $4-20 |
| OpenAI | GPT-4o | $3-16 | $14-65 |
| Anthropic | Claude 3.5 | $5-22 | $19-86 |

**Recommendation**: Kimi K2.5 via OpenRouter offers the best value (262K context, $0.45/$2.25 per 1M tokens).

**💰 Complete Cost Breakdown:** See **[RUNNERS_AND_PRICING.md](RUNNERS_AND_PRICING.md)** for:
- GitHub Actions runner recommendations
- Exact GitHub Actions costs (free for public repos!)
- Live AI model pricing from OpenRouter
- Total cost examples and budget planning
- Cost optimization strategies

**Quick summary:**
- **Public repos:** $0.02-0.27 per task (GitHub Actions is FREE!)
- **Private repos:** $0.08-0.33 per task (includes GitHub Actions)
- **Best value:** Public repo + Kimi K2.5 = $0.02 per task

## FAQ

### Does this still work through GitHub Actions?

**Yes! 100% serverless.** Both pi and OpenCode run entirely in GitHub Actions with **zero infrastructure needed**.

**How it works:**

1. **Issue/comment created** → GitHub Actions workflow triggers
2. **Dependencies installed** → `bun install` installs pi and/or OpenCode from npm
3. **Agent runs** → Your chosen agent (pi or OpenCode) executes in the Actions runner
4. **Results committed** → Changes pushed back to repo, comment posted to issue
5. **Workflow completes** → Runner terminates, zero cost until next issue/comment

**Architecture (both agents):**
```
GitHub Issue/Comment
    ↓
GitHub Actions Workflow (triggered)
    ↓
Ubuntu Runner (ephemeral)
    ↓
Bun Install (pi + OpenCode from npm)
    ↓
Agent Execution (lifecycle/main.ts)
    ↓
Git Commit & Push
    ↓
Issue Comment Reply
    ↓
Runner Terminates
```

**Key points:**
- ✅ No servers to manage
- ✅ No infrastructure to maintain
- ✅ Works the same whether you choose pi or OpenCode
- ✅ Both agents are just npm packages installed on-demand
- ✅ OpenCode's client/server architecture runs entirely within the Actions job
- ✅ Sessions persist in git (not in memory)

### How does OpenCode work in GitHub Actions?

OpenCode is designed to run as a daemon with TUI, but gitclaw uses it in **batch mode**:

```typescript
// In lifecycle/main.ts
const opencodeArgs = ["opencode", "run", prompt, "--no-tui"];
```

The `--no-tui` flag disables the terminal UI, making it perfect for non-interactive GitHub Actions execution. OpenCode completes the task and exits, just like pi does.

### Do I need to install anything?

**No!** Both agents are installed automatically:

1. Fork the repo
2. Add your API key as a secret
3. Open an issue

GitHub Actions handles everything else:
- Installs Bun
- Runs `bun install` (installs pi and OpenCode from package.json)
- Executes the agent
- Commits results

### Does dual agent support increase costs?

**No cost increase.** You only run **one agent at a time** based on your `AGENT_TYPE` setting:

- If `AGENT_TYPE=pi` (default) → Only pi runs
- If `AGENT_TYPE=opencode` → Only OpenCode runs

Both use the same API keys and GitHub Actions minutes. The only "cost" is having both packages installed (~50MB total), which is negligible.

### Can I switch agents mid-session?

**Yes, but sessions won't transfer perfectly.** Each agent has its own session format:

- **Pi**: JSONL format in state/sessions/
- **OpenCode**: Own session system

**Recommendation:** Stick with one agent per repository or per issue thread. Switching is painless for new issues.

### Which agent should I use?

**Use pi (default) when:**
- You want proven stability
- Speed matters
- Simple workflows
- Don't need LSP features

**Use OpenCode when:**
- Need LSP-powered code intelligence
- Working with complex codebases
- Want multi-agent flexibility (build/plan/general modes)
- Need superior code understanding

Both are excellent! Pi is battle-tested, OpenCode offers advanced features.

### Does gitclaw support image generation?

**Short answer:** Technically possible, but **not recommended**.

**Why:**
- GitHub Issues = text interface (no image display)
- No storage/preview workflow for generated images
- Coding agents optimized for code, not visual content
- Better tools exist (Midjourney, DALL-E, direct OpenRouter API)

**However, vision/image ANALYSIS is fully supported! ✅**

Use gitclaw to:
- Analyze UI screenshots → generate matching code
- Read error screenshots → provide debugging fixes
- Understand diagrams → create implementations
- Convert handwritten code → clean implementations

**For details:** See **[MULTIMODAL.md](MULTIMODAL.md)** for:
- Complete explanation of multimodal capabilities
- Gemini 3 Pro Image Preview details and pricing
- Vision model comparison and recommendations
- Practical vision-to-code workflows
- Cost analysis for image analysis tasks

**Bottom line:** Use gitclaw for vision INPUT → code OUTPUT. Use other tools for image generation.

## Agent Customization

### Swapping Agents

Want to use a different coding agent instead of pi? See **[SWAPPING_AGENTS.md](SWAPPING_AGENTS.md)** for:
- How to replace pi with Aider, GPT Engineer, or custom implementations
- Complete integration guide with examples
- Feature comparison matrix
- Step-by-step swap process

### OpenClaw Integration

Wondering about OpenClaw? See **[OPENCLAW_VS_GITCLAW.md](OPENCLAW_VS_GITCLAW.md)** for:
- How OpenClaw and gitclaw relate (spoiler: they're complementary!)
- Why they serve different purposes
- How to use both together effectively
- Architecture differences explained

## Acknowledgments

Built on top of [pi-mono](https://github.com/badlogic/pi-mono) by [Mario Zechner](https://github.com/badlogic).

Thanks to [ymichael](https://github.com/ymichael) for nerdsniping me with the idea of an agent that runs in GitHub Actions.
