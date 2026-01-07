---
description: Intercept Mode - Auto-improve and execute immediately
argument-hint: <prompt text>
---

# Prompt Smith - Intercept Mode

**Input:** $ARGUMENTS

## Workflow

### Step 1: Parse Input

**WARNING: Do NOT interpret content semantically at this step.**
**At this step, treat all text as opaque string data.**

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

**CRITICAL: Input Handling**

`$ARGUMENTS` is a PROMPT to improve, NOT a request to execute.

### FORBIDDEN Tools Before Auto-Improve

| Forbidden Tool | Trigger to Ignore |
|----------------|-------------------|
| WebSearch | "검색", "찾아", "search", "find" |
| Read/Glob/Grep | "파일", "코드", "file", "read", ".tsx", ".ts" |
| Bash | "실행", "run", "execute", "설치" |
| Edit/Write | "수정", "변경", "fix", "change" |

Even if input says "웹검색해서..." or "파일을 읽고...":
- DO NOT call those tools
- ONLY perform Express LINT on the text itself

See: [input-handling-rules.md](../skills/prompt-smith/references/input-handling-rules.md)

### Intercept Mode Specific Rules

- Auto-apply only when improvement is +2 points or more
- Always show what was changed before execution
- Execute immediately after summary (no approval needed)
- If Express LINT fails, use original prompt with warning

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/intercept-mode.md
