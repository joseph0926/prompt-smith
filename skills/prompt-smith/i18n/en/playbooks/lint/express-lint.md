# Express LINT Mode

A simplified diagnosis mode for quick feedback.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Express LINT                               │
├─────────────────────────────────────────────────────────────┤
│  Purpose: quick feedback within 30 seconds                   │
│  Output: score + Top 3 issues + one-line improvement         │
│  Omitted: improved prompt, Before/After, test cases          │
└─────────────────────────────────────────────────────────────┘
```

---

## Triggers

Korean trigger examples are documented in the Korean version.

### English
- "quick lint"
- "fast check"
- "express lint"

---

## Workflow

```
Input → 7-Point Check → Top 3 Issues → One-line Suggestion → Output
         (within 30 seconds)
```

### What it does
1. Calculate the 7-Point Quality Check score
2. Identify the 3 most critical issues
3. Summarize the key improvement point in one line

### What it omits
- Detailed diagnosis explanation
- Before/After comparison
- Full improved prompt
- 5 test cases

---

## Output Format

```markdown
# ⚡ Express Diagnostic Report

**Total Score**: X/10 (Grade: X)

## Score Summary (7-Point)
| R | C | I | E | F | ST | TU |
|---|---|---|---|---|----|----|
| X | X | X | X | X | X/- | X/- |

> R: Role, C: Context, I: Instruction, E: Example, F: Format
> ST: State Tracking, TU: Tool Usage (use '-' if not applicable)

## Top 3 Issues
1. 🔴 [Critical issue]
2. 🟡 [Major issue]
3. 🟢 [Minor issue]

## One-line Improvement
[Summary of the key improvement]

---
*For detailed diagnosis, say "analyze in detail"*
```

---

## Examples

### Input
```
Analyze user feedback and extract key issues
```

### Express Output
```markdown
# ⚡ Express Diagnostic Report

**Total Score**: 3/10 (Grade: D)

## Score Summary (7-Point)
| R | C | I | E | F | ST | TU |
|---|---|---|---|---|----|----|
| 0 | 1 | 1 | 0 | 1 | - | - |

## Top 3 Issues
1. 🔴 Missing role definition - unclear perspective for analysis
2. 🔴 No examples - cannot infer format/level for "key issues"
3. 🟡 Partial output format - needs specific JSON/markdown format

## One-line Improvement
"You are a UX researcher..." + add 2 examples + define JSON output format

---
*For detailed diagnosis, say "analyze in detail"*
```

---

## Express vs Full Comparison

| Item | Express | Full |
|------|---------|------|
| Time | ~30 sec | ~2 min |
| Score | ✅ | ✅ |
| Top 3 issues | ✅ (brief) | ✅ (detailed) |
| Improved prompt | ❌ | ✅ |
| Before/After | ❌ | ✅ |
| Test cases | ❌ | ✅ (5) |
| Change summary | ❌ | ✅ |
| Anti-pattern analysis | ❌ | ✅ |

---

## Use Scenarios

### Express recommended
- Quick validation in the idea phase
- Comparing multiple prompts
- When you only need direction
- When time is tight

### Full recommended
- Final check before production
- Need team review materials
- Need test cases
- Need detailed improvements

---

## Switching to Full Diagnosis

After Express, if you need detailed analysis:

```
"analyze in detail"
"run Full LINT"
"create an improved prompt"
"add test cases"
```

---

## Related References

- [full-lint.md](full-lint.md) - Full LINT Detailed Guide
- [../../templates/diagnostic-report.md](../../templates/diagnostic-report.md) - Report template
- [../../references/quality-checklist.md](../../references/quality-checklist.md) - 7-Point details
