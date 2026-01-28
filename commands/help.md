---
description: Show prompt-shield usage guide and command reference
argument-hint: [topic]
---

# PromptShield - Help

**Input:** $ARGUMENTS

---

## ⚠️ MANDATORY EXECUTION RULE

> **This command MUST be executed when user types `/ps:help`**
>
> The Claude agent MUST:
> 1. Invoke this skill via the Skill tool IMMEDIATELY
> 2. NEVER simulate or mimic this skill's output without proper invocation
> 3. NEVER skip showing the help content

---

## Available Topics

Parse the input argument to determine which help topic to show:
- `commands` or `cmd` - List all slash commands
- `lint` - LINT mode detailed guide
- `build` - BUILD mode detailed guide
- `review` or `r` - Review mode guide
- `intercept` or `a` - Intercept/Auto mode guide
- `8point`, `7point`, or `quality` - 8-Point Quality Check explanation
- (empty or `help`) - General overview

## Output Format

### Default Overview (no argument or `help`)

```
+----------------------------------------------------------+
| PromptShield                                              |
+----------------------------------------------------------+

COMMANDS
  /ps:r <prompt>      Review Mode - show improvements, ask approval
  /ps:a <prompt>      Auto Mode - improve and execute immediately
  /ps:lint <prompt>   LINT Mode - full diagnosis with test cases
  /ps:build <goal>    BUILD Mode - design new prompt from requirements
  /ps:help [topic]    This help (topics: commands, lint, build, 8point/7point)

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
  /ps:help 8point     - Scoring criteria explained (alias: 7point)
```

### Topic: commands

```
+----------------------------------------------------------+
| PromptShield Commands                                     |
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
  - Full 8-Point Quality Check with scores
  - Identifies top 3 issues (Critical/Major/Minor)
  - Generates improved version
  - Creates 5 test cases including edge cases
  - Best for debugging problematic prompts

/ps:build <goal>
  BUILD Mode - Design from scratch
  - Takes requirements, outputs production prompt
  - 7-step workflow: GATHER → CLASSIFY → DESIGN → DRAFT → SELF-LINT → TEST → DELIVER
  - Includes test cases and usage examples
  - Best for creating new prompts

/ps:help [topic]
  Show this help
  Topics: commands, lint, build, review, 8point/7point
```

### Topic: 8point, 7point, or quality

```
+----------------------------------------------------------+
| 8-Point Quality Check                                     |
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

6. SUCCESS_CRITERIA (What defines success?)
   0: No success criteria
   1: Vague or implicit criteria
   2: Measurable, verifiable conditions

7. STATE_TRACKING (For multi-turn)
   0: No state management
   1: Basic memory
   2: Explicit state variables and transitions
   N/A: Single-turn prompts

8. TOOL_USAGE (For tool-enabled AI)
   0: Tools mentioned but not guided
   1: Basic tool instructions
   2: Clear tool selection criteria and examples
   N/A: No tools involved

SCORING
  Base Score: Dimensions 1-6 (max 12 points, normalized to 10)
  Extended: All 8 normalized to 10 if 7-8 apply

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
  2. Run 8-Point Quality Check (full scores)
  3. Identify top 3 issues by severity
  4. Generate improved version with diff
  5. Create 5 test cases

OUTPUT SECTIONS
  - Score Table (8 dimensions)
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
  5. SELF-LINT - Run 8-Point Check, iterate until 8+
  6. TEST      - Generate test cases
  7. DELIVER   - Output final prompt + usage guide

OUTPUT
  - Final prompt (copy-ready)
  - 8-Point score breakdown
  - 3 usage examples
  - 5 test cases
  - Recommended deployment notes

WHEN TO USE
  - Starting a new AI feature
  - Replacing ad-hoc prompts with production quality
  - Creating prompt templates for teams
```

### Topic: review

```
+----------------------------------------------------------+
| Review Mode Guide                                         |
+----------------------------------------------------------+

USAGE
  /ps:r <your prompt here>
  /ps:r Write a function to parse JSON

WORKFLOW
  1. Parse input as literal prompt text
  2. Run Express LINT (8-Point Quality Check)
  3. Generate improved version
  4. Show before/after comparison with score
  5. Await user approval (y/n/e)
  6. Execute approved prompt

OUTPUT FORMAT
  - Original Score → Improved Score (+delta)
  - Original Prompt (quoted)
  - Improved Prompt (copy-paste ready)
  - Changes Made (additions/modifications)
  - [DEBUG] Final Submitted Prompt
  - Approval prompt (y/n/e)

APPROVAL OPTIONS
  y: Execute with improved prompt
  n: Execute with original prompt
  e: Edit the prompt further

WHEN TO USE
  - Testing prompt improvements safely
  - Production prompt modifications
  - When you want control over changes
```

### Topic: intercept

```
+----------------------------------------------------------+
| Intercept Mode Guide                                      |
+----------------------------------------------------------+

USAGE
  /ps:a <your prompt here>
  /ps:a Write a function to parse JSON

WORKFLOW
  1. Parse input as literal prompt text
  2. Run Express LINT internally (no output)
  3. Auto-decision:
     - If improvement >= 2 points: Apply and execute
     - If improvement < 2 points: Execute original silently

OUTPUT FORMAT (Token-efficient)
  If improved:
    [PromptShield] 활성화됨 (X→Y점)
    (Then executes improved prompt immediately)

  If not improved:
    (No message - executes original prompt silently)

WHEN TO USE
  - Quick, low-stakes tasks
  - Rapid iteration
  - When you trust auto-improvements
  - Casual exploration prompts
```

## Rules

- Always show the appropriate section based on topic
- If topic not recognized, show default overview
- Keep output concise and scannable
- Use box drawing characters for headers
