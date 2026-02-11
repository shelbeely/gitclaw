# Security Considerations for Skip-Permissions Mode

## Overview

The `DANGEROUSLY_SKIP_PERMISSIONS` option removes the default security check that restricts the agent to repository owners, members, and collaborators. This document explains the implications and best practices.

## Default Security Model

**Without skip-permissions (default and recommended):**
- Only users with OWNER, MEMBER, or COLLABORATOR association can trigger the agent
- Protects against API cost abuse from random users
- Prevents malicious usage in public repositories
- Your API keys are safe from unauthorized usage

## Skip-Permissions Mode

**With `DANGEROUSLY_SKIP_PERMISSIONS=true`:**
- **Anyone** can open issues or comment to trigger the agent
- No authentication or authorization checks are performed
- All workflow runs consume your API credits and GitHub Actions minutes

## Risk Assessment

### Critical Risks (⚠️ High Impact)

1. **Unlimited API Costs**
   - Malicious users can create issues/comments repeatedly
   - Each trigger consumes your API provider credits
   - No rate limiting by default
   - **Potential damage**: $100s-$1000s in unexpected charges

2. **API Quota Exhaustion**
   - Providers have rate limits (requests per minute/day)
   - Abuse can lock you out of your API access
   - Affects all your projects using the same API key
   - **Potential damage**: Service disruption

3. **GitHub Actions Minutes**
   - Each workflow run consumes GitHub Actions minutes
   - Public repos: 2000 minutes/month free, then $0.008/minute
   - Private repos: 500-50000 minutes/month depending on plan
   - **Potential damage**: Exhausted free tier, unexpected GitHub charges

### Moderate Risks (⚠️ Medium Impact)

4. **Repository Spam**
   - Malicious users can create many issues
   - Session files and git history grow large
   - Repository becomes cluttered
   - **Potential damage**: Degraded repository usability

5. **Reputation Damage**
   - Public repository showing abuse patterns
   - Other users may be discouraged from contributing
   - **Potential damage**: Community perception issues

### Low Risks (✓ Mitigated)

6. **Secret Exposure** - NOT A RISK
   - GitHub Actions secrets are never exposed to workflow logs
   - API keys remain secure even in public repositories
   - Users cannot read secret values
   - ✓ **No risk**: Secrets are protected by GitHub

## Mitigation Strategies

### Essential (Must Implement All)

1. **Use Budget-Friendly Models**
   ```
   PI_PROVIDER = openrouter
   PI_MODEL = kimi/k2.5  # $0.45/$2.25 per 1M tokens
   ```
   - Kimi K2.5: ~$0.02-0.10 per interaction
   - Avoids expensive models like Claude 3.5 ($0.30+ per interaction)

2. **Limit Run Duration**
   ```
   AGENT_TIMEOUT_MINUTES = 60  # 1 hour max
   MAX_CONTINUATION_RUNS = 1   # No chaining
   ```
   - Reduces per-issue cost dramatically
   - 1-hour runs are usually sufficient for most tasks

3. **Set Up Billing Alerts**
   - Configure alerts on your AI provider account
   - Set daily/monthly spending limits
   - Get notified before costs spiral

4. **Use Dedicated API Keys**
   - Create separate API keys for gitclaw
   - Set per-key spending limits if provider supports it
   - Easier to revoke if abused

### Recommended (Strong Protection)

5. **Monitor Usage Actively**
   - Check GitHub Actions tab daily
   - Review API provider dashboard
   - Watch for unusual patterns

6. **Add Issue Templates**
   - Create `.github/ISSUE_TEMPLATE/config.yml` to guide users
   - Explain expected behavior
   - Discourage abuse

7. **Enable Discussions**
   - Use GitHub Discussions for questions
   - Reserve issues for actual agent work
   - Reduces casual triggering

8. **Repository Settings**
   - Disable "Allow forking" if you don't need it
   - Enable "Require approval for first-time contributors" in Actions settings
   - Watch repository to get notifications

### Advanced (Additional Protection)

9. **Implement Rate Limiting**
   - Modify workflow to track usage per user
   - Add cooldown periods between runs
   - Block users after X runs in Y time

10. **Cost Caps in Code**
    - Track accumulated costs in session state
    - Stop after reaching threshold
    - Requires custom modification to lifecycle/main.ts

