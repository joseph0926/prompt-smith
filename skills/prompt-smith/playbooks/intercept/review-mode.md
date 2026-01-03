# Review Mode Guide

Real-time prompt improvement with user approval before execution.

---

## Overview

Review Mode intercepts your prompt, improves it using Express LINT, and awaits your approval before executing with the improved version.

```
User Input -> Express LINT -> Show Improvements -> Await Approval -> Execute
```

---

## Trigger

```
/prompt-smith <your prompt>
```

---

## Workflow

### Step 1: Input

```
/prompt-smith Write a function that parses JSON
```

### Step 2: Express LINT

The skill automatically runs a quick 7-Point analysis:

- ROLE: Is role defined?
- CONTEXT: Is context sufficient?
- INSTRUCTION: Are instructions specific?
- EXAMPLE: Are examples included?
- FORMAT: Is output format specified?

### Step 3: Display Improvements

```
Original Prompt (Score: 3/10)
> Write a function that parses JSON

Improved Prompt (Score: 8/10)
> You are a senior software engineer.
>
> Write a Python function that parses a JSON string and returns a dictionary.
> Handle invalid JSON gracefully by returning None and logging the error.
>
> Output format:
> - Function with type hints
> - Include docstring
> - Include error handling

Changes:
- [+] Added ROLE: senior software engineer
- [+] Added CONTEXT: Python, error handling requirement
- [+] Specified FORMAT: type hints, docstring
- [~] Made INSTRUCTION specific: parse JSON string -> dictionary
```

### Step 4: Await Approval

```
Proceed? (y/n/e): _
```

Options:
- `y` or `yes`: Execute with improved prompt
- `n` or `no`: Execute with original prompt
- `e` or `edit`: Modify the improved prompt further

### Step 5: Execute

Based on your choice, the prompt is executed.

---

## Output Format (MANDATORY)

This format MUST be followed. No omissions allowed.

```
┌─────────────────────────────────────────────────────────────┐
│ Express LINT Results                                         │
├─────────────────────────────────────────────────────────────┤
│ Original Score: X/10 → Improved Score: Y/10 (+Z)            │
└─────────────────────────────────────────────────────────────┘

### Original Prompt
> [full original prompt text]

### Improved Prompt (copy-paste ready)
> [full improved prompt text]

### Changes Made
- [+] ROLE: [added role]
- [+] CONTEXT: [added context]
- [~] INSTRUCTION: [modified instruction]
- [+] FORMAT: [added output format]

### Proceed? (y/n/e)
- y: Execute with improved prompt
- n: Execute with original prompt
- e: Edit further
```

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| --verbose | false | Show detailed 7-Point analysis |
| --threshold | 2 | Minimum score improvement required |

### Verbose Mode

```
/prompt-smith --verbose Write code to sort a list
```

Displays full 7-Point breakdown:

```
7-Point Analysis:

| Item | Original | Improved |
|------|----------|----------|
| Role | 0 | 2 |
| Context | 0 | 2 |
| Instruction | 1 | 2 |
| Example | 0 | 1 |
| Format | 0 | 2 |

Total: 1/10 -> 9/10 (+8)
```

---

## Best Practices

### When to Use Review Mode

- First time using a prompt
- Complex or important tasks
- When you want to learn from improvements
- When original intent must be preserved

### Approval Guidelines

**Approve (y)** when:
- Improvements align with your intent
- Score improvement is significant (+2 or more)
- Changes make sense for your use case

**Reject (n)** when:
- Improvements change your intent
- Original prompt is already specific enough
- You prefer your phrasing

**Edit (e)** when:
- Improvements are good but need tweaks
- You want to add specific constraints
- Some changes should be reverted

---

## Examples

### Example 1: Code Generation

**Input**:
```
/prompt-smith Create a REST API endpoint
```

