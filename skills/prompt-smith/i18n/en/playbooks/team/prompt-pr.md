# Prompt PR Rules

PR (Pull Request) rules for safely managing prompt changes.

**Core principle: prompt changes = code changes**

---

## Basic Principles

```
┌─────────────────────────────────────────────────────────────┐
│                    Prompt PR 5 Principles                    │
├─────────────────────────────────────────────────────────────┤
│  1. PR only           No verbal/DM distribution              │
│  2. Before/After      Compare changes                        │
│  3. Test cases        Minimum 5                              │
│  4. Risk section      Required for safety/policy impact      │
│  5. Priority          Stability > Features > Convenience     │
└─────────────────────────────────────────────────────────────┘
```

---

## PR Template

```markdown
## Goal
[One sentence describing the purpose]

## Context
- Domain/Audience:
- Impact scope:

## Change Type
- [ ] New
- [ ] Improve
- [ ] Hotfix
- [ ] Security
- [ ] Breaking

## Change Summary (3 lines)
1.
2.
3.

## Before → After

### Before
```
[Original prompt or relevant section]
```

### After
```
[Updated prompt or relevant section]
```

### Rationale
[Why this change was made]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Test Cases
### Normal Cases
1.
2.

### Edge Cases
1.

### Injection Defense Cases
1.

### Domain-Specific Cases
1.

## Risk/Safety Checks (if applicable)
- [ ] PII/sensitive data handling verified
- [ ] Avoid unsupported certainty verified
- [ ] Injection defense verified

## Rollback Plan
[How to revert to the previous version if issues occur]
```

---

## Review Checklist

### Quality Check

- [ ] Is the goal/audience/scope clear?
- [ ] Have vague phrases been replaced with rules/constraints/examples?
- [ ] Is the output format enforced (required keys/sections/length)?
- [ ] Are success criteria verifiable?

### Stability Check (Regression)

- [ ] At least 5 test cases?
- [ ] Are past failure cases included in the regression set?
- [ ] Is backward compatibility maintained?

### Safety/Security Check

- [ ] Does it avoid following instructions embedded in input data (injection)?
- [ ] Are there rules to prevent unsupported certainty?
- [ ] Are policy-sensitive areas handled with process/confirmation instead of definitive answers?

---

## Approval/Merge Criteria

| Change Type | Reviewers | Additional Conditions |
|-----------|--------|------------|
| Minor change | 1 | Tests passing |
| Major change | 2 | Owner approval + regression set passing |
| Hotfix | 1 (fast merge) | PR to strengthen regression set within 24h |
| Breaking | 2 + Owner | Migration plan required |

---

## Guidelines by Change Type

### New
- Add a new prompt
- No impact on existing system
- At least 5 test cases

### Improve
- Improve existing prompt quality
- Preserve behavior compatibility
- Before/After comparison required

### Hotfix
- Urgent fix for production issues
- Fast merge allowed
- Strengthen regression tests within 24h

### Security
- Injection defense, policy compliance
- Risk section required
- Security reviewer required

### Breaking
- Output format changes
- Impacts downstream systems
- Migration guide required

---

## Related References

- [owner-guide.md](owner-guide.md) - Owner program
- [regression-testing.md](regression-testing.md) - Regression testing
- [../../references/team-workflow.md](../../references/team-workflow.md) - Team workflow guide
