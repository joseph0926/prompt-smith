# Template Selection Guide

A decision guide for selecting the right template in the DESIGN step of BUILD Mode.

---

## Template Selection Flowchart

```
                    ┌─────────────────┐
                    │  Task type?     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │Generate │         │Analyze  │         │Transform│
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ Code?   │         │ Evaluate?|         │ Summarize?│
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
    Yes │ No             Yes │ No             Yes │ No
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ Code    │         │Content  │         │Document │
   │Generator│         │Evaluator│         │Summarizer│
   └─────────┘         └─────────┘         └─────────┘
```

---

## 1. Generation Templates

### 1.1 Code Generator

**Good fit**:
- Writing functions/classes/modules
- Implementing API endpoints
- Writing test code

**Key elements**:
```markdown
## Role
You are a senior [language] developer with [N] years of experience.

## Context
- Language: [language] [version]
- Framework: [framework]
- Style Guide: [style guide]

## Output Format
```[language]
// Implementation
```

```[language]
// Tests
```
```

**Checklist**:
- [ ] Language/version specified
- [ ] Style guide specified
- [ ] Tests included
- [ ] Error handling requirements

---

### 1.2 Document Writer

**Good fit**:
- Writing technical docs
- Generating API docs
- Writing README

**Key elements**:
```markdown
## Role
You are a technical writer who specializes in [domain].

## Context
- Audience: [target readers]
- Technical Level: [beginner/intermediate/advanced]
- Purpose: [purpose]

## Output Format
# Title
## Section 1
...
```

---

### 1.3 Content Creator

**Good fit**:
- Marketing content
- Blog posts
- Social media content

**Key elements**:
```markdown
## Role
You are a content creator for [brand/domain].

## Context
- Brand Voice: [tone/style]
- Platform: [platform]
- Target Audience: [audience]
```

---

## 2. Analysis Templates

### 2.1 Content Evaluator

**Good fit**:
- Code reviews
- Document evaluation
- Quality checks

**Key elements**:
```markdown
## Role
You are an expert evaluator who provides objective assessments.

## Rubric
| Criterion | Weight | 0 | 1 | 2 |
|-----------|--------|---|---|---|
| [criterion 1] | 30% |...|...|...|

## Output Format
### Overall Score: X/10
### Criterion Scores
| Criterion | Score | Evidence |
...
```

**Checklist**:
- [ ] Evaluation criteria defined
- [ ] Scoring system specified
- [ ] Evidence required

---

### 2.2 Code Reviewer

**Good fit**:
- PR reviews
- Security reviews
- Performance analysis

**Key elements**:
```markdown
## Role
You are a senior code reviewer focusing on [focus area].

## Review Criteria
- Security: [security checkpoints]
- Performance: [performance checkpoints]
- Maintainability: [maintainability checkpoints]

## Output Format
### Summary
### Issues Found
| Severity | Location | Issue | Suggestion |
```

---

### 2.3 Data Analyzer

**Good fit**:
- Data analysis
- Trend discovery
- Insight generation

**Key elements**:
```markdown
## Role
You are a data analyst specializing in [domain].

## Analysis Framework
1. Descriptive: [current state]
2. Diagnostic: [causes]
3. Prescriptive: [recommendations]
```

---

## 3. Transformation Templates

### 3.1 Document Summarizer

**Good fit**:
- Summarizing long documents
- Meeting notes
- News summaries

**Key elements**:
```markdown
## Role
You are a senior analyst who creates concise, actionable summaries.

## Output Format
### TL;DR
[1-2 sentences]

### Key Points
- Point 1
- Point 2

### Action Items
- [ ] Item 1
```

**Checklist**:
- [ ] Summary length constraints
- [ ] Criteria for key info extraction
- [ ] Use only source information

---

### 3.2 Translator

**Good fit**:
- Language translation
- Terminology localization
- Cultural adaptation

**Key elements**:
```markdown
## Role
You are a professional translator specialized in [domain].

## Context
- Source Language: [source language]
- Target Language: [target language]
- Style: [formal/informal]
- Domain: [domain]
```

---

### 3.3 Format Converter

**Good fit**:
- JSON ↔ XML
- Markdown ↔ HTML
- Data format conversion

**Key elements**:
```markdown
## Input Format
[input schema]

## Output Format
[output schema]

## Conversion Rules
- [rule 1]
- [rule 2]
```

---

## 4. Extraction Templates

### 4.1 Entity Extractor

**Good fit**:
- Named entity recognition
- Information extraction
- Data parsing

**Key elements**:
```markdown
## Role
You are a data extraction specialist.

## Entity Types
- [entity type 1]: [definition]
- [entity type 2]: [definition]

## Output Format
```json
{
  "entities": [
    {"type": "string", "value": "string"}
  ],
  "confidence": 0.0-1.0
}
```
```

**Checklist**:
- [ ] Define extraction targets
- [ ] Include confidence score
- [ ] Handle empty results

---

### 4.2 Classifier

**Good fit**:
- Text classification
- Sentiment analysis
- Category tagging

**Key elements**:
```markdown
## Categories
1. [Category 1]: [definition]
2. [Category 2]: [definition]

## Classification Rules
- [Rule 1]
- [Rule 2]

## Output Format
{
  "category": "string",
  "confidence": 0.0-1.0,
  "reasoning": "string"
}
```

---

## 5. Conversation Templates

### 5.1 Customer Support Agent

**Good fit**:
- Customer inquiry handling
- FAQ bot
- Help desk

**Key elements**:
```markdown
## Role
You are a friendly customer support agent for [company].

## Response Guidelines
- Greeting: [greeting style]
- Problem Solving: [resolution process]
- Escalation: [escalation conditions]

## Forbidden Actions
- Never promise [forbidden items]
- Never share [confidential information]
```

**Checklist**:
- [ ] Brand tone defined
- [ ] Escalation criteria
- [ ] Forbidden actions specified

---

### 5.2 Q&A Assistant

**Good fit**:
- Knowledge-base Q&A
- Document-based answers
- Tutorial bot

**Key elements**:
```markdown
## Knowledge Base
[reference documents/data]

## Response Format
1. Direct Answer
2. Supporting Details
3. Related Topics

## Uncertainty Handling
- If unsure: [handling]
- If out of scope: [handling]
```

---

## Template Selection by Complexity

| Complexity | Recommended items | Template examples |
|--------|----------|------------|
| Simple | 5-Point basic | Entity Extractor, Classifier |
| Medium | 5-Point + details | Code Generator, Document Summarizer |
| Complex | Full 7-Point | Multi-step Code Generator, large-scale Migration |

---

## Quick Selection Table

| What you want to do | Template |
|-------------|--------|
| Write code | Code Generator |
| Write docs | Document Writer |
| Code review | Code Reviewer |
| Evaluate docs | Content Evaluator |
| Summarize docs | Document Summarizer |
| Translate | Translator |
| Extract info | Entity Extractor |
| Classify | Classifier |
| Customer support | Customer Support Agent |
| Q&A | Q&A Assistant |

---

## Related References

- [build-mode.md](build-mode.md) - BUILD workflow
- [requirement-gathering.md](requirement-gathering.md) - Requirements gathering
- [../../templates/prompt-template.md](../../templates/prompt-template.md) - Full template
