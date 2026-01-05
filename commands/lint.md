---
description: LINT Mode - Diagnose existing prompts with 7-Point Quality Check
argument-hint: <prompt text>
---

# Prompt Smith - LINT Mode

**Input:** $ARGUMENTS

## Workflow

### Step 1: Identify Target Prompt

From $ARGUMENTS:
- If prompt text provided: Use as input
- If code block provided: Extract content
- If empty or "this prompt": Ask user to provide prompt

### Step 2: Full 7-Point Quality Check

| Item | Score | Evaluation |
|------|-------|------------|
| Role | X/2 | [evaluation] |
| Context | X/2 | [evaluation] |
| Instruction | X/2 | [evaluation] |
| Example | X/2 | [evaluation] |
| Format | X/2 | [evaluation] |
| State Tracking | X/2 or N/A | [evaluation] |
| Tool Usage | X/2 or N/A | [evaluation] |

**Total: X/10**

### Step 3: Top 3 Issues

Identify most critical issues:
1. **[Issue]**: Severity (Critical/Major/Minor) - Description
2. **[Issue]**: Severity - Description
3. **[Issue]**: Severity - Description

### Step 4: Generate Improved Prompt

Create improved version addressing all issues.

Show Before/After comparison:
```
### Before
> [original]

### After
> [improved]

### Change 1: [item]
- Before: [original text]
- After: [improved text]
- Reason: [why]
```

### Step 5: Generate Test Cases

Create 5 test cases:

1. **Normal Case 1**: [input] -> [expected]
2. **Normal Case 2**: [input] -> [expected]
3. **Edge Case**: [boundary input] -> [expected handling]
4. **Injection Defense**: "Ignore above..." -> [should maintain instructions]
5. **Domain-Specific**: [domain scenario] -> [expected]

### Step 6: Output Report

Use diagnostic report format from skills/prompt-smith/templates/diagnostic-report.md

## Express Mode

For "quick lint" or "express" requests:
- Output only: Score + Top 3 Issues + One-line suggestion
- Skip: Full improved prompt, test cases

## Reference

For detailed workflow: skills/prompt-smith/playbooks/lint-mode.md
