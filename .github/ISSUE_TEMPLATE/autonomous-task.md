---
name: "🚀 Autonomous Task (YOLO Mode)"
about: "Build something from scratch with minimal interaction"
labels: ["autonomous", "yolo"]
---

<!-- 
This template helps you create autonomous tasks that the agent completes with zero interaction.
The agent will work through your requirements systematically and won't stop until done.

Runtime: 
- 6 hours per run (GitHub Actions limit)
- With ENABLE_AUTO_CONTINUATION=true: Up to 24 hours across 4 runs (configurable)

Enable auto-continuation in Settings → Actions → Variables:
- ENABLE_AUTO_CONTINUATION = true
- MAX_CONTINUATION_RUNS = 4
-->

## Project Description
<!-- Describe what you want built in 1-2 sentences -->



## Requirements

<!-- List specific features and requirements. Be as detailed as possible. -->

### Tech Stack
- 

### Core Features
1. 
2. 
3. 

### Quality Checks
<!-- The agent will verify these before finishing -->
- [ ] All tests pass
- [ ] Build succeeds
- [ ] App runs without errors
- [ ] README with setup instructions included

## Success Criteria
<!-- How will we know this is done? Be specific. -->



---

**Example autonomous prompt:**

```
Build a complete weather app from scratch:

1. Set up a React app with TypeScript and Vite
2. Use Tailwind CSS for styling
3. Integrate OpenWeatherMap API
4. Features:
   - Search for city weather
   - Display current temperature, conditions, humidity, wind
   - 5-day forecast
   - Save favorite cities to localStorage
   - Responsive design
5. Add proper error handling for API failures
6. Create comprehensive README with setup instructions
7. Test the app by running `npm run dev`
8. Fix any TypeScript errors or runtime issues
9. Ensure `npm run build` succeeds

Work through each step carefully. Test thoroughly. Don't stop until everything works perfectly.
```

**For large projects (12-24 hours):**

Enable auto-continuation and the agent will automatically chain multiple runs:

```
Build a complete e-commerce platform from scratch:

[... extensive requirements ...]

This is a large project that may take multiple runs. Continue working until fully complete.
```

The agent will work for ~5.5 hours, then automatically post a continuation comment and resume in the next run.
