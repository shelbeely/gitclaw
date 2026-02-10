# Multimodal and Image Generation Support

This document explains multimodal capabilities, image generation, and vision support in gitclaw.

## Quick Answer

**Q: Does gitclaw support image generation?**

**A: Technically possible, but NOT recommended.**

- ❌ Image generation: Not practical for gitclaw workflow
- ✅ Image analysis/vision: Fully supported and recommended!
- ✅ Code generation from images: Perfect use case

## Table of Contents

1. [Why Image Generation Isn't Ideal](#why-image-generation-isnt-ideal)
2. [What IS Supported: Vision/Analysis](#what-is-supported-visionanalysis)
3. [Gemini 3 Pro Image Preview](#gemini-3-pro-image-preview)
4. [Other Multimodal Models](#other-multimodal-models)
5. [Practical Workflows](#practical-workflows)
6. [Cost Comparison](#cost-comparison)
7. [Alternatives for Image Generation](#alternatives-for-image-generation)

---

## Why Image Generation Isn't Ideal

Even though OpenRouter supports image generation, gitclaw's architecture makes it impractical:

### The Limitations

1. **GitHub Issues Interface**
   - Issues are primarily text-based
   - No built-in image display for generated content
   - Would need manual download/viewing

2. **No Storage Workflow**
   - Generated images need somewhere to go
   - Git repos aren't ideal for binary image storage
   - No automated preview mechanism

3. **Agent Optimization**
   - Pi and OpenCode are coding agents
   - Optimized for text/code output
   - Not designed for image manipulation

4. **Better Tools Exist**
   - Direct OpenRouter API for image gen
   - Midjourney, DALL-E, Stable Diffusion
   - ComfyUI for advanced workflows

### Technical Possibility

Yes, you *could* technically:
- Use a model with image generation capability
- Configure it in gitclaw
- Generate images via the agent
- But you'd have no good way to view/use them

**Conclusion:** Use the right tool for the job!

---

## What IS Supported: Vision/Analysis

✅ **gitclaw EXCELS at vision/image analysis for code generation!**

### Supported Use Cases

1. **UI Screenshot → Code**
   ```
   Prompt: "Generate React component matching this design"
   Attach: ui-screenshot.png
   Result: Complete React component code
   ```

2. **Error Screenshot → Debug**
   ```
   Prompt: "Fix this error"
   Attach: error-screenshot.png  
   Result: Debugged code with explanation
   ```

3. **Diagram → Implementation**
   ```
   Prompt: "Implement this architecture"
   Attach: architecture-diagram.png
   Result: Code structure matching diagram
   ```

4. **Handwritten → Code**
   ```
   Prompt: "Convert this pseudocode to Python"
   Attach: whiteboard-photo.jpg
   Result: Clean Python implementation
   ```

### How It Works

1. **Attach image to GitHub issue** (drag and drop)
2. **Use vision-capable model:**
   ```yaml
   PI_PROVIDER: openrouter
   PI_MODEL: google/gemini-3-pro-image-preview
   ```
3. **Prompt the agent** to analyze the image
4. **Agent generates code** based on visual input

---

## Gemini 3 Pro Image Preview

User specifically asked about `google/gemini-3-pro-image-preview`.

### Model Details

**Name:** Nano Banana Pro (Gemini 3 Pro Image Preview)  
**Model ID:** `google/gemini-3-pro-image-preview`

**Pricing:**
- Input (text): $2.00 per 1M tokens
- Output (text): $12.00 per 1M tokens
- Image processing: $2.00 per 1M tokens
- Audio processing: $2.00 per 1M tokens
- Context: 65,536 tokens (65K)

**Capabilities:**
- ✅ Text input/output
- ✅ Image input (vision)
- ✅ Image generation (but see limitations above)
- ✅ Audio processing
- ✅ Multimodal reasoning

### Cost per Task

**Typical coding task (50K input, 10K output):**
```
Input:  50K × $2.00/1M  = $0.10
Output: 10K × $12.00/1M = $0.12
Total:  $0.22 per task
```

**With image analysis (add 1 image):**
```
Image:  1 image × ~$0.01 = $0.01
Total:  $0.23 per task
```

### When to Use Gemini 3 Pro Image

✅ **Best for:**
- Analyzing UI designs
- Processing screenshots
- Understanding diagrams
- Multimodal coding tasks
- Budget-conscious vision tasks

❌ **Not ideal for:**
- Simple text-only tasks (use cheaper models)
- Image generation output (workflow limitations)
- Very large codebases (65K context limit)

### Comparison to Other Vision Models

| Model | Input | Output | Context | Cost/Task |
|-------|-------|--------|---------|-----------|
| Gemini 3 Pro Image | $2/$12 | $2 image | 65K | $0.22 |
| Claude Opus 4.6 | $5/$25 | Vision | 1M | $0.50 |
| GPT-4o | $2.50/$10 | Vision | 128K | $0.18 |
| Gemini 2.0 Flash | $0.90/$3.60 | Vision | 1M | $0.08 |

### Configuration Example

```yaml
# In GitHub repo Variables
PI_PROVIDER: openrouter
PI_MODEL: google/gemini-3-pro-image-preview
```

Then in issue:
```markdown
Please analyze this UI mockup and generate the HTML/CSS code.

[Attach: ui-mockup.png]
```

---

## Other Multimodal Models

### For Vision/Analysis (Recommended)

**Budget:** Gemini 2.0 Flash Thinking  
- $0.90/$3.60 per 1M tokens
- 1M context
- ~$0.08 per task
- Best value for vision

**Balanced:** GPT-4o  
- $2.50/$10 per 1M tokens
- 128K context
- ~$0.18 per task
- Excellent vision quality

**Premium:** Claude Opus 4.6  
- $5/$25 per 1M tokens
- 1M context
- ~$0.50 per task
- Best for complex analysis

**Mid-tier:** Gemini 3 Pro Image Preview  
- $2/$12 per 1M tokens
- 65K context
- ~$0.22 per task
- Good balance

### For Image Generation (Not via gitclaw)

**Budget:** Flux Dev  
- $0.025 per image
- Fast generation
- Good quality

**Premium:** Flux Pro  
- $0.05 per image
- Higher quality
- More control

**Custom Text:** Sourceful RiverFlow v2  
- $0.10 per image
- Custom fonts
- Text rendering

**Standard:** DALL-E 3  
- $0.04-0.12 per image
- OpenAI quality
- Good balance

---

## Practical Workflows

### Workflow 1: UI to Code

**Setup:**
```yaml
PI_MODEL: google/gemini-3-pro-image-preview
```

**Process:**
1. Designer creates UI mockup
2. Attach mockup to GitHub issue
3. Prompt: "Generate React component for this design"
4. Agent analyzes image and generates code
5. Code committed to repository

**Cost:** ~$0.23 per component

### Workflow 2: Debug from Screenshot

**Setup:**
```yaml
PI_MODEL: openai/gpt-4o  # Excellent vision
```

**Process:**
1. Error occurs in production
2. Take screenshot of error
3. Attach to issue: "Fix this error"
4. Agent reads error, provides fix
5. Fix committed

**Cost:** ~$0.18 per debug session

### Workflow 3: Architecture Diagram to Code

**Setup:**
```yaml
PI_MODEL: anthropic/claude-opus-4.6  # Best for complex
```

**Process:**
1. Draw architecture diagram
2. Attach to issue: "Implement this architecture"
3. Agent understands structure
4. Generates complete implementation
5. Multi-file codebase created

**Cost:** ~$0.50-1.50 per architecture

### Workflow 4: Handwritten Pseudocode

**Setup:**
```yaml
PI_MODEL: google/gemini-2.0-flash-thinking-exp  # Cheap
```

**Process:**
1. Write algorithm on whiteboard
2. Take photo, attach to issue
3. Prompt: "Convert to Python"
4. Agent reads handwriting
5. Clean code generated

**Cost:** ~$0.08 per conversion

---

## Cost Comparison

### Vision Task Costs (per typical task)

| Model | Per Task | Best For |
|-------|----------|----------|
| Gemini 2.0 Flash | $0.08 | Budget, high volume |
| GPT-4o | $0.18 | Balanced quality/cost |
| Gemini 3 Pro Image | $0.22 | Multimodal, balanced |
| Claude Opus 4.6 | $0.50 | Complex analysis |

### Monthly Usage Estimates

**With Gemini 3 Pro Image Preview:**
```
10 vision tasks:  $2.20
50 vision tasks:  $11.00
100 vision tasks: $22.00
```

**Compare to text-only (Kimi K2.5):**
```
100 text tasks: $5.00
100 vision tasks: $22.00
Premium for vision: 4.4x
```

**Value proposition:**
- Vision enables new workflows
- Screenshots → code automation
- Design → implementation pipeline
- Worth the premium for visual tasks

---

## Alternatives for Image Generation

If you truly need image generation, use these instead:

### Direct OpenRouter API

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux/dev",
    "messages": [{
      "role": "user",
      "content": "beautiful sunset over mountains"
    }],
    "modalities": ["image"]
  }'
```

### Dedicated Image Tools

1. **Midjourney** - Best for creative art
2. **DALL-E 3** - OpenAI's image generator
3. **Stable Diffusion** - Open source, self-hosted
4. **ComfyUI** - Advanced workflow automation
5. **Flux** - Fast, affordable generation

### Hybrid Approach

1. Generate images with dedicated tools
2. Analyze generated images with gitclaw
3. Generate code from analysis
4. Best of both worlds!

---

## Summary

### What Works

✅ **Gemini 3 Pro Image Preview in gitclaw:**
- Vision/image analysis
- Screenshot to code
- Diagram understanding
- Error debugging from images
- Multimodal reasoning

### What Doesn't

❌ **Image generation in gitclaw:**
- No display mechanism
- No storage workflow
- Better tools exist
- Not the right use case

### Recommendation

**Use gitclaw for:**
- Visual input → code output
- Image analysis workflows
- Design-to-code automation

**Use other tools for:**
- Image generation
- Visual content creation
- Artwork/graphics

### Bottom Line

**Even with Gemini 3 Pro Image Preview (or any image generation model), the workflow limitations remain.**

But the good news: **gitclaw is EXCELLENT at vision-to-code workflows!**

Use it to analyze images and generate code. That's where it shines! 🚀

---

## Configuration Examples

### Example 1: Gemini 3 Pro for Vision

```yaml
# Repository Variables
PI_PROVIDER: openrouter
PI_MODEL: google/gemini-3-pro-image-preview

# Repository Secrets
OPENROUTER_API_KEY: sk-or-v1-...
```

### Example 2: Claude Opus for Complex Vision

```yaml
PI_PROVIDER: openrouter
PI_MODEL: anthropic/claude-opus-4.6
```

### Example 3: Budget Vision with Gemini Flash

```yaml
PI_PROVIDER: openrouter
PI_MODEL: google/gemini-2.0-flash-thinking-exp
```

---

**Questions?** See the [FAQ in README](README.md#faq) or open an issue!
