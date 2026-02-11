# Cost Estimation Guide

This guide helps you estimate the costs of running gitclaw with different AI providers and models.

## Understanding Costs

AI providers charge based on:
- **Input tokens**: Tokens you send (prompts, code, context)
- **Output tokens**: Tokens the model generates (responses, code changes)
- **Context window**: Maximum tokens the model can process at once

gitclaw is designed for coding tasks which typically involve:
- Large input contexts (reading files, session history)
- Moderate output (code changes, explanations)
- Extended conversations (session persistence)

## Cost Calculation Formula

```
Total Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

**Typical Usage Pattern:**
- **Input tokens**: 20,000 - 100,000 per interaction (code files, session history)
- **Output tokens**: 5,000 - 20,000 per interaction (code changes, explanations)
- **Average interaction**: ~50,000 input + 10,000 output tokens

## Provider Pricing

### MoonshotAI: Kimi K2.5 (262K Context)

**Pricing:**
- Input: $0.45 per 1M tokens
- Output: $2.25 per 1M tokens
- Context window: 262,144 tokens

**Cost Examples:**

| Usage Pattern | Input Tokens | Output Tokens | Cost per Interaction | Cost per Hour* |
|--------------|--------------|---------------|---------------------|----------------|
| Small task | 20,000 | 5,000 | $0.020 | $0.12 |
| Medium task | 50,000 | 10,000 | $0.045 | $0.27 |
| Large task | 100,000 | 20,000 | $0.090 | $0.54 |
| Full context | 200,000 | 30,000 | $0.158 | $0.95 |

*Assumes ~6 interactions per hour for continuous work

**6-Hour Run (Single Autonomous Session):**
- Small tasks: $0.72 - $1.08
- Medium tasks: $1.62 - $2.43
- Large tasks: $3.24 - $4.86
- Full context usage: $5.70 - $8.55

**24-Hour Run (With Auto-Continuation):**
- Small tasks: $2.88 - $4.32
- Medium tasks: $6.48 - $9.72
- Large tasks: $12.96 - $19.44
- Full context usage: $22.80 - $34.20

### Anthropic Claude 3.5 Sonnet (200K Context)

**Pricing:**
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens
- Context window: 200,000 tokens

**Cost Examples:**

| Usage Pattern | Input Tokens | Output Tokens | Cost per Interaction | Cost per Hour* |
|--------------|--------------|---------------|---------------------|----------------|
| Small task | 20,000 | 5,000 | $0.135 | $0.81 |
| Medium task | 50,000 | 10,000 | $0.300 | $1.80 |
| Large task | 100,000 | 20,000 | $0.600 | $3.60 |

**6-Hour Run:** $4.86 - $21.60  
**24-Hour Run:** $19.44 - $86.40

### OpenAI GPT-4o (128K Context)

**Pricing:**
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens
- Context window: 128,000 tokens

**Cost Examples:**

| Usage Pattern | Input Tokens | Output Tokens | Cost per Interaction | Cost per Hour* |
|--------------|--------------|---------------|---------------------|----------------|
| Small task | 20,000 | 5,000 | $0.100 | $0.60 |
| Medium task | 50,000 | 10,000 | $0.225 | $1.35 |
| Large task | 100,000 | 20,000 | $0.450 | $2.70 |

**6-Hour Run:** $3.60 - $16.20  
**24-Hour Run:** $14.40 - $64.80

### OpenRouter Pricing

OpenRouter provides access to multiple models with unified billing. Prices vary by model:

- **Kimi K2.5**: $0.45/$2.25 per 1M tokens (same as direct MoonshotAI)
- **Claude 3.5 Sonnet**: $3.00/$15.00 per 1M tokens
- **GPT-4o**: $2.50/$10.00 per 1M tokens
- **Budget models**: As low as $0.10/$0.50 per 1M tokens

## Cost Optimization Strategies

### 1. Choose the Right Model

**For budget-conscious users:**
- **MoonshotAI Kimi K2.5**: Best price/performance ratio
- Large context window (262K) means better session continuity
- Estimated $1-5 per 6-hour autonomous build

**For maximum capability:**
- **Anthropic Claude 3.5 Sonnet**: Premium reasoning
- Higher cost but potentially faster completion
- Estimated $5-22 per 6-hour build

### 2. Optimize Context Usage

**Reduce costs by:**
- Using focused prompts (don't include unnecessary context)
- Breaking large projects into smaller issues
- Using read-only tools for analysis (cheaper than full edits)
- Enabling `--thinking low` for routine tasks

### 3. Session Management

**Cost-effective practices:**
- Close completed sessions (prevents context accumulation)
- Use continuation wisely (only for tasks that truly need >6 hours)
- Consider manual multi-issue approach for very large projects

### 4. Model Selection by Task Type

| Task Type | Recommended Model | Reasoning |
|-----------|------------------|-----------|
| Quick bug fixes | Kimi K2.5, GPT-4o-mini | Low cost, fast |
| Code review | Kimi K2.5 | Good quality, affordable |
| Complex refactoring | Claude 3.5 Sonnet | Best reasoning |
| Large app builds (24h) | Kimi K2.5 | Best budget for long runs |
| Documentation | Kimi K2.5, GPT-4o | Good quality, moderate cost |

## Budget Planning

### Conservative Budget (Small Projects)
- **Model**: Kimi K2.5 or GPT-4o-mini
- **Usage**: 10 issues/month, avg 2 hours each
- **Estimated cost**: $10-20/month

### Moderate Budget (Active Development)
- **Model**: Kimi K2.5 or GPT-4o
- **Usage**: 20 issues/month, avg 4 hours each
- **Estimated cost**: $40-80/month

### Intensive Budget (Heavy Usage)
- **Model**: Mix of Kimi K2.5 and Claude 3.5
- **Usage**: 40 issues/month, some 24-hour builds
- **Estimated cost**: $150-300/month

## Real-World Example: Building a Todo App

**Task**: Build complete Next.js todo app from scratch

**Estimated Requirements:**
- Setup and configuration: 30 min
- Core features implementation: 2-3 hours
- Testing and debugging: 1-2 hours
- Total: ~4 hours, ~24 interactions

**Cost Estimates by Provider:**

| Provider | Model | Estimated Cost |
|----------|-------|----------------|
| MoonshotAI | Kimi K2.5 | $1.08 - $2.16 |
| OpenAI | GPT-4o | $2.40 - $4.80 |
| Anthropic | Claude 3.5 | $3.24 - $6.48 |

**Winner**: Kimi K2.5 offers best value (~$1-2 for a complete working app)

## Monitoring Costs

### Track Usage

Monitor your costs by:
1. Checking provider dashboards for token usage
2. Logging session token counts in git commit messages
3. Using provider billing alerts
4. Reviewing GitHub Actions minutes usage

### Cost Control Variables

Set limits in repository configuration:
```
AGENT_TIMEOUT_MINUTES = 180  # Limit to 3 hours instead of 6
MAX_CONTINUATION_RUNS = 2    # Limit to 12 hours instead of 24
```

## Frequently Asked Questions

**Q: Why is Kimi K2.5 so much cheaper?**  
A: MoonshotAI offers competitive pricing to gain market share. The 262K context window also means better session efficiency.

**Q: Does higher cost mean better quality?**  
A: Not always. For coding tasks, Kimi K2.5 and GPT-4o offer excellent quality at lower cost. Claude 3.5 excels at complex reasoning but costs more.

**Q: How can I reduce costs further?**  
A: Use shorter sessions, focused prompts, and lower thinking levels. The `PI_THINKING=low` setting can significantly reduce token usage.

**Q: What about free tiers?**  
A: Most providers don't offer sufficient free tiers for autonomous coding. Budget $20-50/month for regular development work.

**Q: Can I mix different models?**  
A: Yes! Use cheaper models for routine work and premium models for complex tasks. OpenRouter makes this easy.

## Summary

**Best Value**: MoonshotAI Kimi K2.5
- $1-5 per 6-hour autonomous build
- Excellent 262K context window
- Good code generation quality
- **Recommended for most users**

**Best Quality**: Anthropic Claude 3.5 Sonnet  
- $5-22 per 6-hour build
- Superior reasoning and code quality
- Use for critical or complex projects

**Good Balance**: OpenAI GPT-4o
- $3-16 per 6-hour build
- Reliable and well-tested
- Good middle ground
