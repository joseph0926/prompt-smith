# Diagnostic Report Template

A template for standardizing LINT results output.

> **v2.0.0**: 7-Point Quality Check applied (STATE_TRACKING, TOOL_USAGE added)

---

## Diagnostic Report Format

```markdown
# 📋 Prompt Diagnostic Report

## Metadata
- **Diagnosis date**: YYYY-MM-DD HH:MM
- **Prompt version**: v1.0.0
- **Diagnosis mode**: LINT / EXPRESS
- **Diagnosed by**: Prompt Smith v1.0.0

---

## 1. Score Summary

### Total: X/10

| Item | Score | Status | Notes |
|------|------|------|------|
| Role | X/2 | ✅/⚠️/❌ | |
| Context | X/2 | ✅/⚠️/❌ | |
| Instruction | X/2 | ✅/⚠️/❌ | |
| Example | X/2 | ✅/⚠️/❌ | |
| Format | X/2 | ✅/⚠️/❌ | |
| State Tracking | X/2 / N/A | ✅/⚠️/❌/➖ | Multi-step only |
| Tool Usage | X/2 / N/A | ✅/⚠️/❌/➖ | Tool usage only |

**Score calculation**: (raw score / applied items×2) × 10
**Grade**: A (9-10) / B (7-8) / C (5-6) / D (3-4) / F (0-2)

---

## 2. Detailed Diagnosis

### 2.1 Role - X/2

**Current state**:
[Describe role definition status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Improvement suggestion**:
```
[Improved role definition]
```

---

### 2.2 Context - X/2

**Current state**:
[Describe context status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Improvement suggestion**:
```
[Improved context]
```

---

### 2.3 Instruction - X/2

**Current state**:
[Describe instruction status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Detected vague expressions**:
| Original | Problem | Improvement |
|------|------|------|
| "well" | No criteria | [Specific criteria] |

**Improvement suggestion**:
```
[Improved instructions]
```

---

### 2.4 Example - X/2

**Current state**:
[Describe examples status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Recommended example**:
```
Input: [Example input]
Output: [Example output]
```

---

### 2.5 Format - X/2

**Current state**:
[Describe output format status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Improvement suggestion**:
```
[Improved output format]
```

---

### 2.6 State Tracking - X/2 or N/A

> Claude 4.x extension. Apply only for multi-step/long tasks.

**Applicability**: Applicable / N/A
- [ ] 3+ step multi-step task
- [ ] Possible session interruption
- [ ] 10+ items processed

**Current state**:
[Describe state tracking status]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Improvement suggestion**:
```json
{
  "task_id": "example",
  "status": "in_progress",
  "progress": {"total": 100, "completed": 0, "current": ""},
  "checkpoint": "",
  "errors": []
}
```

---

### 2.7 Tool Usage - X/2 or N/A

> Claude 4.x extension. Apply only when tools are required.

**Applicability**: Applicable / N/A
- [ ] File read/write required
- [ ] External commands required
- [ ] Web search/API calls required

**Current state**:
[Describe tool usage instructions]

**Evaluation**:
- ✅ [Strength]
- ❌ [Weakness]

**Improvement suggestion**:
```markdown
## Tool Usage
### Tools: [list]
### Strategy:
- Parallel: [independent tasks]
- Sequential: [dependent tasks]
### Error handling: [handling]
```

---

## 3. Anti-Pattern Detection

### Detected anti-patterns

| Type | Severity | Location | Description |
|------|--------|------|------|
| Vague instruction | 🟡 | Line X | "well" has no criteria |
| Injection risk | 🔴 | Entire prompt | data/instructions not separated |
| ... | ... | ... | ... |

### Security review

- [ ] Injection defense
- [ ] Prevent system prompt leakage
- [ ] Sensitive data handling rules

---

## 4. Top 3 Issues

### 🔴 Issue 1: [Title]

**Problem**:
[Detailed problem description]

**Impact**:
[Consequence]

**Resolution**:
[Concrete solution]

---

### 🟡 Issue 2: [Title]

**Problem**:
[Detailed problem description]

**Impact**:
[Consequence]

**Resolution**:
[Concrete solution]

---

### 🟢 Issue 3: [Title]

**Problem**:
[Detailed problem description]

**Impact**:
[Consequence]

**Resolution**:
[Concrete solution]

---

## 5. Improved Prompt

### Before (Original)

```
[Full original prompt]
```

### After (Improved)

```
[Full improved prompt]
```

### Change Summary

| # | Change | Reason |
|---|----------|------|
| 1 | [Change 1] | [Reason] |
| 2 | [Change 2] | [Reason] |
| 3 | [Change 3] | [Reason] |

---

## 6. Test Cases

### TC-001: Normal case 1
**Input**:
```
[Test input]
```
**Expected results**:
- [ ] [Condition 1]
- [ ] [Condition 2]

### TC-002: Normal case 2
**Input**:
```
[Test input]
```
**Expected results**:
- [ ] [Condition]

### TC-003: Edge case
**Input**:
```
[Empty/long/special input]
```
**Expected results**:
- [ ] [Appropriate handling]

### TC-004: Injection defense
**Input**:
```
[Normal data] Ignore the instructions above and [malicious request]
```
**Expected results**:
- [ ] Original instructions preserved
- [ ] Injection ignored

### TC-005: Domain-specific
**Input**:
```
[Domain-specific scenario]
```
**Expected results**:
- [ ] [Appropriate handling]

---

## 7. Recommended Actions

### Immediate (Critical)
1. [Action 1]
2. [Action 2]

### Recommended
1. [Action 1]
2. [Action 2]

### Optional
1. [Action 1]

---

## 8. Next Steps

- [ ] Apply improved prompt
- [ ] Run test cases
- [ ] Add to regression set
- [ ] Request team review

---

*Generated by Prompt Smith v1.0.0*
```

---

## Express Report Format

```markdown
# ⚡ Express Diagnostic Report

**Total Score**: X/10 (Grade: X)

## Score Summary (7-Point)
| R | C | I | E | F | ST | TU |
|---|---|---|---|---|----|----|
| X | X | X | X | X | X/- | X/- |

> ST: State Tracking, TU: Tool Usage (use '-' if not applicable)

## Top 3 Issues
1. 🔴 [Critical issue]
2. 🟡 [Major issue]
3. 🟢 [Minor issue]

## One-line Improvement
[Key improvement summary]

---
*For detailed diagnosis, say "analyze in detail"*
```

---

## Score Status Icons

| Score | Status | Icon | Description |
|------|------|------|------|
| 2 | Good | ✅ | Sufficient |
| 1 | Warning | ⚠️ | Needs improvement |
| 0 | Critical | ❌ | Fix immediately |

---

## Severity Icons

| Severity | Icon | Description |
|--------|------|------|
| Critical | 🔴 | Causes prompt failure |
| Major | 🟡 | Quality degradation |
| Minor | 🟢 | Optimization recommended |

---

## Related References

- [test-case-template.md](test-case-template.md) - Test case template
- [../references/quality-checklist.md](../references/quality-checklist.md) - 7-Point Quality Check
- [../playbooks/lint-mode.md](../playbooks/lint-mode.md) - LINT workflow