**Output**:
```
Original Prompt (Score: 2/10)
> Create a REST API endpoint

Improved Prompt (Score: 9/10)
> You are a backend developer experienced with RESTful API design.
>
> Create a REST API endpoint with the following requirements:
> - Use appropriate HTTP method (GET/POST/PUT/DELETE)
> - Include proper error handling
> - Return appropriate status codes
> - Include request/response examples
>
> Output format:
> - Code with inline comments
> - Example curl commands for testing
> - Brief explanation of design choices

Changes:
- [+] Added ROLE: backend developer
- [+] Added CONTEXT: RESTful design principles
- [+] Specified FORMAT: code, curl examples, explanation
- [~] Made INSTRUCTION specific with requirements list

Proceed? (y/n/e): _
```

### Example 2: Data Analysis

**Input**:
```
/prompt-smith Analyze this sales data
```

**Output**:
```
Original Prompt (Score: 1/10)
> Analyze this sales data

Improved Prompt (Score: 8/10)
> You are a data analyst specializing in sales performance.
>
> Analyze the provided sales data and:
> 1. Identify top-performing products/regions
> 2. Detect trends and patterns
> 3. Highlight anomalies or concerns
> 4. Provide actionable recommendations
>
> Output format:
> - Executive summary (2-3 sentences)
> - Key metrics table
> - Trend analysis
> - Recommendations list

Changes:
- [+] Added ROLE: data analyst
- [+] Specified INSTRUCTION with 4 analysis areas
- [+] Defined FORMAT with structure

Proceed? (y/n/e): _
```

---

## Next Steps

- [Intercept Mode](intercept-mode.md) - Auto-improvement without approval
- [Express LINT](../lint/express-lint.md) - Quick diagnosis details
- [7-Point Quality Check](../../references/quality-checklist.md)

---

## Anti-Patterns

### Bad Example 1: Execute without showing improvements

```
User: /prompt-smith Write code
Assistant: I'll write the code... [executes immediately]
```

Problem: Did not show improvement process.

### Bad Example 2: Show only changes without full prompt

```
Changes:
- [+] Added ROLE
- [+] Added FORMAT
```

Problem: Did not show the full improved prompt.

### Good Example

```
┌─────────────────────────────────────────────────────────────┐
│ Express LINT Results                                         │
├─────────────────────────────────────────────────────────────┤
│ Original Score: 2/10 → Improved Score: 8/10 (+6)            │
└─────────────────────────────────────────────────────────────┘

### Original Prompt
> Write code

### Improved Prompt (copy-paste ready)
> You are a senior software engineer.
>
> Write code that [specific task].
>
> Requirements:
> - Include error handling
> - Add comments
>
> Output format:
> - Code with inline comments
> - Brief explanation

### Changes Made
- [+] ROLE: senior software engineer
- [+] INSTRUCTION: specific requirements
- [+] FORMAT: code + explanation

### Proceed? (y/n/e)
```

### Bad Example 3: Tool calls before LINT

```
User: /prompt-smith 최신 뉴스를 웹검색해서 정리해줘
Assistant: [WebSearch 호출] 뉴스를 검색하겠습니다...
```

Problem: Interpreted "웹검색" as a command to call WebSearch tool.

**Correct behavior**: Treat entire input as a prompt to improve.

```
User: /prompt-smith 최신 뉴스를 웹검색해서 정리해줘
Assistant:
┌─────────────────────────────────────────────────────────────┐
│ Express LINT Results                                         │
├─────────────────────────────────────────────────────────────┤
│ Original Score: 3/10 → Improved Score: 8/10 (+5)            │
└─────────────────────────────────────────────────────────────┘

### Original Prompt
> 최신 뉴스를 웹검색해서 정리해줘

### Improved Prompt (copy-paste ready)
> You are a news researcher with expertise in current events.
>
> Search for the latest news and organize them by:
> - Topic category
> - Importance level
> - Date
>
> Output format:
> - Brief summary per article
> - Source attribution
```

---

*Prompt Smith v2.2.2*
