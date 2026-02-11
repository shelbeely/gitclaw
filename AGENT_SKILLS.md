# Agent Skills Support in Gitclaw

## Quick Answer

**Yes, gitclaw fully supports Agent Skills!** ✅

Pi (the coding agent powering gitclaw) has a comprehensive skills system that allows modular extension of capabilities. Skills are self-contained packages that provide specialized knowledge, workflows, and tools.

## What Are Agent Skills?

Skills are modular packages that extend the agent's capabilities by providing:

1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific formats or APIs  
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex tasks

Think of skills as "onboarding guides" that transform the agent from general-purpose to specialized for specific domains or tasks.

## Skills in Gitclaw

### Current Skills

Gitclaw includes these built-in skills:

**1. `memory` - Session Memory Management**
- Searches and recalls information from past sessions
- Manages memory logs and conversation history
- Location: `.pi/skills/memory/`

**2. `skill-creator` - Skill Development**
- Creates or updates new skills
- Provides templates and packaging tools
- Location: `.pi/skills/skill-creator/`

### How Skills Work

Skills use a **progressive disclosure** system to manage context efficiently:

```
1. Metadata (name + description) → Always in context (~100 words)
2. SKILL.md body → Loaded when skill triggers (<5k words)
3. Bundled resources → Loaded as needed (unlimited)
```

### Skill Structure

Every skill follows this structure:

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter
│   │   ├── name: skill-name
│   │   └── description: When to use this skill
│   └── Markdown instructions
└── Optional resources/
    ├── scripts/      - Executable code (Python/Bash/etc.)
    ├── references/   - Documentation loaded as needed
    └── assets/       - Files used in output (templates, etc.)
```

## Creating Custom Skills

### Prerequisites

You can create custom skills for your gitclaw repository to extend its capabilities.

### Steps to Create a Skill

**1. Initialize the skill:**
```bash
.pi/skills/skill-creator/scripts/init_skill.py my-skill --path .pi/skills
```

**2. Edit SKILL.md:**
```yaml
---
name: my-skill
description: What this skill does and when to use it
---

# My Skill

Instructions for using this skill...
```

**3. Add resources (optional):**
- `scripts/` - Python/Bash scripts
- `references/` - Documentation files
- `assets/` - Templates or files for output

**4. Package the skill:**
```bash
.pi/skills/skill-creator/scripts/package_skill.py .pi/skills/my-skill
```

**5. Commit to repository:**
```bash
git add .pi/skills/my-skill
git commit -m "Add my-skill"
```

The skill will automatically be available in all future runs!

## Image Generation Plugin

### Question: How Much Work?

**Answer: LOW-MEDIUM effort (2-8 hours)**

Creating an image generation skill is straightforward thanks to pi's skills system!

### Effort Estimation

**Basic implementation: 2-4 hours**
- SKILL.md with triggering rules
- Python script for OpenRouter API
- Basic image storage workflow
- Simple error handling

**Production-ready: 4-8 hours**
- Multiple model support (Flux, DALL-E, etc.)
- Configuration options (size, aspect ratio, style)
- Robust error handling and retries
- Cost tracking and budgets
- Model selection guidance
- Comprehensive testing

### Implementation Guide

#### Step 1: Create Skill Structure

```bash
cd .pi/skills
mkdir image-generation
cd image-generation
```

#### Step 2: Create SKILL.md

```yaml
---
name: image-generation
description: Generate images using AI models via OpenRouter. Use when user requests image creation, artwork, graphics, or visual content generation. Triggers on phrases like "generate image", "create artwork", "make a picture".
---

# Image Generation

Generate images using OpenRouter's image generation models.

## Supported Models

- **flux/dev** - Fast, general-purpose ($0.025/image)
- **flux/pro** - High quality ($0.05/image)
- **dall-e-3** - OpenAI's DALL-E ($0.04-0.12/image)
- **sourceful/riverflow-v2** - Custom fonts ($0.10/image)

## Usage

When user requests image generation:

1. Confirm the prompt and specifications
2. Run `scripts/generate_image.py`
3. Upload result to GitHub artifacts
4. Post artifact URL in issue comment

## Configuration

Use environment variables:
- `IMAGE_MODEL` - Model to use (default: flux/dev)
- `IMAGE_SIZE` - Size (1K, 2K, 4K)
- `IMAGE_ASPECT` - Aspect ratio (1:1, 16:9, etc.)

