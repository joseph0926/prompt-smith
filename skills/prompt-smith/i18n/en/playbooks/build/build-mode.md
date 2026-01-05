# BUILD Mode Workflow

A 7-step workflow that designs high-quality prompts from requirements.

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD Workflow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   GATHER  →  CLASSIFY  →  DESIGN  →  DRAFT                 │
│     ↓                                                       │
│   SELF-LINT  →  TEST  →  DELIVER                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   Goal: 8+ point prompt + 5 test cases                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: GATHER (Requirements Collection)

### Purpose
Understand the prompt's goal, audience, and constraints.

### Collected items

```markdown
## Requirements Checklist

### Required
- [ ] **Goal**: What the prompt must achieve
- [ ] **Audience**: Who uses it
- [ ] **Domain**: Which field/industry
- [ ] **Success criteria**: How success is measured

### Recommended
- [ ] **Input format**: What data comes in
- [ ] **Output format**: What form the result should take
- [ ] **Constraints**: Prohibited items, regulations, limits
- [ ] **Existing examples**: Reference prompts/outputs

### Claude 4.x Extensions
- [ ] **Multi-step?**: 3+ steps?
- [ ] **Tool usage?**: Files/commands/API needed?
```

### Question examples

| Category | Question |
|----------|----------|
| Goal | "What do you want to achieve with this prompt?" |
| Audience | "Who will use this prompt?" |
| Domain | "Which field is this used in?" |
| Success | "What outcome counts as success?" |
| Input | "What data/information is provided as input?" |
| Output | "What output format do you need?" |
| Constraints | "Is there anything that must be avoided?" |

---

## Step 2: CLASSIFY (Classification)

### Purpose
Classify the task type and complexity to select an appropriate template.

### Classification Criteria

```
┌─────────────────────────────────────────────────────────────┐
│                      Task Types                              │
├─────────────────────────────────────────────────────────────┤
│  1. Generation                                              │
│     - Code writing, document writing, content creation      │
│                                                             │
│  2. Analysis                                                │
│     - Code review, data analysis, document evaluation       │
│                                                             │
│  3. Transformation                                          │
│     - Translation, format conversion, migration             │
│                                                             │
│  4. Extraction                                              │
│     - Information extraction, classification, summarization │
│                                                             │
│  5. Conversation                                            │
│     - Customer support, Q&A, chatbot                        │
└─────────────────────────────────────────────────────────────┘
```

### Complexity classification

| Complexity | Characteristics | Recommended items |
|--------|------|----------|
| Simple | Single step, clear I/O | 5-Point (basic) |
| Medium | 2-3 steps, conditional logic | 5-Point + detailed instructions |
| Complex | 4+ steps, tool usage, state management | 7-Point (extended) |

### Claude 4.x extension decision

```markdown
## STATE_TRACKING needed?
- [ ] 3+ sequential steps
- [ ] 10+ items processed sequentially
- [ ] Possible session interruption
→ If any, apply STATE_TRACKING

## TOOL_USAGE needed?
- [ ] File read/write
- [ ] External commands
- [ ] Web/API calls
→ If any, apply TOOL_USAGE
```

---

## Step 3: DESIGN (Design)

### Purpose
Design each element of the 7-Point Quality Check.

### Design checklist

```markdown
## 7-Point Design

### 1. ROLE
- Expertise: [domain expert]
- Experience: [years]
- Traits: [style]

### 2. CONTEXT
- Domain: [industry]
- Users: [audience]
- Constraints: [regulations/limits]
- Assumptions: [assumptions]

### 3. INSTRUCTION
- Steps: [1. 2. 3. ...]
- Conditions: [if-then rules]
- Forbidden: [do-not-do items]

### 4. EXAMPLE
- Example 1: [input → output]
- Example 2: [another case]
- Edge: [edge case]

### 5. FORMAT
- Format: [JSON/Markdown/table]
- Schema: [structure definition]
- Constraints: [length/required fields]

### 6. STATE_TRACKING (if applicable)
- State file: [format]
- Checkpoints: [timing]
- Resume: [method]

### 7. TOOL_USAGE (if applicable)
- Tools: [list]
- Strategy: [parallel/sequential]
- Errors: [handling]
```

### Template selection

| Type | Template |
|------|--------|
| Document summary | Document Summarizer |
| Classification/extraction | Entity Extractor |
| Code generation | Code Generator |
| Customer support | Customer Support Agent |
| Analysis/evaluation | Content Evaluator |

