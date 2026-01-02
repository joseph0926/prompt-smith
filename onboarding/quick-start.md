# Quick Start: 5-Minute Guide

Get started with Prompt Smith in 5 minutes.

---

## What is Prompt Smith?

```
+-------------------------------------------------------------+
|                     Prompt Smith                             |
+-------------------------------------------------------------+
|  Prompt Quality Management Skill                             |
|                                                             |
|  LINT Mode: Diagnose + improve + test existing prompts      |
|  BUILD Mode: Design prompts from requirements               |
|  INTERCEPT: Real-time prompt improvement pipeline           |
|                                                             |
|  Transform prompts into operational assets with 7-Point QC  |
+-------------------------------------------------------------+
```

---

## Minute 1: Try LINT

If you have an existing prompt, diagnose it right away.

### Input
```
Lint this prompt:

Analyze user feedback and extract the main issues
```

### Output (example)
```
Diagnostic Report

Score: 3/10 (Grade: D)

Top 3 Issues:
1. No role definition
2. No examples
3. Output format unclear

Improved Prompt:
[7-Point compliant improved version]
```

---

## Minute 2: EXPRESS Diagnosis

For quick checks:

### Input
```
Quick check:

[prompt text]
```

### Output (example)
```
Express Diagnostic Report

Score: 3/10

Top 3 Issues:
1. No role
2. No examples
3. Format partial

One-line improvement: Add role + 2 examples + JSON format
```

---

## Minute 3: Try BUILD

If you need a new prompt:

### Input
```
Build a prompt:
A prompt that classifies customer inquiries and assigns priority
```

### Process
1. **GATHER**: "What domain?", "Success criteria?"
2. **CLASSIFY**: Classification task, medium complexity
3. **DESIGN**: 7-Point design
4. **DRAFT**: Write initial draft
5. **SELF-LINT**: Verify 8+ score
6. **TEST**: Generate 5 test cases
7. **DELIVER**: Complete prompt + guide

---

## Minute 4: Understand 7-Point

| # | Item | Question |
|---|------|----------|
| 1 | ROLE | Is the AI role clear? |
| 2 | CONTEXT | Is background/context sufficient? |
| 3 | INSTRUCTION | Are instructions specific? |
| 4 | EXAMPLE | Are there 2+ examples? |
| 5 | FORMAT | Is output format specified? |
| 6 | STATE_TRACKING | Is there state management? (multi-step) |
| 7 | TOOL_USAGE | Are tool instructions clear? (tool usage) |

**Score**: Each item 0-2 points, normalized to 10 points

---

## Minute 5: Trigger Keywords

### LINT Mode
- "diagnose", "analyze", "lint"
- "check", "review"

### EXPRESS Mode
- "quick", "brief", "fast"

### BUILD Mode
- "build", "design", "create"
- "new prompt"

### INTERCEPT Pipeline
- `/prompt-smith <your prompt>` - Review Mode
- `/prompt-smith --auto <your prompt>` - Intercept Mode

---

## Next Steps

### Beginner
1. [First LINT Tutorial](first-lint.md) - Detailed LINT usage
2. [First BUILD Tutorial](first-build.md) - Detailed BUILD usage

### Advanced
- [7-Point Quality Check](../references/quality-checklist.md)
- [Claude 4.x Best Practices](../references/claude-4x-best-practices.md)
- [LINT Detailed Guide](../playbooks/lint/full-lint.md)
- [BUILD Detailed Guide](../playbooks/build/build-mode.md)
- [Intercept Pipeline](../playbooks/intercept/review-mode.md)

### Team
- [PR Rules](../playbooks/team/prompt-pr.md)
- [Owner Guide](../playbooks/team/owner-guide.md)
- [Regression Testing](../playbooks/team/regression-testing.md)

---

## Help

If you have issues:
- Type "help"
- See FAQ in SKILL.md

---

*Prompt Smith v2.1.0*