See references/models.md for full model details.
```

#### Step 3: Create Generation Script

Create `scripts/generate_image.py`:

```python
#!/usr/bin/env python3
import os
import sys
import requests
import json
from pathlib import Path

def generate_image(prompt, model="flux/dev", size="2K", aspect="1:1"):
    """Generate image via OpenRouter API."""
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image"],
        "image_config": {
            "aspect_ratio": aspect,
            "image_size": size
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    result = response.json()
    
    # Extract image URL from response
    image_url = result["choices"][0]["message"]["content"]
    
    # Download image
    img_response = requests.get(image_url)
    img_response.raise_for_status()
    
    # Save to file
    output_path = Path("generated_image.png")
    output_path.write_bytes(img_response.content)
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: generate_image.py <prompt> [model] [size] [aspect]")
        sys.exit(1)
    
    prompt = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "flux/dev"
    size = sys.argv[3] if len(sys.argv) > 3 else "2K"
    aspect = sys.argv[4] if len(sys.argv) > 4 else "1:1"
    
    try:
        output = generate_image(prompt, model, size, aspect)
        print(f"✅ Image generated: {output}")
        print(f"📁 Upload to GitHub artifacts or external storage")
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
```

Make it executable:
```bash
chmod +x scripts/generate_image.py
```

#### Step 4: Add Reference Documentation

Create `references/models.md`:

```markdown
# Image Generation Models

## Budget Models

### flux/dev
- Cost: $0.025 per image
- Speed: Fast
- Best for: Quick iterations, prototypes

### dall-e-2
- Cost: $0.016-0.020 per image
- Speed: Fast
- Best for: Budget-conscious generation

## Premium Models

### flux/pro
- Cost: $0.05 per image
- Speed: Medium
- Best for: High quality output

### dall-e-3
- Cost: $0.04-0.12 per image
- Speed: Medium
- Best for: Photorealistic images

## Specialized

### sourceful/riverflow-v2
- Cost: $0.10 per image
- Speed: Slow
- Best for: Text rendering, custom fonts

## Configuration Options

**Aspect Ratios:**
- 1:1 - Square
- 16:9 - Widescreen
- 4:3 - Standard
- 21:9 - Ultrawide

**Sizes:**
- 1K - 1024px
- 2K - 2048px (recommended)
- 4K - 4096px (premium)
```

#### Step 5: Test the Skill

```bash
# Test image generation
export OPENROUTER_API_KEY="your-key"
python scripts/generate_image.py "sunset over mountains" flux/dev 2K 16:9
```

#### Step 6: Package and Deploy

```bash
# Package the skill
.pi/skills/skill-creator/scripts/package_skill.py .pi/skills/image-generation

# Commit to repo
git add .pi/skills/image-generation
git commit -m "Add image-generation skill"
git push
```

### Workflow in Gitclaw

**User workflow:**
1. User opens GitHub issue: "Generate an image of a sunset"
2. Agent detects image generation request
3. Skill triggers automatically
4. Script calls OpenRouter API
5. Image saved and uploaded
6. Artifact URL posted to issue

**Agent instructions in SKILL.md:**
```markdown
## GitHub Artifacts Workflow

1. Generate image using script
2. Upload to GitHub Actions artifacts:
   ```bash
   echo "::set-output name=artifact-path::./generated_image.png"
   ```
3. Post comment with artifact link:
   ```markdown
   🎨 Image generated! Download from [artifacts](link).
   ```
```

### Storage Options

**Option 1: GitHub Artifacts** (recommended)
- Pros: Free, integrated, temporary storage
- Cons: 90-day retention, requires download
- Implementation: Use Actions artifacts API

**Option 2: GitHub Issues** 
- Pros: Permanent, inline display
- Cons: Repository size growth
- Implementation: Attach as issue comment

**Option 3: External Storage** (imgur, cloudinary)
- Pros: Permanent, fast, shareable
- Cons: Additional service dependency
- Implementation: Upload to service, return URL

### Cost Considerations

**Per-image costs with flux/dev:**
- Image generation: $0.025
- GitHub Actions: $0 (public repo) or ~$0.01 (private)
- **Total: ~$0.025-0.035 per image**

**Monthly estimates:**
- 10 images: $0.25-0.35
- 50 images: $1.25-1.75
- 100 images: $2.50-3.50

## Best Practices

### When to Create a Skill

Create a skill when:
- ✅ Task is repeated frequently
- ✅ Domain-specific knowledge needed
- ✅ Complex multi-step workflows
- ✅ Custom scripts or tools required
- ✅ Company/project-specific context

Don't create a skill when:
- ❌ One-time task
- ❌ Agent already handles it well
- ❌ Adds unnecessary complexity

### Skill Design Principles

1. **Concise is key** - Keep SKILL.md under 500 lines
2. **Progressive disclosure** - Split large content into references
3. **Imperative form** - Use action-oriented language
4. **Concrete examples** - Show, don't just tell
5. **Test thoroughly** - Validate scripts before deployment

### Maintenance

**Updating skills:**
1. Edit files in `.pi/skills/skill-name/`
2. Test changes locally
3. Commit and push
4. Changes apply immediately to new runs

**Removing skills:**
```bash
rm -rf .pi/skills/skill-name
git commit -am "Remove skill-name skill"
```

## Advanced Topics

### Multi-File Skills

Large skills can split content:

```
complex-skill/
├── SKILL.md (overview + navigation)
└── references/
    ├── setup.md
    ├── api.md
    ├── examples.md
    └── troubleshooting.md
```

### Conditional Loading

```markdown
## Basic Usage

[Simple instructions]

For advanced features, see references/advanced.md
```

Agent only loads advanced.md when needed.

### Domain-Specific Organization

```
bigquery-skill/
├── SKILL.md
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```

Agent loads only relevant domain file.

## Examples

### Real Skill: Memory Management

See `.pi/skills/memory/SKILL.md` for a production example of:
- Clear triggering description
- Concise instructions
- Practical code examples
- Progressive disclosure

### Potential Skills for Gitclaw

**Code-focused:**
- `security-audit` - Automated security scanning
- `performance-analysis` - Code performance profiling
- `documentation-generator` - Auto-generate docs

**Integration-focused:**
- `deployment-helper` - Deploy to various platforms
- `database-migration` - Schema migrations
- `api-testing` - Automated API tests

**Creative-focused:**
- `image-generation` - AI image creation (covered above)
- `diagram-creator` - Generate diagrams from descriptions
- `markdown-formatter` - Beautiful markdown output

## FAQ

### Q: Do skills work in OpenCode too?

**A:** No, skills are pi-specific. OpenCode has its own architecture. If using OpenCode as your agent (`AGENT_TYPE=opencode`), skills won't be available.

### Q: Can I share skills across repositories?

**A:** Yes! Package as `.skill` file and copy to any repository's `.pi/skills/` directory. Skills are portable.

### Q: Do skills slow down the agent?

**A:** No! Progressive disclosure means only metadata (~100 words) is in context until the skill triggers. Very efficient.

### Q: How do I debug a skill?

**A:** Add debug logging to scripts, test locally before committing, check GitHub Actions logs for errors.

### Q: Can skills access secrets?

**A:** Yes! Skills can use environment variables including secrets like `OPENROUTER_API_KEY`, `GITHUB_TOKEN`, etc.

## Resources

**Official Documentation:**
- See `.pi/skills/skill-creator/SKILL.md` for comprehensive guide
- Contains templates, validation tools, and packaging scripts

**Helper Scripts:**
- `init_skill.py` - Initialize new skill
- `package_skill.py` - Package and validate skill
- `quick_validate.py` - Quick validation check

**Community:**
- Share skills via .skill packages
- Contribute to gitclaw repository
- Create skill marketplace (future)

## Summary

**Key Takeaways:**

1. ✅ **Gitclaw supports agent skills** via pi's comprehensive skills system
2. ✅ **Image generation plugin is feasible** with 2-8 hours of work
3. ✅ **Skills are modular and portable** - easy to add/remove
4. ✅ **Progressive loading is efficient** - minimal context overhead
5. ✅ **Built-in tools make development easy** - templates, validation, packaging

**Getting Started:**
1. Check `.pi/skills/skill-creator/SKILL.md` for comprehensive guide
2. Use `init_skill.py` to create new skills
3. Test locally before committing
4. Package and deploy to repository

**For image generation specifically:**
- Follow the implementation guide above
- Start with basic version (2-4 hours)
- Iterate based on usage
- Consider storage strategy early

Skills unlock endless possibilities for extending gitclaw! 🚀
