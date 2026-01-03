---
description: Review Mode - Improve prompt and await approval before execution
argument-hint: ```<prompt>```
---

# Prompt Smith - Review Mode

**Input:** $ARGUMENTS

## Workflow

### Step 1: Parse Input

Extract prompt content from $ARGUMENTS enclosed in triple backticks (```).

If no code block found, show error:
```
Error: Please provide prompt in code block format
Usage: /ps:r ```your prompt here```
```

### Step 2: Express LINT

Perform 7-Point Quality Check:

| Dimension | Check |
|-----------|-------|
| ROLE | Is role clearly defined? (0-2) |
| CONTEXT | Is context sufficient? (0-2) |
| INSTRUCTION | Are instructions specific? (0-2) |
| EXAMPLE | Are examples included? (0-2) |
| FORMAT | Is output format specified? (0-2) |
| STATE_TRACKING | State management for long tasks? (0-2 or N/A) |
| TOOL_USAGE | Tool instructions clear? (0-2 or N/A) |

Calculate score: Base 5 items = max 10 points.

### Step 3: Generate Improvements

Apply improvements addressing identified issues.

### Step 4: Display Results

Use this exact format:

```
+----------------------------------------------------------+
| Express LINT Results                                      |
+----------------------------------------------------------+
| Original Score: X/10 -> Improved Score: Y/10 (+Z)        |
+----------------------------------------------------------+

### Original Prompt
> [full original prompt text]

### Improved Prompt (copy-paste ready)
> [full improved prompt text]

### Changes Made
- [+] ROLE: [added role]
- [+] CONTEXT: [added context]
- [~] INSTRUCTION: [modified instruction]
- [+] FORMAT: [added output format]

### [DEBUG] Final Submitted Prompt
The exact prompt that will be sent:
```
[full improved prompt text]
```

### Proceed? (y/n/e)
- y: Execute with improved prompt
- n: Execute with original prompt
- e: Edit further
```

### Step 5: Await Approval

Wait for user response (y/n/e) before execution.

## Rules

- ALWAYS show full improved prompt text
- ALWAYS show score comparison (X/10 -> Y/10)
- ALWAYS include [DEBUG] section
- NEVER execute without user approval
- If improvement < 2 points, inform user and still await approval

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/review-mode.md
