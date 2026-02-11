# GitHub Actions Runners and Complete Pricing Guide

## Which Runner Should You Use?

**Current configuration: `runs-on: ubuntu-latest`** ✅

This is the **optimal choice** for gitclaw. Here's why:

### Runner Options

| Runner Type | Cores | RAM | Storage | Cost (public) | Cost (private) |
|-------------|-------|-----|---------|---------------|----------------|
| `ubuntu-latest` | 2 | 7 GB | 14 GB | **FREE** | $0.006/min |
| `ubuntu-latest-4` | 4 | 16 GB | 14 GB | Paid | $0.012/min |
| `ubuntu-latest-8` | 8 | 32 GB | 14 GB | Paid | $0.024/min |
| `windows-latest` | 2 | 7 GB | 14 GB | **FREE** | $0.010/min |
| `macos-latest` | 3 | 14 GB | 14 GB | **FREE** | $0.062/min |

**Recommendation: Stick with `ubuntu-latest` (2-core Linux)**

### Why ubuntu-latest?

✅ **Best value:**
- Free for public repositories
- Lowest cost for private repositories ($0.006/min)
- 2 cores sufficient for pi/OpenCode execution
- 7 GB RAM handles most AI workloads

✅ **Perfect for gitclaw:**
- Bun runs excellently on Linux
- Pi and OpenCode are optimized for Linux
- No need for macOS/Windows specific features
- Fast npm package installation

