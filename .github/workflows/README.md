# GitHub Actions Workflows

This directory contains automated workflows for gitclaw.

## Workflows

### agent.yml - Main Agent Workflow

Triggers when issues or comments are created. Runs the pi or OpenCode agent to process requests.

**Required secrets:**
- At least one of: `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, or `OPENAI_API_KEY`

**Optional variables:**
- `PI_PROVIDER` - AI provider (e.g., `openrouter`, `anthropic`, `openai`)
- `PI_MODEL` - Model to use (e.g., `anthropic/claude-3.5-sonnet`, `moonshotai/kimi-k2.5`)
- `AGENT_TYPE` - Agent to use: `pi` (default) or `opencode`
- `AGENT_TIMEOUT_MINUTES` - Max runtime (default: 360 = 6 hours)
- `ENABLE_AUTO_CONTINUATION` - Enable 24+ hour runs (default: false)
- And more - see [README.md](../../README.md)

### update-pricing.yml - Daily Pricing Updates

Automatically fetches OpenRouter model pricing daily and updates [OPENROUTER_MODELS.md](../../OPENROUTER_MODELS.md).

**Required secret:**
- `OPENROUTER_API_KEY` - Your OpenRouter API key

**Schedule:** Daily at 00:00 UTC

**Manual trigger:** Can be triggered manually via "Actions" tab → "Update OpenRouter Pricing" → "Run workflow"

## Setting Up Secrets

1. Go to your forked repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add your secrets:

### For Agent Functionality (Required - at least one)

| Secret Name | Description | Get Key From |
|-------------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | https://console.anthropic.com/ |
| `OPENROUTER_API_KEY` | OpenRouter API key (recommended) | https://openrouter.ai/keys |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |

### For Daily Pricing Updates (Optional)

| Secret Name | Description | Get Key From |
|-------------|-------------|--------------|
| `OPENROUTER_API_KEY` | Same key as above | https://openrouter.ai/keys |

**Note:** If you already added `OPENROUTER_API_KEY` for the agent, you don't need to add it again - the pricing update workflow will automatically use it.

## Setting Up Variables

Variables are used for configuration that changes behavior but isn't sensitive.

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **"New repository variable"**
3. Add your variables (all optional):

| Variable Name | Default | Description |
|---------------|---------|-------------|
| `PI_PROVIDER` | (none) | AI provider: `openrouter`, `anthropic`, `openai` |
| `PI_MODEL` | (none) | Model ID (e.g., `anthropic/claude-3.5-sonnet`) |
| `AGENT_TYPE` | `pi` | Agent to use: `pi` or `opencode` |
| `AGENT_TIMEOUT_MINUTES` | `360` | Max runtime in minutes (max 360 for GitHub-hosted) |

See [README.md](../../README.md) for complete list of variables.

## Testing Workflows

### Test the Agent Workflow
1. Open an issue in your forked repo
2. The agent should respond automatically

### Test the Pricing Update Workflow
1. Ensure `OPENROUTER_API_KEY` secret is added
2. Go to **Actions** tab
3. Click **"Update OpenRouter Pricing"**
4. Click **"Run workflow"**
5. Check for updates to `OPENROUTER_MODELS.md`

## Troubleshooting

**Workflow doesn't run:**
- Check that required secrets are added
- For pricing updates: verify `OPENROUTER_API_KEY` is set
- Check workflow permissions: Settings → Actions → General → Workflow permissions (should be "Read and write")

**Pricing updates not committing:**
- Verify the workflow has `contents: write` permission
- Check Actions logs for errors
- Manually test: `./scripts/generate-model-pricing.sh YOUR_KEY`

**Agent doesn't respond to issues:**
- Verify at least one API key secret is added
- Check that you're the repository owner/collaborator
- Review Actions logs for errors
