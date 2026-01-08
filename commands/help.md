---
description: Show prompt-smith usage guide and command reference
argument-hint: [topic]
---

# Prompt Smith - Help

**Input:** $ARGUMENTS

## Available Topics

Parse the input argument to determine which help topic to show:
- `commands` or `cmd` - List all slash commands
- `lint` - LINT mode detailed guide
- `build` - BUILD mode detailed guide
- `review` or `r` - Review mode guide
- `intercept` or `a` - Intercept/Auto mode guide
- `7point` or `quality` - 7-Point Quality Check explanation
- (empty or `help`) - General overview

## Output Format

### Default Overview (no argument or `help`)

```
+----------------------------------------------------------+
| Prompt Smith                                              |
+----------------------------------------------------------+

COMMANDS
  /ps:r <prompt>      Review Mode - show improvements, ask approval
  /ps:a <prompt>      Auto Mode - improve and execute immediately
  /ps:lint <prompt>   LINT Mode - full diagnosis with test cases
  /ps:build <goal>    BUILD Mode - design new prompt from requirements
  /ps:help [topic]    This help (topics: commands, lint, build, 7point)

QUICK START
  1. Try: /ps:r Write a function to parse JSON
  2. Review the score and suggested improvements
  3. Type 'y' to accept, 'n' to reject, 'e' to edit

RECOMMENDED FLOW
  New prompts:     /ps:build → /ps:lint → iterate
  Existing prompts: /ps:lint → /ps:r → approve

OUTPUT LEVELS
  Default: score + top issues + improved prompt
  Triggers for different detail levels:
  - "간단히" / "quick"   → Express (score + top3 only)
  - "자세히" / "detail"  → Full analysis with all sections

MORE INFO
  /ps:help commands   - All command details
  /ps:help 7point     - Scoring criteria explained
```

### Topic: commands

```
+----------------------------------------------------------+
| Prompt Smith Commands                                     |
+----------------------------------------------------------+

/ps:r <prompt>
  Review Mode - Interactive improvement
  - Shows before/after comparison
  - Displays score improvement (e.g., 3/10 → 8/10)
  - Awaits your approval: y(yes) / n(no) / e(edit)
  - Safe for production prompts

/ps:a <prompt>
  Auto/Intercept Mode - Quick improvement
  - Auto-applies if improvement ≥ 2 points
  - Executes immediately without approval
  - Best for quick, low-stakes tasks

/ps:lint <prompt>
  LINT Mode - Deep diagnosis
  - Full 7-Point Quality Check with scores
  - Identifies top 3 issues (Critical/Major/Minor)
  - Generates improved version
  - Creates 5 test cases including edge cases
  - Best for debugging problematic prompts

/ps:build <goal>
  BUILD Mode - Design from scratch
  - Takes requirements, outputs production prompt
  - 7-step process: GATHER → CLASSIFY → DESIGN → DRAFT → SELF-LINT → TEST → DELIVER
  - Includes test cases and usage examples
  - Best for creating new prompts

/ps:help [topic]
  Show this help
  Topics: commands, lint, build, review, 7point
```

### Topic: 7point or quality

```
+----------------------------------------------------------+
| 7-Point Quality Check                                     |
+----------------------------------------------------------+

SCORING CRITERIA (0-2 each)

1. ROLE (Who is the AI?)
   0: No role defined
   1: Generic role (e.g., "You are helpful")
   2: Specific expertise with constraints

2. CONTEXT (What's the situation?)
   0: No context
   1: Partial context
   2: Clear background, user scenario, constraints

3. INSTRUCTION (What to do?)
   0: Vague or missing
   1: Basic but incomplete
   2: Clear, specific, actionable steps

4. EXAMPLE (Show me how)
   0: No examples
   1: One simple example
   2: Multiple examples with edge cases

5. FORMAT (How to output?)
   0: No format specified
   1: Basic format hint
   2: Explicit structure (JSON, markdown, etc.)

6. STATE_TRACKING (For multi-turn)
   0: No state management
   1: Basic memory
   2: Explicit state variables and transitions
   N/A: Single-turn prompts

7. TOOL_USAGE (For tool-enabled AI)
   0: Tools mentioned but not guided
   1: Basic tool instructions
   2: Clear tool selection criteria and examples
   N/A: No tools involved

SCORING
  Base Score: Dimensions 1-5 (max 10 points)
  Extended: All 7 normalized to 10 if 6-7 apply

INTERPRETATION
  0-3: Critical issues, major rewrite needed
  4-6: Functional but weak, improvements recommended
  7-8: Good, minor refinements possible
  9-10: Excellent, production ready
```

### Topic: lint

```
+----------------------------------------------------------+
| LINT Mode Guide                                           |
+----------------------------------------------------------+

USAGE
  /ps:lint <your prompt here>
  /ps:lint "Existing prompt with quotes"

WORKFLOW
  1. Parse input prompt
  2. Run 7-Point Quality Check (full scores)
  3. Identify top 3 issues by severity
  4. Generate improved version with diff
  5. Create 5 test cases

OUTPUT SECTIONS
  - Score Table (7 dimensions)
  - Top 3 Issues (Critical > Major > Minor)
  - Before/After Comparison
  - Change Log (what changed and why)
  - Test Cases (2 normal, 1 edge, 1 injection, 1 domain)

WHEN TO USE
  - Debugging underperforming prompts
  - Auditing existing prompt library
  - Learning prompt engineering patterns
```

### Topic: build

```
+----------------------------------------------------------+
| BUILD Mode Guide                                          |
+----------------------------------------------------------+

USAGE
  /ps:build Create a code review assistant
  /ps:build API documentation generator for REST endpoints

WORKFLOW (7 Steps)
  1. GATHER    - Extract requirements from your goal
  2. CLASSIFY  - Determine prompt type (single/multi-turn, tools)
  3. DESIGN    - Plan structure based on classification
  4. DRAFT     - Write initial prompt
  5. SELF-LINT - Run 7-Point Check, iterate until 8+
  6. TEST      - Generate test cases
  7. DELIVER   - Output final prompt + usage guide

OUTPUT
  - Final prompt (copy-ready)
  - 7-Point score breakdown
  - 3 usage examples
  - 5 test cases
  - Recommended deployment notes

WHEN TO USE
  - Starting a new AI feature
  - Replacing ad-hoc prompts with production quality
  - Creating prompt templates for teams
```

## Rules

- Always show the appropriate section based on topic
- If topic not recognized, show default overview
- Keep output concise and scannable
- Use box drawing characters for headers
