# Quick Start: 5-Minute Guide

Get started with Prompt Smith in 5 minutes.

---

## What is Prompt Smith?

```
+-------------------------------------------------------------+
|                     Prompt Smith                             |
+-------------------------------------------------------------+
|  Prompt quality management skill                             |
|                                                             |
|  LINT Mode: Diagnose + improve + generate tests              |
|  BUILD Mode: Design prompts from requirements                |
|  INTERCEPT: Real-time prompt improvement pipeline            |
|                                                             |
|  Turn prompts into operational assets with 7-Point QC         |
+-------------------------------------------------------------+
```

---

## 1 Minute: Try LINT

If you already have a prompt, diagnose it right away.

### Input
```
Check this prompt:

Analyze user feedback and extract key issues
```

### Output (Example)
```
Diagnostic Report

Score: 3/10 (Grade: D)

Top 3 Issues:
1. No role definition
2. No examples
3. Unclear output format

Improved Prompt:
[Improved version meeting 7-Point]
```

---

## 2 Minutes: EXPRESS Diagnosis

When you need a quick check:

### Input
```
Quick check:

[Prompt text]
```

### Output (Example)
```
Express Diagnostic Report

Score: 3/10

Top 3 Issues:
1. No role
2. No examples
3. Partial format

One-line improvement: Add role + 2 examples + JSON format
```

---

## 3 Minutes: Try BUILD

When you need a new prompt:

### Input
```
Create a prompt:
A prompt that classifies customer inquiries and assigns priority
```

### Process
1. **GATHER**: "Which domain?", "Success criteria?"
2. **CLASSIFY**: Classification task, medium complexity
3. **DESIGN**: 7-Point design
4. **DRAFT**: Draft the prompt
5. **SELF-LINT**: Validate 8+ points
6. **TEST**: Generate 5 test cases
7. **DELIVER**: Final prompt + guide

---

## 4 Minutes: Understand the 7-Point Check

| # | Item | Question |
|---|------|----------|
| 1 | ROLE | Is the AI role clear? |
| 2 | CONTEXT | Is there sufficient background/context? |
| 3 | INSTRUCTION | Are instructions specific? |
| 4 | EXAMPLE | Are there at least 2 examples? |
| 5 | FORMAT | Is an output format specified? |
| 6 | STATE_TRACKING | Is there state management? (multi-step) |
| 7 | TOOL_USAGE | Are tool instructions clear? (tool use) |

**Score**: Each item 0-2 points, normalized to a 10-point scale.

---

## 5 Minutes: Trigger Keywords

### LINT Mode
- "diagnose", "analyze", "check"
- "check", "review"

### EXPRESS Mode
- "quickly", "briefly", "short"

### BUILD Mode
- "create", "design", "write"
- "new prompt"

### INTERCEPT Pipeline
- `/ps:r <prompt>` - Review Mode
- `/ps:a <prompt>` - Intercept Mode

---

## Next Steps

### Beginner
1. [First LINT tutorial](first-lint.md) - Detailed LINT usage
2. [First BUILD tutorial](first-build.md) - Detailed BUILD usage

### Advanced
- [7-Point Quality Check](../references/quality-checklist.md)
- [Claude 4.x Best Practices](../references/claude-4x-best-practices.md)
- [LINT Detailed Guide](../playbooks/lint/full-lint.md)
- [BUILD Detailed Guide](../playbooks/build/build-mode.md)
- [Intercept Pipeline](../playbooks/intercept/review-mode.md)

### Team
- [PR rules](../playbooks/team/prompt-pr.md)
- [Owner guide](../playbooks/team/owner-guide.md)
- [Regression testing](../playbooks/team/regression-testing.md)

---

## Help

If you run into issues:
- Check the detailed docs in [SKILL.md](../SKILL.md)
- Review common mistakes in [Anti-Patterns](../references/anti-patterns.md)

---

*Prompt Smith v2.3.0*
