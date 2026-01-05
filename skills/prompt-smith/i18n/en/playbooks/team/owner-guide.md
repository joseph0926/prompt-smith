# Prompt Owner Guide

An ownership model responsible for the quality and stability of prompt assets.

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Owner Program                           │
├─────────────────────────────────────────────────────────────┤
│  Definition: Person responsible for prompt quality/stability │
│  Principle: Not "most frequent user" but "accountable owner" │
└─────────────────────────────────────────────────────────────┘
```

---

## Owner Assignment Principles

### Assignment criteria
- Assign at least **one Owner per prompt asset (template)**
- Recommend a backup owner (vacations/turnover coverage)

### Suitable owners
- Domain expertise
- Understands prompt quality standards
- Can assess change impact
- Has decision authority in the team

---

## Owner Responsibilities

| Responsibility | Details |
|----------|----------|
| **Maintain quality standards** | Output format, forbidden items, safety rules |
| **PR approval** | Final approval for major/policy changes |
| **Regression test management** | Add new failure cases, maintain set |
| **Drift detection** | At least monthly checks, handle model updates |
| **Incident response** | Immediate response to wrong guidance/policy violations/PII |

---

## Owner Info Template

```markdown
## Ownership

- **Prompt Name**: [prompt name]
- **Version**: v1.0.0
- **Owner**: @username
- **Backup**: @username2
- **Created**: YYYY-MM-DD
- **Last Review**: YYYY-MM-DD
- **Review Frequency**: Monthly
- **Domain**: [domain]
- **Criticality**: High/Medium/Low
```

---

## Owner Cadence

### Day-to-day

| Cadence | Activity |
|------|------|
| Ad hoc | PR review and approval |
| Ad hoc | Add failure cases to regression set |
| Ad hoc | Immediate incident response |

### Recurring

| Cadence | Activity |
|------|------|
| Weekly | Check major prompt behavior |
| Monthly | Run full regression set |
| Quarterly | Full prompt quality review |
| On model update | Drift check |

---

## Drift Detection

### What is drift?
Changes in output from the same prompt due to model updates or time.

### Detection Methods

```markdown
## Drift Checklist

### Output Format
- [ ] JSON keys/structure preserved
- [ ] Required fields included
- [ ] Length constraints met

### Quality
- [ ] Accuracy preserved
- [ ] Consistency preserved
- [ ] Tone/style preserved

### Safety
- [ ] Injection defense effective
- [ ] Forbidden terms respected
- [ ] Policy compliance
```

### Response plan

1. Add drift cases to regression set
2. If needed, submit prompt adjustment PR
3. Record changes in the changelog

---

## Incident Response

### Incident types

| Type | Severity | Response time |
|------|--------|----------|
| Incorrect information | 🔴 High | Immediate |
| Policy violation | 🔴 High | Immediate |
| PII exposure | 🔴 Critical | Immediate |
| Format breakage | 🟡 Medium | Within 4 hours |
| Quality degradation | 🟢 Low | Within 24 hours |

### Response process

```
1. Detect and record the issue
   ↓
2. Assess impact scope
   ↓
3. Temporary mitigation (rollback if needed)
   ↓
4. Root cause analysis
   ↓
5. Fix and add regression test
   ↓
6. Postmortem documentation
```

---

## Owner Handover

### Handover checklist

```markdown
## Owner Handover

### Documentation
- [ ] Prompt specification handed over
- [ ] Regression test set location
- [ ] Changelog history
- [ ] Past incident records

### Permissions
- [ ] PR approval permission transferred
- [ ] Notification channels subscribed
- [ ] Access to related systems

### Knowledge
- [ ] Domain context explained
- [ ] Key constraints
- [ ] Past issues and resolutions
- [ ] Key integrations

### Practice
- [ ] Run regression tests once
- [ ] Review a simple PR once
```

---

## Related References

- [prompt-pr.md](prompt-pr.md) - PR rules
- [regression-testing.md](regression-testing.md) - Regression testing
- [../../references/team-workflow.md](../../references/team-workflow.md) - Team workflow guide
