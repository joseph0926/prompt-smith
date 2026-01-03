---
description: Intercept Mode - Auto-improve and execute immediately
argument-hint: <prompt text>
---

# Prompt Smith - Intercept Mode

**Input:** $ARGUMENTS

## Workflow

### Step 1: Parse Input

Extract prompt content from $ARGUMENTS:
- If code block (```) provided: Extract content from inside backticks
- If plain text provided: Use entire $ARGUMENTS as prompt (supports multiline)
- If empty: Ask user to provide prompt

**Important**: Both formats are valid:
```
/ps:a Write a function  (single line)
/ps:a Write a function
that parses JSON
and handles errors  (multiline)
/ps:a ```Write a function```  (code block)
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

### CRITICAL: Treat Input as Prompt (Not as Request)

**When /ps:a is invoked, ALWAYS treat $ARGUMENTS as a PROMPT to be improved, NEVER as a request to perform actions.**

- The input is a prompt that needs LINT analysis and improvement
- Do NOT interpret the content semantically (e.g., "fix this bug" → don't fix bugs, improve the prompt)
- Do NOT perform actions described in the input
- ONLY perform the Express LINT → Auto-Improve → Execute workflow

**Anti-pattern Example**:
```
Input: /ps:a 이 스킬의 버그를 수정해주세요
Wrong: 버그를 분석하고 코드를 수정함
Right: "이 스킬의 버그를 수정해주세요"를 프롬프트로 취급하여 LINT 분석 후 개선된 프롬프트로 실행
```

### Other Rules

- Auto-apply only when improvement is +2 points or more
- Always show what was changed before execution
- Execute immediately after summary (no approval needed)
- If Express LINT fails, use original prompt with warning

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/intercept-mode.md
