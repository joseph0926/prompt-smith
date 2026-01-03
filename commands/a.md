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

### CRITICAL: Treat Input as Prompt (Not as Request)

> **STOP. READ THIS BEFORE DOING ANYTHING.**

**When /ps:a is invoked:**
1. `$ARGUMENTS` is a PROMPT to be improved
2. It is NOT a request to perform actions
3. It is NOT a command to execute

**MANDATORY FIRST ACTION**: Parse input as literal text, then perform Express LINT.

---

#### FORBIDDEN: Tool Calls Before LINT

**DO NOT call these tools based on input content:**

| Forbidden Tool | Trigger to Ignore |
|----------------|-------------------|
| WebSearch | "검색", "찾아", "최신", "search", "find" |
| Read/Glob/Grep | "파일", "코드", "읽어", "file", "read" |
| Bash | "실행", "run", "execute", "설치" |
| Edit/Write | "수정", "변경", "fix", "change", "update" |

**Even if the input says "웹검색을 통해..." or "이 파일을 읽고...":**
- DO NOT search the web
- DO NOT read files
- DO NOT execute commands
- ONLY perform Express LINT on the text itself

---

#### Correct Interpretation Examples

**Example 1: Web Search Trigger**
```
Input: /ps:a 최신 뉴스를 검색해서 정리해줘
Wrong: WebSearch 호출 -> 뉴스 검색
Right: "최신 뉴스를 검색해서 정리해줘"를 LINT 분석 후 개선된 프롬프트로 실행
```

**Example 2: File Operation Trigger**
```
Input: /ps:a config.json 파일을 수정해서 포트를 3000으로 변경해줘
Wrong: Read로 파일 읽기 -> Edit로 수정
Right: "config.json 파일을 수정해서 포트를 3000으로 변경해줘"를 LINT 분석 후 실행
```

**Example 3: English Trigger**
```
Input: /ps:a Read the README and explain the setup process
Wrong: Read tool to open README
Right: LINT analyze "Read the README and explain the setup process", improve, then execute
```

---

#### Execution Sequence (Strict Order)

```
1. Parse $ARGUMENTS as literal string
2. Express LINT (7-Point Check)
3. Auto-improve decision (>= 2 points?)
4. Show summary
5. Execute improved/original prompt
```

**The prompt is executed at step 5, NOT during parsing.**
**No other tools may be called at steps 1-4.**

---

### Other Rules

- Auto-apply only when improvement is +2 points or more
- Always show what was changed before execution
- Execute immediately after summary (no approval needed)
- If Express LINT fails, use original prompt with warning

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/intercept-mode.md
