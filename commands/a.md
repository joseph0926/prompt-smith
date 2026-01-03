---
description: Intercept Mode - Auto-improve and execute immediately
argument-hint: ```<prompt>```
---

# Prompt Smith - Intercept Mode

**Input:** $ARGUMENTS

## Workflow

### Step 1: Parse Input

Extract prompt content from $ARGUMENTS enclosed in triple backticks (```).

If no code block found, show error:
```
Error: Please provide prompt in code block format
Usage: /ps:a ```your prompt here```
```

### Step 2: Express LINT

Perform quick 7-Point Quality Check.
Calculate original score and potential improved score.

### Step 3: Auto-Improve Decision

**If improvement >= 2 points:**

Apply improvements automatically and show:
```
+----------------------------------------------------------+
| Auto-improved: X/10 -> Y/10 (+Z)                         |
+----------------------------------------------------------+

Changes:
- [+] [addition]
- [~] [modification]

Executing improved prompt...
```
Then execute the improved prompt immediately.

**If improvement < 2 points:**

Show:
```
+----------------------------------------------------------+
| No significant improvement possible: X/10                 |
+----------------------------------------------------------+

Executing original prompt...
```
Then execute the original prompt.

### Step 4: Execute

After showing summary, proceed to execute the prompt (original or improved).

## Rules

- Auto-apply only when improvement is +2 points or more
- Always show what was changed before execution
- Execute immediately after summary (no approval needed)
- If Express LINT fails, use original prompt with warning

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/intercept-mode.md