11. **Allowlist Mode**
    - Create a list of trusted GitHub usernames
    - Only allow those users even with skip-permissions
    - Requires custom workflow modification

## Recommended Use Cases

### ✅ Good Use Cases

1. **Private Demo Repositories**
   - Show off capabilities to specific audience
   - Invite-only with trusted users
   - Private repo protects from public abuse

2. **Internal Team Tools**
   - Company private repository
   - All employees are trusted
   - Shared budget for AI usage

3. **Educational Workshops**
   - Time-limited workshop environment
   - Participants need quick access
   - Monitor during the workshop

4. **Testing & Development**
   - Test accounts that aren't collaborators
   - Temporary enablement for development
   - Disable when done

### ❌ Bad Use Cases

1. **Public Open Source Projects**
   - Anyone on internet can trigger
   - High risk of abuse
   - Consider keeping default permissions

2. **Unmaintained Repositories**
   - No active monitoring
   - Won't notice abuse quickly
   - Costs can accumulate

3. **Repositories with Expensive Models**
   - GPT-4, Claude 3.5 cost $0.30-0.60 per interaction
   - Skip-permissions + expensive models = $$$
   - Use cheap models only

## Example Safe Configuration

### Minimal Risk Configuration
```yaml
# Repository Variables (Settings → Actions → Variables)
DANGEROUSLY_SKIP_PERMISSIONS = true
PI_PROVIDER = openrouter
PI_MODEL = kimi/k2.5
AGENT_TIMEOUT_MINUTES = 60
MAX_CONTINUATION_RUNS = 1
PI_THINKING = low
```

**Expected costs with this config:**
- Per interaction: $0.02 - $0.05
- Per hour: $0.12 - $0.30
- Maximum per issue: ~$0.30 (1 hour, 1 run)
- 100 issues/month: ~$30

**With billing alerts at $50/month:**
- Get warned before excessive use
- Time to disable if abused
- Manageable budget

## Disabling Skip-Permissions

If you need to disable it:

1. **Immediate (Emergency):**
   ```bash
   # In Settings → Actions → Variables
   # Delete or set to false:
   DANGEROUSLY_SKIP_PERMISSIONS = false
   ```

2. **Prevent Pending Workflows:**
   - Go to Actions tab
   - Cancel any queued workflows
   - Prevents already-triggered runs

3. **Revoke API Keys (If Abused):**
   - Revoke the compromised API key
   - Create new API key
   - Update GitHub secrets

## Monitoring Checklist

Daily monitoring (if skip-permissions enabled):
- [ ] Check GitHub Actions runs count
- [ ] Review AI provider dashboard for unusual usage
- [ ] Look for spam issues/comments
- [ ] Verify costs are within expected range

Weekly monitoring:
- [ ] Review total GitHub Actions minutes used
- [ ] Check API provider monthly spend-to-date
- [ ] Audit issue creators (any suspicious accounts?)
- [ ] Consider if skip-permissions is still needed

## Alternatives to Skip-Permissions

Instead of enabling skip-permissions, consider:

1. **Add Users as Collaborators**
   - Invite trusted users to repository
   - Gives them COLLABORATOR permission
   - Avoids skip-permissions risks

2. **Create GitHub Team**
   - Organization-level teams
   - Grant team access to repository
   - All team members can trigger agent

3. **Use Forks**
   - Users fork the repository
   - Set up their own API keys
   - Each user controls their own costs

4. **Scheduled Batch Processing**
   - Collect requests in discussions/wiki
   - Owner processes them periodically
   - Manual but safe

## Summary

**Skip-permissions is like leaving your front door unlocked:**
- Convenient for visitors
- But anyone can walk in
- And use your resources

**Only enable if:**
- You understand and accept the risks
- You implement multiple mitigation strategies
- You actively monitor usage
- You use budget-friendly models
- You have billing alerts configured

**Default permissions are secure by design. Skip-permissions is an advanced feature for specific use cases only.**

## Questions?

If you're unsure whether to enable skip-permissions:
- **Don't enable it** - the default is secure
- Add specific users as collaborators instead
- Consider the alternatives listed above

The small inconvenience of managing collaborators is worth avoiding potential abuse and unexpected costs.
