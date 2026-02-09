![gitclaw banner](banner.jpeg)

A personal AI assistant that runs entirely through GitHub Issues and Actions. Like [OpenClaw](https://github.com/openclaw/openclaw), but no servers or extra infrastructure.

Powered by the [pi coding agent](https://github.com/badlogic/pi-mono). Every issue becomes a chat thread with an AI agent. Conversation history is committed to git, giving the agent long-term memory across sessions. It can search prior context, edit or summarize past conversations, and all changes are versioned.

Since the agent can read and write files, you can build an evolving software project that updates itself as you open issues. Try asking it to set up a GitHub Pages site, then iterate on it issue by issue.

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
2. **Add your API key** - go to **Settings → Secrets and variables → Actions** and create a secret for your chosen provider:
   - `ANTHROPIC_API_KEY` for Anthropic Claude (default)
   - `OPENROUTER_API_KEY` for OpenRouter (access to 100+ models)
   - `OPENAI_API_KEY` for OpenAI
3. **Open an issue** - the agent starts automatically.
4. **Comment on the issue** - the agent resumes where it left off.

## Security

The workflow only responds to repository **owners, members, and collaborators**. Random users cannot trigger the agent on public repos.

If you plan to use gitclaw for anything private, **make the repo private**. Public repos mean your conversation history is visible to everyone, but get generous GitHub Actions usage.

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

**Example configurations** (set these as repository variables in Settings → Actions → Variables):

Using OpenRouter with Claude 3.5 Sonnet:
```
Variable Name: PI_PROVIDER
Value: openrouter

Variable Name: PI_MODEL  
Value: anthropic/claude-3.5-sonnet
```

Using OpenRouter with GPT-4:
```
Variable Name: PI_PROVIDER
Value: openrouter

Variable Name: PI_MODEL
Value: openai/gpt-4
```

Enable high thinking for complex tasks:
```
Variable Name: PI_THINKING
Value: high

Variable Name: AGENT_TIMEOUT_MINUTES
Value: 360
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

### Multi-Turn Projects

For projects exceeding 6 hours:

1. **First issue**: "Build the foundation: Next.js app with authentication"
2. **Second issue**: "Add the dashboard and data visualization"
3. **Third issue**: "Implement the API integration and error handling"

Each issue continues the previous session - the agent has full memory of prior work.

### Session Limits

**Time**: 6 hours maximum per job on GitHub-hosted runners (configurable via `AGENT_TIMEOUT_MINUTES`, max 360)  
**Context**: Sessions persist across issues via git-committed conversation history  
**Tokens**: Limited by your API provider (typically 100K+ tokens per request)  
**Actions**: Unlimited tool calls within time limit - agent decides when it's done

> **Note**: Self-hosted runners support longer timeouts (up to 5 days), but require additional workflow and runner configuration not covered here.

## Acknowledgments

Built on top of [pi-mono](https://github.com/badlogic/pi-mono) by [Mario Zechner](https://github.com/badlogic).

Thanks to [ymichael](https://github.com/ymichael) for nerdsniping me with the idea of an agent that runs in GitHub Actions.
