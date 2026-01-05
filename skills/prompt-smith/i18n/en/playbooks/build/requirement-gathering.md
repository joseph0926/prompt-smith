# Requirements Gathering Guide

A detailed guide for the GATHER step of BUILD Mode.

---

## Collection Framework

```
┌─────────────────────────────────────────────────────────────┐
│                   Requirements 5W1H                          │
├─────────────────────────────────────────────────────────────┤
│  WHO    Who uses it?                                        │
│  WHAT   What should it achieve?                             │
│  WHERE  In what context/environment?                        │
│  WHEN   When/how often is it used?                          │
│  WHY    Why is it needed?                                   │
│  HOW    How is success measured?                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Required Items

### 1. Goal (WHAT)

**Questions**:
- "What do you want to achieve with this prompt?"
- "What is the final deliverable?"

**Good answer examples**:
- "Classify customer inquiries and assign priority"
- "Summarize technical docs so non-developers can understand"

**Bad answers (need follow-up)**:
- "I need an AI assistant" → "Which task should it help with?"
- "I want a good answer" → "How do you define 'good'?"

---

### 2. Target User (WHO)

**Questions**:
- "Who will use this prompt?"
- "Who will consume the output?"

**Considerations**:
| User type | What to consider |
|-------------|----------|
| Developers | Technical terms OK, code examples useful |
| Non-developers | Minimize jargon, visual explanations |
| Executives | Summary-focused, decision support |
| Customers | Friendly tone, explain technical terms |

---

### 3. Domain (WHERE)

**Questions**:
- "Which field/industry is this used in?"
- "Are there any special regulations or standards?"

**Domain considerations**:

```markdown
## Finance
- PCI-DSS, SOX compliance
- Numeric accuracy required
- Legal disclaimers

## Healthcare
- HIPAA compliance
- No medical advice
- Recommend professional consultation

## Legal
- Legal advice disclaimer
- Jurisdiction specified
- Accurate citations

## Education
- Age-appropriate content
- Adjust to learning level
- Encouraging tone

## E-commerce
- Refund/return policy
- Inventory accuracy
- Privacy protection
```

---

### 4. Success Criteria (HOW)

**Questions**:
- "What outcome counts as success?"
- "How do you define failure?"

**Good success criteria**:
- ✅ "Classification accuracy 95%+"
- ✅ "Response time under 3 seconds"
- ✅ "Customer satisfaction 4.5/5+"

**Bad success criteria**:
- ❌ "Good results" (no criteria)
- ❌ "Fast response" (not quantified)
- ❌ "Accurate information" (no measurement)

---

## Recommended Items

### 5. Input Format

**Questions**:
- "What data comes in as input?"
- "Can you show an input example?"

**Checklist**:
```markdown
- [ ] Data format (text/JSON/CSV/image)
- [ ] Data size (short sentences vs long documents)
- [ ] Language (Korean/English/multilingual)
- [ ] Special characters/emoji included
- [ ] Structured or not (free text vs structured)
```

---

### 6. Output Format

**Questions**:
- "What form should the output take?"
- "How will the output be used?"

**Format options**:

| Use case | Recommended format |
|------|----------|
| API integration | JSON |
| Human reading | Markdown |
| Spreadsheet | CSV/table |
| Report | Structured markdown |

---

### 7. Constraints

**Questions**:
- "Is there anything we must avoid?"
- "Are there any restrictions?"

**Constraint types**:

```markdown
## Content constraints
- Forbidden topics
- Sensitive data handling
- Tone/style limits

## Technical constraints
- Token limits
- Response time
- Format restrictions

## Legal constraints
- Copyright
- Privacy
- Regulatory compliance

## Business constraints
- Brand guidelines
- Competitor mentions prohibited
- Pricing/promises restrictions
```

---

### 8. Existing Examples

**Questions**:
- "Are there any existing prompts we can reference?"
- "Do you have examples of desired output?"

**How to use them**:
- Good examples → derive success criteria
- Bad examples → identify anti-patterns
- Format examples → decide output format

---

## Claude 4.x Extension Collection

### 9. Multi-step Requirement (STATE_TRACKING)

**Questions**:
- "Is this task split into multiple steps?"
- "Should it resume if interrupted?"

**Criteria**:
```markdown
## STATE_TRACKING needed (if any apply)
- [ ] 3+ sequential steps
- [ ] 10+ items processed sequentially
- [ ] Long-running task (possible interruption)
- [ ] Checkpoints/rollback needed
```

---

### 10. Tool Usage Requirement (TOOL_USAGE)

**Questions**:
- "Do you need to read/write files?"
- "Do you need to run external commands?"
- "Do you need web search or API calls?"

**Criteria**:
```markdown
## TOOL_USAGE needed (if any apply)
- [ ] File system access (read/write)
- [ ] External command execution (Bash)
- [ ] Web search/page fetch
- [ ] External API calls
```

---

## Collection Template

```markdown
# Requirements Gathering Result

## Basic Info
- **Project name**:
- **Date**: YYYY-MM-DD
- **Requester**:

---

## Required Items

### Goal (WHAT)
[What you want to achieve]

### Audience (WHO)
[Users/consumers]

### Domain (WHERE)
[Field/industry/context]

### Success Criteria (HOW)
- [ ] [Quantitative criterion 1]
- [ ] [Quantitative criterion 2]

---

## Recommended Items

### Input Format
[Format/size/language]

### Output Format
[JSON/Markdown/table]

### Constraints
- [Constraint 1]
- [Constraint 2]

### Existing Examples
[Attach if available]

---

## Claude 4.x Extensions

### STATE_TRACKING
- Needed: [Yes/No]
- Reason: [if applicable]

### TOOL_USAGE
- Needed: [Yes/No]
- Required tools: [if applicable]

---

## Classification Result
- **Type**: [generation/analysis/transformation/extraction/conversation]
- **Complexity**: [simple/medium/complex]
- **Applied items**: [5-Point / 7-Point]
```

---

## Related References

- [build-mode.md](build-mode.md) - Full BUILD workflow
- [template-selection.md](template-selection.md) - Template selection
- [../../references/quality-checklist.md](../../references/quality-checklist.md) - 7-Point details
