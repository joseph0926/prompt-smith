# Intercept Mode Guide

Automatic prompt improvement and immediate execution without user approval.

---

## Overview

Intercept Mode automatically improves your prompt and executes it immediately when the improvement is significant (default: +2 points).

```
User Input -> Express LINT -> Auto-Improve -> Show Summary -> Execute Immediately
```

---

## Trigger

```
/prompt-smith --auto <your prompt>
```

---

## Workflow

### Step 1: Input

```
/prompt-smith --auto Write a Python script to sort files
```

### Step 2: Express LINT + Auto-Improve

The skill automatically:
1. Analyzes the original prompt (7-Point Check)
2. Generates improvements
3. Calculates score difference

### Step 3: Decision

If improvement >= threshold (default 2 points):
- Auto-apply improvements
- Show summary
- Execute immediately

If improvement < threshold:
- Use original prompt
- Show notice
- Execute immediately

### Step 4: Execute

```
Auto-improved (3/10 -> 8/10)

Changes:
- [+] Added ROLE: Python developer
- [+] Specified sorting criteria
- [+] Defined output format

Executing improved prompt...
```

---

## Output Format

### When Improved

```
Auto-improved (X/10 -> Y/10)

Changes:
- [+] [addition]
- [~] [modification]

Executing improved prompt...
```

### When Not Improved

```
No significant improvement possible (X/10)
Executing original prompt...
```

---

## Options

| Option | Default | Description |
|--------|---------|-------------|
| --auto | required | Enable Intercept Mode |
| --threshold N | 2 | Minimum score improvement for auto-apply |
| --verbose | false | Show detailed analysis |

### Custom Threshold

```
/prompt-smith --auto --threshold 3 Write a sorting algorithm
```

Only auto-applies if improvement is 3+ points.

### Verbose Mode

```
/prompt-smith --auto --verbose Explain recursion
```

Shows full 7-Point comparison before executing.

---

## Behavior Matrix

| Original Score | Improved Score | Difference | Action |
|----------------|----------------|------------|--------|
| 3 | 8 | +5 | Auto-improve |
| 5 | 7 | +2 | Auto-improve |
| 6 | 7 | +1 | Use original |
| 8 | 9 | +1 | Use original |
| 9 | 10 | +1 | Use original |

---

## Best Practices

### When to Use Intercept Mode

- Repetitive tasks with similar prompts
- Quick iterations where speed matters
- When you trust the improvement logic
- Batch processing scenarios

### When NOT to Use Intercept Mode

- Critical or irreversible tasks
- When original phrasing is important
- First time using a new type of prompt
- When you need to verify improvements

### Threshold Guidelines

| Threshold | Use Case |
|-----------|----------|
| 1 | Accept any improvement |
| 2 | Standard (default) |
| 3 | Conservative |
| 4+ | Only major improvements |

---

## Examples

### Example 1: Quick Coding Task

**Input**:
```
/prompt-smith --auto Fix the bug in this function
```

**Output**:
```
Auto-improved (2/10 -> 7/10)

Changes:
- [+] Added ROLE: senior debugger
- [+] Specified debugging approach
- [+] Defined output format

Executing improved prompt...

[AI response follows with improved context]
```

### Example 2: No Improvement Needed

**Input**:
```
/prompt-smith --auto You are a Python expert. Write a function that takes a list of integers and returns the sum. Include type hints and a docstring. Output the function only, no explanation.
```

**Output**:
```
No significant improvement possible (9/10)
Executing original prompt...

[AI response follows with original prompt]
```

### Example 3: Batch Processing

For multiple prompts in sequence:

```
/prompt-smith --auto Summarize document 1
/prompt-smith --auto Summarize document 2
/prompt-smith --auto Summarize document 3
```

Each prompt is automatically improved and executed without interruption.

---

## Comparison: Review vs Intercept

| Aspect | Review Mode | Intercept Mode |
|--------|-------------|----------------|
| Approval | Required | Automatic |
| Speed | Slower | Faster |
| Control | Full | Limited |
| Visibility | Full details | Summary only |
| Best for | Critical tasks | Quick iterations |

---

## Fallback Behavior

If Express LINT fails or times out:
- Original prompt is used
- Warning is displayed
- Execution continues

```
[Warning] Express LINT unavailable, using original prompt
Executing original prompt...
```

---

## Next Steps

- [Review Mode](review-mode.md) - Manual approval workflow
- [Express LINT](../lint/express-lint.md) - Quick diagnosis details
- [7-Point Quality Check](../../references/quality-checklist.md)

---

*Prompt Smith v2.1.0*
