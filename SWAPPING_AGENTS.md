# Swapping Out the Pi Coding Agent

Yes! You can swap pi out for a different coding agent. This guide explains how gitclaw integrates with pi and what you'd need to replicate to use an alternative agent.

> **Note:** Interested in OpenClaw? See [OPENCLAW_VS_GITCLAW.md](OPENCLAW_VS_GITCLAW.md) for how OpenClaw and gitclaw relate to each other (spoiler: they're complementary, not competitive).

## Current Architecture

```
GitHub Issue/Comment
    ↓
GitHub Actions Workflow
    ↓
lifecycle/main.ts
    ↓
bunx pi (pi-coding-agent)
    ↓
AI Provider (OpenRouter/Anthropic/OpenAI)
    ↓
Tool Execution (read, write, edit, bash)
    ↓
Git commit & push
    ↓
Comment on issue
```

## Pi Integration Points

### 1. Package Dependency

**Current:** `package.json`
```json
{
  "dependencies": {
    "@mariozechner/pi-coding-agent": "^0.52.5"
  }
}
```

**To swap:** Replace with your chosen agent's npm package or installation method.

### 2. Command Execution

**Current:** `lifecycle/main.ts` line 205
```typescript
const piArgs = [
  "bunx", "pi", 
  "--mode", "json",
  "--session-dir", "./state/sessions",
  "-p", prompt
];

// Session resumption
if (mode === "resume" && sessionPath) {
  piArgs.push("--session", sessionPath);
}

// Provider configuration
if (provider) piArgs.push("--provider", provider);
if (model) piArgs.push("--model", model);
if (thinking) piArgs.push("--thinking", thinking);

// Execute
const pi = Bun.spawn(piArgs, { stdout: "pipe", stderr: "ignore" });
```

**To swap:** Replace with your agent's CLI invocation.

### 3. Output Parsing

**Current:** `lifecycle/main.ts` lines 224-235
```typescript
// Pi outputs JSONL format
const tee = Bun.spawn(["tee", "/tmp/agent-raw.jsonl"], { 
  stdin: pi.stdout, 
  stdout: "inherit" 
});

// Extract final message text
const jq = Bun.spawn([
  "jq", "-r", "-s",
  '[ .[] | select(.type == "message_end") ] | .[0].message.content[] | select(.type == "text") | .text'
], { stdin: tac.stdout, stdout: "pipe" });

const agentText = await new Response(jq.stdout).text();
```

**To swap:** Adapt to your agent's output format.

### 4. Session Management

**Current:** 
- Sessions stored as JSONL files in `state/sessions/`
- Mapping files in `state/issues/{issueNumber}.json`
- Resume via `--session` flag

**To swap:** Implement equivalent session persistence for your agent.

## Requirements for Alternative Agents

Any replacement agent must support:

### Essential Features

1. **Non-Interactive Execution**
   - Must accept prompts via CLI
   - No interactive TUI required
   - Batch/scripted execution

2. **Tool Capabilities**
   - File reading
   - File writing/editing
   - Bash command execution
   - Directory navigation

3. **Session Persistence**
   - Save conversation history
   - Resume from previous state
   - Context retention across runs

4. **Structured Output**
   - Parseable response format
   - Extract agent's text response
   - Separate from tool outputs

5. **Provider Configuration**
   - Support multiple AI providers
   - Configurable models
   - API key management

### Optional (Nice to Have)

- Thinking level control
- Tool restrictions
- Timeout handling
- Cost estimation

## Alternative Coding Agents

### 1. Aider (aider.chat)

**Pros:**
- Excellent git integration
- Strong code editing capabilities
- Multiple AI provider support
- Specialized in coding tasks

**Integration Example:**
```typescript
const aiderArgs = [
  "aider",
  "--yes",              // Auto-approve changes
  "--message", prompt,
  "--model", model,
  "--no-pretty",        // Plain output
  "--message-file", "/tmp/prompt.txt"
];
```

**Challenges:**
- Different session format
- Output parsing differs
- May need wrapper script

**Best for:** Direct code modifications, refactoring

### 2. GPT Engineer

**Pros:**
- Full project generation
- Planning phase
- Multiple file operations

**Integration Example:**
```typescript
const gptEngineerArgs = [
  "gpte",
  prompt,
  "--model", model,
  "--no-interactive"
];
```

**Challenges:**
- Project-focused (not single-task)
- Different execution model
- Less mature than pi

**Best for:** New project scaffolding

### 3. Claude Code (Cursor)

**Pros:**
- Excellent code understanding
- IDE-quality suggestions
- Strong refactoring

**Challenges:**
- Primarily IDE-based
- Limited CLI interface
- May require API wrapper

**Best for:** Complex refactoring in existing codebases

### 4. Devon

**Pros:**
- Autonomous agent
- Web research capabilities
- Full development workflow

**Challenges:**
- Requires Devon platform
- More complex setup
- Different architecture

**Best for:** Research-heavy tasks

### 5. Custom Implementation

Build your own agent wrapper:

```typescript
// Example: OpenAI + Custom Tools
import OpenAI from 'openai';

async function runCustomAgent(prompt: string, sessionPath?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Load session history
  let messages = sessionPath ? loadSession(sessionPath) : [];
  messages.push({ role: 'user', content: prompt });
  
  // Run with function calling
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: [readFileTool, writeFileTool, bashTool]
  });
  
  // Execute tool calls
  while (response.finish_reason === 'tool_calls') {
    for (const toolCall of response.tool_calls) {
      const result = await executeTool(toolCall);
      messages.push({ role: 'tool', content: result });
    }
    // Continue conversation...
  }
  
  return response.content;
}
```

**Pros:**
- Full control
- Optimized for your use case
- No external dependencies

**Challenges:**
- Significant development effort
- Tool implementation required
- Maintenance burden

## Step-by-Step Swap Process

### 1. Choose Your Agent

Evaluate based on:
- Task requirements
- Provider compatibility
- CLI support
- Community/documentation
- Cost

### 2. Update Dependencies

```bash
# Remove pi
npm uninstall @mariozechner/pi-coding-agent

# Install alternative
npm install your-agent-package
# or
pip install your-agent
```

### 3. Modify lifecycle/main.ts

Replace the agent execution section (~lines 204-235):

```typescript
// OLD: Pi execution
const piArgs = ["bunx", "pi", "--mode", "json", ...];

// NEW: Your agent
const agentArgs = ["your-agent", "--flag", value, ...];
const agent = Bun.spawn(agentArgs, { stdout: "pipe" });
```

### 4. Adapt Output Parsing

Update to match your agent's output format:

```typescript
// OLD: JSONL parsing with jq
const jq = Bun.spawn(["jq", "-r", ...]);

// NEW: Your format
const agentText = await parseYourAgentOutput(agent.stdout);
```

### 5. Update Session Handling

Implement session management for your agent:

```typescript
// Load previous session
const sessionData = loadYourAgentSession(sessionPath);

// Pass to agent
agentArgs.push("--session", sessionData);

// Save new session
saveYourAgentSession(sessionPath, newSessionData);
```

### 6. Test Thoroughly

```bash
# Test basic execution
bun lifecycle/main.ts

# Test session resumption
# Test provider configuration
# Test error handling
```

### 7. Update Documentation

- README.md: Update agent references
- Configuration docs: New flags/options
- Cost estimates: If pricing differs

## Comparison Matrix

| Feature | Pi | Aider | GPT Engineer | Custom |
|---------|-----|-------|--------------|--------|
| CLI Support | ✅ | ✅ | ✅ | ✅ |
| Session Persistence | ✅ | ⚠️ | ❌ | Custom |
| Multi-Provider | ✅ | ✅ | ⚠️ | Custom |
| Structured Output | ✅ | ⚠️ | ❌ | Custom |
| Git Integration | ✅ | ✅✅ | ✅ | Custom |
| Code Understanding | ✅ | ✅ | ⚠️ | Custom |
| Community | ⚠️ | ✅ | ⚠️ | N/A |
| Maintenance | Active | Active | Mixed | You |

Legend: ✅ Full support, ⚠️ Partial/requires work, ❌ Not available

## Example: Aider Integration

Complete example of swapping to Aider:

### 1. Install Aider

```bash
npm uninstall @mariozechner/pi-coding-agent
pip install aider-chat
```

### 2. Modify lifecycle/main.ts

```typescript
// Replace agent execution section
const aiderArgs = [
  "aider",
  "--yes",                    // Auto-approve all changes
  "--no-pretty",              // Plain output for parsing
  "--message", prompt,
  "--model", model || "gpt-4o",
  "--no-auto-commits"         // We handle commits
];

if (mode === "resume" && sessionPath) {
  // Aider uses .aider directory for history
  aiderArgs.push("--restore-chat-history");
}

// Execute Aider
const aider = Bun.spawn(aiderArgs, {
  stdout: "pipe",
  stderr: "pipe",
  cwd: process.cwd()
});

// Capture output
const output = await new Response(aider.stdout).text();
const agentText = extractAiderResponse(output);
```

### 3. Add Output Parser

```typescript
function extractAiderResponse(aiderOutput: string): string {
  // Aider outputs include prompts and responses
  // Extract just the assistant's final message
  const lines = aiderOutput.split('\n');
  const responseLines = [];
  let inResponse = false;
  
  for (const line of lines) {
    if (line.includes('Assistant:')) {
      inResponse = true;
      continue;
    }
    if (inResponse && !line.startsWith('>')) {
      responseLines.push(line);
    }
  }
  
  return responseLines.join('\n').trim();
}
```

### 4. Update .gitignore

```bash
# Aider creates .aider directory
echo ".aider/" >> .gitignore
echo ".aider.chat.history.md" >> .gitignore
```

### 5. Test

```bash
# Trigger via issue comment
# Verify Aider executes
# Check output formatting
# Confirm git commits work
```

## Troubleshooting

### Issue: Agent doesn't support non-interactive mode

**Solution:** Write a wrapper script:
```bash
#!/bin/bash
echo "$PROMPT" | your-agent --stdin
```

### Issue: Output format incompatible

**Solution:** Add parser function:
```typescript
function parseAgentOutput(raw: string): string {
  // Extract meaningful response
  // Remove prompts, tool outputs, etc.
  return cleaned;
}
```

### Issue: Session format differs

**Solution:** Convert sessions:
```typescript
function convertToAgentSession(piSession: string): AgentSession {
  const pi = JSON.parse(piSession);
  return {
    messages: pi.messages.map(convertMessage),
    // ... other fields
  };
}
```

### Issue: No CLI available

**Solution:** Build API wrapper:
```typescript
import { YourAgentSDK } from 'agent-sdk';

async function runAgent(prompt: string) {
  const sdk = new YourAgentSDK();
  const result = await sdk.execute({
    prompt,
    tools: ['read', 'write', 'bash']
  });
  return result.text;
}
```

## Recommendations

### Stick with Pi if:
- ✅ Works well for your use case
- ✅ Provides needed tool capabilities
- ✅ Good provider support
- ✅ Active maintenance

### Consider Swapping if:
- ❌ Need specific features pi lacks
- ❌ Better git integration needed (→ Aider)
- ❌ Project-level generation (→ GPT Engineer)
- ❌ Special domain requirements
- ❌ Cost optimization needs

### Best Practices

1. **Test Incrementally**
   - Start with simple tasks
   - Verify output format
   - Check session handling

2. **Maintain Compatibility**
   - Keep session format convertible
   - Document breaking changes
   - Version your modifications

3. **Monitor Carefully**
   - Log agent outputs
   - Track success rates
   - Measure costs

4. **Document Everything**
   - Integration steps
   - Quirks and workarounds
   - Configuration changes

## Community Integrations

Have you swapped pi for another agent? Share your experience!

- Create a PR with your integration guide
- Add to this document under "Community Examples"
- Help others learn from your experience

## Conclusion

**Yes, you can swap pi out!** The architecture is flexible:

- Pi is invoked via CLI (easy to replace)
- Output is parsed (adaptable to other formats)
- Sessions are files (convertible)
- Tools are standard (most agents have equivalents)

**The key is matching:**
1. Non-interactive execution ✓
2. Tool capabilities ✓
3. Session persistence ✓
4. Structured output ✓

With some adaptation work, most modern coding agents can slot in as replacements. The effort ranges from minimal (Aider) to significant (custom implementation), but it's definitely doable!

**Need help?** Open an issue describing:
- Which agent you want to use
- Specific integration challenges
- Your use case requirements

The community can help guide your integration! 🚀