❌ **Don't use larger runners unless:**
- You're running extremely memory-intensive operations
- You need parallel processing (gitclaw doesn't)
- You have specific OS requirements

## Complete Cost Breakdown

### GitHub Actions Costs

#### Public Repositories

**COMPLETELY FREE! 🎉**

Standard GitHub-hosted runners (including `ubuntu-latest`) are **free** for:
- Public repositories (unlimited minutes)
- GitHub Pages
- Dependabot

**Your GitHub Actions cost: $0.00**

#### Private Repositories

**Included free minutes:**
- GitHub Free: 2,000 minutes/month
- GitHub Pro: 3,000 minutes/month  
- GitHub Team: 3,000 minutes/month
- GitHub Enterprise: 50,000 minutes/month

**Cost after free tier:**
- Linux 2-core (`ubuntu-latest`): **$0.006/minute** = **$0.36/hour**

**Example costs for private repos:**

| Duration | Minutes | GitHub Cost | Notes |
|----------|---------|-------------|-------|
| 1 interaction (10 min) | 10 | $0.060 | Single task |
| 1 hour | 60 | $0.360 | Extended work |
| 6 hours (max) | 360 | $2.160 | Full timeout |
| 24 hours (4×6h) | 1,440 | $8.640 | With auto-continuation |

**Monthly costs (private repos):**
- 10 issues/month (1h each): $3.60
- 50 issues/month (30min each): $9.00
- 100 issues/month (30min each): $18.00

### AI Model Costs (via OpenRouter)

**Live pricing** (fetched 2026-02-10):

#### Budget-Friendly Models

**Kimi K2.5** (MoonshotAI) - **BEST VALUE** 💰
- Input: $0.45 per 1M tokens
- Output: $2.25 per 1M tokens
- Context: 262K tokens
- Per interaction (20K in, 5K out): **$0.020**

**GPT-4o Mini** (OpenAI)
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Context: 128K tokens
- Per interaction: **$0.006**

#### Mid-Tier Models

**GPT-4o** (OpenAI)
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens
- Context: 128K tokens
- Per interaction: **$0.10**

#### Premium Models

**Claude 3.5 Sonnet** (Anthropic)
- Input: $6.00 per 1M tokens
- Output: $30.00 per 1M tokens
- Context: 200K tokens
- Per interaction: **$0.27**

### Total Cost Examples

**Scenario 1: Public Repo + Kimi K2.5 (RECOMMENDED)**

| Task | GitHub Actions | AI Model | **Total** |
|------|---------------|----------|-----------|
| Single task (10min) | $0.00 | $0.02 | **$0.02** |
| 1-hour build | $0.00 | $0.24 | **$0.24** |
| 6-hour build | $0.00 | $1.44 | **$1.44** |
| 24-hour build (4×6h) | $0.00 | $5.76 | **$5.76** |
| **100 tasks/month** | **$0.00** | **$2.00** | **$2.00** |

**Scenario 2: Private Repo + Kimi K2.5**

| Task | GitHub Actions | AI Model | **Total** |
|------|---------------|----------|-----------|
| Single task (10min) | $0.06 | $0.02 | **$0.08** |
| 1-hour build | $0.36 | $0.24 | **$0.60** |
| 6-hour build | $2.16 | $1.44 | **$3.60** |
| 24-hour build (4×6h) | $8.64 | $5.76 | **$14.40** |
| **100 tasks/month** | **$6.00** | **$2.00** | **$8.00** |

**Scenario 3: Public Repo + Claude 3.5 Sonnet**

| Task | GitHub Actions | AI Model | **Total** |
|------|---------------|----------|-----------|
| Single task (10min) | $0.00 | $0.27 | **$0.27** |
| 1-hour build | $0.00 | $3.24 | **$3.24** |
| 6-hour build | $0.00 | $19.44 | **$19.44** |
| 24-hour build (4×6h) | $0.00 | $77.76 | **$77.76** |
| **100 tasks/month** | **$0.00** | **$27.00** | **$27.00** |

**Scenario 4: Private Repo + Claude 3.5 Sonnet**

| Task | GitHub Actions | AI Model | **Total** |
|------|---------------|----------|-----------|
| Single task (10min) | $0.06 | $0.27 | **$0.33** |
| 1-hour build | $0.36 | $3.24 | **$3.60** |
| 6-hour build | $2.16 | $19.44 | **$21.60** |
| 24-hour build (4×6h) | $8.64 | $77.76 | **$86.40** |
| **100 tasks/month** | **$6.00** | **$27.00** | **$33.00** |

## Cost Optimization Strategies

### 1. Use Public Repositories

**Save:** 100% of GitHub Actions costs

Make your gitclaw repos public to get unlimited free runner minutes. Your conversation history will be public, but perfect for:
- Open source projects
- Learning/experimentation
- Portfolio showcases
- Non-sensitive development

### 2. Choose Budget-Friendly Models

**Save:** 70-90% of AI costs

**Best value models via OpenRouter:**
1. **Kimi K2.5** - $0.45/$2.25 per 1M tokens (262K context)
2. **GPT-4o Mini** - $0.15/$0.60 per 1M tokens
3. **Kimi K2** - $0.50/$2.40 per 1M tokens

**Avoid unless necessary:**
- Claude 3.5 Sonnet (13x more expensive than Kimi K2.5)
- GPT-4 models (5-10x more expensive)

### 3. Optimize Token Usage

**Save:** 30-50% of AI costs

- Use `PI_THINKING=low` or `off` for simple tasks
- Keep prompts concise and focused
- Avoid unnecessary context in follow-ups
- Use `OPENCODE_AGENT=plan` for read-only exploration

### 4. Set Spending Limits

**Prevent:** Unexpected bills

- Set GitHub Actions spending limits in Settings
- Configure OpenRouter spending limits
- Use `AGENT_TIMEOUT_MINUTES` to cap run duration
- Set `MAX_CONTINUATION_RUNS` to limit chained runs

### 5. Monitor Usage

**Track:** Where money goes

```bash
# Check GitHub Actions usage
gh api /repos/OWNER/REPO/actions/billing

# Check OpenRouter usage
curl https://openrouter.ai/api/v1/usage \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## Fetching Current Pricing

Want live pricing data? We provide a convenience script and direct API access.

### Using the Pricing Script

```bash
# Run the provided script
./scripts/fetch-openrouter-pricing.sh YOUR_OPENROUTER_API_KEY

# Or set as environment variable
export OPENROUTER_API_KEY=sk-or-...
./scripts/fetch-openrouter-pricing.sh
```

This script fetches and displays:
- Popular coding models with pricing
- Budget-friendly options
- Per-token and per-1M-token costs

### Using curl Directly

Official OpenRouter API: https://openrouter.ai/docs/api/api-reference/models/get-models

```bash
# Get all OpenRouter models and pricing
curl -s 'https://openrouter.ai/api/v1/models' \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  | jq '.data[] | {id: .id, pricing: .pricing, context_length: .context_length}'

# Get specific model
curl -s 'https://openrouter.ai/api/v1/models' \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  | jq '.data[] | select(.id == "anthropic/claude-3.5-sonnet")'

# Popular models for coding
curl -s 'https://openrouter.ai/api/v1/models' \
  -H 'Authorization: Bearer YOUR_OPENROUTER_KEY' \
  | jq -r '.data[] | select(.id | test("claude-3.5|gpt-4o|kimi-k2.5|gemini")) | 
    {id: .id, 
     prompt_per_1M: ((.pricing.prompt | tonumber) * 1000000), 
     completion_per_1M: ((.pricing.completion | tonumber) * 1000000),
     context: .context_length}'
```

### API Response Structure

The OpenRouter API returns model data in this format:

```json
{
  "data": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "pricing": {
        "prompt": "0.000006",        // $ per token input
        "completion": "0.00003"       // $ per token output
      },
      "context_length": 200000,
      "architecture": {
        "modality": "text->text",
        "tokenizer": "Claude"
      },
      "top_provider": {
        "context_length": 200000,
        "max_completion_tokens": 8192
      }
    }
  ]
}
```

**Note:** Pricing is per token. Multiply by 1,000,000 to get per-million-token costs.

### Pricing Updates

OpenRouter pricing reflects current provider rates and can change. The prices in this document were fetched on **2026-02-10** and should be verified before major usage.

**Always check latest pricing:**
- Use the provided script: `./scripts/fetch-openrouter-pricing.sh`
- Check OpenRouter directly: https://openrouter.ai/models
- Use the API: https://openrouter.ai/docs/api/api-reference/models/get-models

## Budget Planning

### Conservative Budget (Public Repo)

**$5/month** gets you:
- Unlimited GitHub Actions (free)
- ~250 tasks with Kimi K2.5
- OR ~25 1-hour autonomous builds
- OR ~3 full 6-hour builds

**Perfect for:** Personal projects, learning, experimentation

### Standard Budget (Private Repo)

**$20/month** gets you:
- ~2,300 minutes GitHub Actions (~38 hours)
- ~70 tasks with Kimi K2.5
- OR ~30 1-hour builds
- OR ~5 6-hour builds

**Perfect for:** Small teams, active development

### Power User Budget (Private Repo)

**$100/month** gets you:
- ~15,500 minutes GitHub Actions (~258 hours)
- ~460 tasks with Kimi K2.5
- OR ~160 1-hour builds
- OR ~27 6-hour builds

**Perfect for:** Professional use, production projects

## Recommendations by Use Case

### Personal Learning/Experimentation
- **Repo:** Public
- **Model:** Kimi K2.5 or GPT-4o Mini
- **Expected cost:** $0-5/month
- **Runner:** `ubuntu-latest`

### Open Source Development
- **Repo:** Public
- **Model:** Kimi K2.5
- **Expected cost:** $2-10/month
- **Runner:** `ubuntu-latest`

### Private Small Projects
- **Repo:** Private
- **Model:** Kimi K2.5
- **Expected cost:** $10-30/month
- **Runner:** `ubuntu-latest`

### Professional/Team Use
- **Repo:** Private
- **Model:** GPT-4o or Claude 3.5 Sonnet
- **Expected cost:** $50-200/month
- **Runner:** `ubuntu-latest` or `ubuntu-latest-4` if needed

## FAQ

### Why is GitHub Actions free for public repos?

GitHub wants to encourage open source development. Standard runners on public repos are completely free with unlimited minutes.

### Can I use self-hosted runners to save money?

Yes! Self-hosted runners are **always free** (no per-minute charges). However, you'll pay for:
- The infrastructure (cloud VM or local machine)
- Maintenance and management time
- May not be worth it unless you run >5,000 minutes/month on private repos

### What if I exceed my free minutes?

For private repos, GitHub will either:
- Stop workflows if you have no payment method
- Bill you at $0.006/min for Linux runners if you have payment set up

Set a spending limit in Settings → Billing → Actions to prevent surprises.

### How accurate are these cost estimates?

- **GitHub Actions costs:** Exact (official pricing)
- **AI model costs:** Actual live pricing from OpenRouter API
- **Token estimates:** Conservative averages; actual usage varies

Real token usage depends on:
- Prompt complexity
- Response length
- Context size
- Thinking level (for pi)

### Can costs change?

Yes:
- GitHub Actions pricing is stable but can change
- AI model prices fluctuate (usually downward!)
- OpenRouter pricing reflects current provider rates
- Always check latest pricing before major usage

## Summary

**Runner recommendation:** `ubuntu-latest` (2-core Linux) ✅

**Cost for public repos:**
- GitHub Actions: **$0** (free!)
- AI model: **$0.02-0.27 per task** (depends on model)
- **Total: $0.02-0.27 per task**

**Cost for private repos:**
- GitHub Actions: **$0.06 per 10-minute task**
- AI model: **$0.02-0.27 per task**
- **Total: $0.08-0.33 per task**

**Best value combination:**
- Public repository
- `ubuntu-latest` runner
- Kimi K2.5 model via OpenRouter
- **= $0.02 per task** 💰

**For $5/month:** Get ~250 automated coding tasks! 🚀
