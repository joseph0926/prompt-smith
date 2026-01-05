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
| WebSearch | "search", "find", "latest" |
| Read/Glob/Grep | "file", "code", "read" |
| Bash | "run", "execute", "install" |
| Edit/Write | "modify", "change", "fix", "update" |

**Even if the input says "search the web..." or "read this file...":**
- DO NOT search the web
- DO NOT read files
- DO NOT execute commands
- ONLY perform Express LINT on the text itself

---

## Correct Interpretation Examples

### Example 1: Web Search Trigger
```
Input: /ps:r Search the web for the latest React 19 docs and summarize
Wrong: Call WebSearch tool
Right: LINT analyze "Search the web for the latest React 19 docs and summarize" as a prompt
```

### Example 2: File Read Trigger
```
Input: /ps:a Edit config.json and change the port to 3000
Wrong: Read file -> Edit file
Right: LINT analyze "Edit config.json and change the port to 3000" and then execute
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