→ Details: [template-selection.md](template-selection.md)

---

## Step 4: DRAFT (Draft)

### Purpose
Write a prompt draft based on the design.

### Writing order

1. **Role section** - Define identity
2. **Context section** - Background info
3. **Instructions section** - Step-by-step instructions
4. **Examples section** - At least 2
5. **Format section** - Output format
6. **State/Tool section** - If applicable

### Writing principles

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude 4.x Writing Principles             │
├─────────────────────────────────────────────────────────────┤
│  ✓ Be explicit: ask directly for what you want               │
│  ✓ Provide motivation: explain why it's needed               │
│  ✓ Align examples: example format = desired output format    │
│  ✓ Structure output: XML tags or JSON schema                 │
│  ✓ Verifiable: success criteria are objective                │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 5: SELF-LINT (Self Validation)

### Purpose
Validate the draft with the 7-Point Quality Check.

### Validation process

```markdown
## Self-LINT Checklist

### Base 5 items
- [ ] ROLE: Specific role definition (2 points)
- [ ] CONTEXT: Sufficient context (2 points)
- [ ] INSTRUCTION: Clear instructions (2 points)
- [ ] EXAMPLE: 2+ examples (2 points)
- [ ] FORMAT: Complete format definition (2 points)

### Extended 2 items (if applicable)
- [ ] STATE_TRACKING: Systematic state management (2 points)
- [ ] TOOL_USAGE: Clear tool instructions (2 points)

### Score calculation
Raw score: ___ / (applied items × 2)
Final score: (raw score/applied items×2) × 10 = ___
```

### Pass criteria

| Score | Result |
|------|------|
| 8+ | ✅ Proceed to Step 6 |
| Below 8 | ↩️ Return to Step 4 and revise |

### Improvement priority

Improve the lowest-scoring items first:
1. 0-point items: Add immediately
2. 1-point items: Clarify/expand
3. Remove anti-patterns

---

## Step 6: TEST (Test Generation)

### Purpose
Generate 5 test cases to validate the prompt.

### Test Structure

| # | Type | Purpose |
|---|------|------|
| TC-01 | Normal case 1 | Most common use |
| TC-02 | Normal case 2 | Another normal use |
| TC-03 | Edge case | Boundary conditions |
| TC-04 | Injection defense | Security validation |
| TC-05 | Domain-specific | Domain-specific edge case |

### Test template

```markdown
## TC-0X: [Case name]

### Input
```
[Test input]
```

### Expected results
- [ ] [Verifiable condition 1]
- [ ] [Verifiable condition 2]
- [ ] [Verifiable condition 3]

### Status
- [ ] Pass
- [ ] Fail
```

---

## Step 7: DELIVER (Deliver)

### Purpose
Deliver the completed prompt and test cases.

### Output Structure

```markdown
# 📋 BUILD Result

## Prompt Info
- **Name**: [Prompt name]
- **Version**: v1.0.0
- **Type**: [generation/analysis/transformation/extraction/conversation]
- **Complexity**: [simple/medium/complex]
- **LINT Score**: X/10

---

## Prompt

[Full prompt content]

---

## Usage Guide

### Input format
[How to provide input]

### Expected output
[Output format description]

### Notes
- [Note 1]
- [Note 2]

---

## Test Cases

[5 test cases]

---

## Next Steps
- [ ] Validate with test cases
- [ ] Test in a real environment
- [ ] Improve based on feedback
- [ ] Build a regression set
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILD Workflow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GATHER    Collect requirements                           │
│               → goal/audience/domain/constraints/success     │
│                                                             │
│  2. CLASSIFY  Classify                                      │
│               → type + complexity + extensions              │
│                                                             │
│  3. DESIGN    Design                                        │
│               → design each 7-Point element                 │
│                                                             │
│  4. DRAFT     Draft                                         │
│               → write based on template                     │
│                                                             │
│  5. SELF-LINT Validate                                      │
│               → if below 8, return to Step 4                │
│                                                             │
│  6. TEST      Test                                          │
│               → generate 5 test cases                       │
│                                                             │
│  7. DELIVER   Deliver                                       │
│               → prompt + guide + tests                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related References

- [requirement-gathering.md](requirement-gathering.md) - Requirements gathering details
- [template-selection.md](template-selection.md) - Template selection guide
- [../templates/build-report.md](../templates/build-report.md) - BUILD results template
- [../references/quality-checklist.md](../references/quality-checklist.md) - 7-Point details
