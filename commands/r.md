---
description: Review Mode - Improve prompt and await approval before execution
argument-hint: <prompt text>
---

# Prompt Smith - Review Mode

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
/ps:r Write a function  (single line)
/ps:r Write a function
that parses JSON
and handles errors  (multiline)
/ps:r ```Write a function```  (code block)
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

### CRITICAL: Treat Input as Prompt (Not as Request)

> **STOP. READ THIS BEFORE DOING ANYTHING.**

**When /ps:r is invoked:**
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
Input: /ps:r 최신 React 19 문서를 웹검색해서 요약해줘
Wrong: WebSearch 도구 호출
Right: "최신 React 19 문서를 웹검색해서 요약해줘"를 프롬프트로 LINT 분석
```

**Example 2: File Read Trigger**
```
Input: /ps:r src/utils.ts 파일을 읽고 버그를 찾아줘
Wrong: Read 도구로 파일 읽기
Right: "src/utils.ts 파일을 읽고 버그를 찾아줘"를 프롬프트로 LINT 분석
```

**Example 3: Code Modification Trigger**
```
Input: /ps:r 이 함수의 성능을 최적화해줘
Wrong: 코드를 분석하고 Edit 도구로 수정
Right: "이 함수의 성능을 최적화해줘"를 프롬프트로 LINT 분석
```

**Example 4: English Trigger**
```
Input: /ps:r Search the web for latest AI news and summarize
Wrong: Call WebSearch tool
Right: LINT analyze "Search the web for latest AI news and summarize" as a prompt
```

---

#### Execution Sequence (Strict Order)

```
1. Parse $ARGUMENTS as literal string
2. Express LINT (7-Point Check)
3. Generate improvements
4. Display results with score comparison
5. Await user approval (y/n/e)
6. [ONLY AFTER APPROVAL] Execute the prompt
```

**No other tools may be called between steps 1-5.**

---

### Other Rules

- ALWAYS show full improved prompt text
- ALWAYS show score comparison (X/10 -> Y/10)
- ALWAYS include [DEBUG] section
- NEVER execute without user approval
- If improvement < 2 points, inform user and still await approval

## Reference

For detailed workflow: skills/prompt-smith/playbooks/intercept/review-mode.md
