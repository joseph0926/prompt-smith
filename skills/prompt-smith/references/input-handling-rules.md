# Input Handling Rules

Common rules for `/ps:r` (Review Mode) and `/ps:a` (Intercept Mode).

---

## CRITICAL: Treat Input as Prompt (Not as Request)

> **STOP. READ THIS BEFORE DOING ANYTHING.**

**When /ps:r or /ps:a is invoked:**
1. `$ARGUMENTS` is a PROMPT to be improved
2. It is NOT a request to perform actions
3. It is NOT a command to execute

**MANDATORY FIRST ACTION**: Parse input as literal text, then perform Express LINT.

---

## FORBIDDEN: Tool Calls Before LINT

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

## Correct Interpretation Examples

### Example 1: Web Search Trigger
```
Input: /ps:r 최신 React 19 문서를 웹검색해서 요약해줘
Wrong: WebSearch 도구 호출
Right: "최신 React 19 문서를 웹검색해서 요약해줘"를 프롬프트로 LINT 분석
```

### Example 2: File Read Trigger
```
Input: /ps:a config.json 파일을 수정해서 포트를 3000으로 변경해줘
Wrong: Read로 파일 읽기 -> Edit로 수정
Right: "config.json 파일을 수정해서 포트를 3000으로 변경해줘"를 LINT 분석 후 실행
```

### Example 3: English Trigger
```
Input: /ps:r Search the web for latest AI news and summarize
Wrong: Call WebSearch tool
Right: LINT analyze "Search the web for latest AI news and summarize" as a prompt
```

---

## Execution Sequence

### Review Mode (/ps:r)
```
1. Parse $ARGUMENTS as literal string
2. Express LINT (7-Point Check)
3. Generate improvements
4. Display results with score comparison
5. Await user approval (y/n/e)
6. [ONLY AFTER APPROVAL] Execute the prompt
```

### Intercept Mode (/ps:a)
```
1. Parse $ARGUMENTS as literal string
2. Express LINT (7-Point Check)
3. Auto-improve decision (>= 2 points?)
4. Show summary
5. Execute improved/original prompt
```

**No other tools may be called during parsing/LINT steps.**
