# 7-Point Quality Check Detailed Guide

The core framework for prompt quality evaluation. All LINT diagnostics are performed using these 7 perspectives.

> **v2.0.0 change**: Expanded from 5-Point to 7-Point (Claude 4.x optimized)

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 7-Point Quality Check                       │
├─────────────────────────────────────────────────────────────┤
│  [Base 5 items - always evaluated]                           │
│  1. ROLE        Define AI identity and perspective           │
│  2. CONTEXT     Background, context, constraints             │
│  3. INSTRUCTION Specific and clear instructions              │
│  4. EXAMPLE     Input-output examples (few-shot)             │
│  5. FORMAT      Output format and structure                  │
├─────────────────────────────────────────────────────────────┤
│  [Claude 4.x extensions - only if applicable]                │
│  6. STATE_TRACKING  State management for long tasks          │
│  7. TOOL_USAGE      Clarity of tool usage instructions       │
├─────────────────────────────────────────────────────────────┤
│  Score: (raw score/applied items×2) × 10                     │
│  N/A items excluded from denominator                         │
└─────────────────────────────────────────────────────────────┘
```

### Score calculation examples

| Scenario | Applied items | Raw score | Calculation | Final score |
|----------|----------|--------|------|----------|
| Simple prompt | 5 | 8 | (8/10)×10 | 8.0 |
| Tool usage | 6 | 10 | (10/12)×10 | 8.3 |
| Long task + tools | 7 | 12 | (12/14)×10 | 8.6 |

---

## 1. ROLE

### Definition
Define the perspective and expertise the AI should respond with.

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No role definition | "Summarize this" |
| **1** | Role exists but vague | "Answer like an expert" |
| **2** | Specific role definition | "You are a senior Python developer with 10 years of experience in financial systems" |

### Checklist

- [ ] "You are a..." or equivalent role definition exists
- [ ] Domain expertise specified
- [ ] Experience level specified (if needed)
- [ ] Role is consistent with the task

### Good example

```markdown
You are a senior technical writer who specializes in API documentation.
You have experience writing docs for REST APIs used by external developers.
Your documentation style is concise, example-driven, and developer-friendly.
```

### Bad example

```markdown
# No role
Write API docs

# Vague role
Write docs like an expert
```

### Improvement pattern

```markdown
# Before
Write documentation

# After
You are a technical writer who creates clear, developer-friendly documentation.
Your goal is to help developers quickly understand and use the API.
```

---

## 2. CONTEXT

### Definition
Provide the background, domain, and constraints where the prompt is used.

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No context info | "Review this code" |
| **1** | Partial context | "Review this Python code" |
| **2** | Sufficient context | "Python 3.11 backend for financial services. PCI-DSS compliance required." |

### Checklist

- [ ] Domain/industry specified
- [ ] Target user defined
- [ ] Tech stack/environment specified (for technical tasks)
- [ ] Regulatory/policy constraints (if applicable)
- [ ] Assumptions stated

### Good example

```markdown
## Context
- **Domain**: E-commerce payment processing
- **Tech Stack**: Python 3.11, FastAPI, PostgreSQL
- **Users**: Internal developers and external partners
- **Compliance**: PCI-DSS Level 1
- **Scale**: 10K+ transactions per second
```

### Bad example

```markdown
# No context
Review this code

# Insufficient context
It's Python code. Please review.
```

### Improvement pattern

```markdown
# Before
Improve this function

# After
## Context
This function is part of an order processing system.
- Must handle 1000 TPS on average
- Database connection pool is limited
- Retry logic needed on failure
```

---

## 3. INSTRUCTION

### Definition
Define the specific and clear actions the AI should perform.

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No instruction / very vague | "Do it well" |
| **1** | Instruction exists but vague | "Summarize cleanly" |
| **2** | Specific and clear | "Summarize in 3 sentences; mark one key keyword per sentence in brackets" |

### Checklist

- [ ] Specific action instructions
- [ ] No vague expressions ("well", "cleanly", "somewhat", etc.)
- [ ] Step-by-step process (for complex tasks)
- [ ] Clear criteria/conditions

### Vague expression glossary

| Vague expression | Problem | Better example |
|-------------|--------|----------|
| "well" | Unclear criteria | "no errors", "within 3 seconds", "95% accuracy" |
| "cleanly" | Subjective | "remove extra whitespace", "consistent indentation" |
| "moderately" | Unclear range | "300-500 chars", "3-5 items" |
| "naturally" | No criteria | "colloquial tone", "no formal language" |
| "good" | Undefined | List concrete quality criteria |

### Good example

```markdown
## Instructions
1. Read the input text carefully
2. Identify the main topic and 3 key points
3. Write a summary following this structure:
   - First sentence: Main topic
   - Second sentence: Most important point
   - Third sentence: Implications or next steps
4. Keep each sentence under 25 words
5. Do not add information not present in the original
```

### Bad example

```markdown
# Vague
Summarize well

# Insufficient
Summarize. Keep it short.
```

---

## 4. EXAMPLE

### Definition
Provide examples of input and expected output so the AI can learn the pattern.

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No examples | Only instructions |
| **1** | 1 example or incomplete example | Input only, no output |
| **2** | 2+ complete examples | 2-3 input-output pairs |

### Checklist

- [ ] Input-output pairs
- [ ] Covers diverse cases
- [ ] Reflects desired style/format
- [ ] Includes edge cases (if needed)

### Few-shot example pattern

```markdown
## Examples

### Example 1
**Input**: "The meeting was productive. We decided to launch next month."
**Output**:
{
  "sentiment": "positive",
  "key_decision": "launch next month",
  "action_items": []
}

### Example 2
**Input**: "We need to fix the bug before release. John will handle it by Friday."
**Output**:
{
  "sentiment": "neutral",
  "key_decision": "fix bug before release",
  "action_items": ["John: fix bug by Friday"]
}

### Example 3 (Edge Case)
**Input**: ""
**Output**:
{
  "error": "Empty input provided",
  "sentiment": null,
  "key_decision": null,
  "action_items": []
}
```

### Good examples

```markdown
## Examples

Input: "Apple announced new iPhone"
Output: {"category": "technology", "entities": ["Apple", "iPhone"]}

Input: "Stock market crashed today"
Output: {"category": "finance", "entities": ["stock market"]}
```

### Bad examples

```markdown
# No examples
Classify categories

# Incomplete example
For example, "Apple announced..." is technology
(no output format)
```

---

## 5. FORMAT

### Definition
Define the structure and format the AI's response must follow.

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No format specified | Free-form |
| **1** | Partial | "Return JSON" (no schema) |
| **2** | Complete | JSON schema + field descriptions |

### Checklist

- [ ] Output format specified (JSON, markdown, table, etc.)
- [ ] Structure/fields defined
- [ ] Required/optional fields separated
- [ ] Types defined (string, number, array, etc.)
- [ ] Length/size constraints

### Format templates

#### JSON format
```markdown
## Output Format
Return a valid JSON object with the following structure:

{
  "summary": "string (max 100 characters)",
  "confidence": "number (0.0 to 1.0)",
  "categories": ["string", ...],  // 1-3 items
  "metadata": {
    "processed_at": "ISO 8601 timestamp",
    "model_version": "string"
  }
}

Required fields: summary, confidence
Optional fields: categories, metadata
```

#### Markdown format
```markdown
## Output Format
Use the following markdown structure:

# Title
[One-line title]

## Summary
[2-3 sentences]

## Key Points
- Point 1
- Point 2
- Point 3

## Conclusion
[1 sentence]

Constraints:
- Total length: 200-300 words
- Use bullet points, not numbered lists
```

#### Table format
```markdown
## Output Format
Return a markdown table with these columns:

| ID | Name | Status | Notes |
|----|------|--------|-------|
| number | string | enum(active,inactive,pending) | string (optional) |

- Sort by ID ascending
- Max 10 rows
- Leave Notes empty if not applicable
```

### Good example

```markdown
## Output Format
Respond with valid JSON:

{
  "answer": "string (direct answer to the question)",
  "confidence": 0.0-1.0,
  "sources": ["string", ...],
  "follow_up_questions": ["string", "string"]
}

- answer: Required. Max 200 characters.
- confidence: Required. Your certainty level.
- sources: Optional. References used.
- follow_up_questions: Required. Exactly 2 questions.
```

### Bad example

```markdown
# No format
Answer the question

# Insufficient format
Return JSON (no schema)
```

---

## 6. STATE_TRACKING (Claude 4.x Extension)

### Definition
Define how to track and manage progress for long-running or multi-step tasks.

### When to apply
- [ ] 3+ step multi-step tasks
- [ ] Long tasks with possible session interruption
- [ ] Tasks requiring checkpoints/rollback
- [ ] Sequential processing of multiple files/resources

**If none apply, mark N/A (excluded from scoring)**

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No state management (when needed) | "Process 10 files" (no progress tracking) |
| **1** | Partial state management | "Show progress" (no structure) |
| **2** | Systematic state management | JSON state + checkpoints + resume support |

### Checklist

- [ ] State storage format defined (JSON recommended)
- [ ] Checkpoint timing specified
- [ ] Resume method defined
- [ ] Progress display method defined
- [ ] Completion criteria defined

### Good example

```markdown
## State Tracking

### State file format
```json
{
  "task_id": "migration-001",
  "total_items": 100,
  "processed": 45,
  "current_item": "users/profile.ts",
  "status": "in_progress",
  "errors": [],
  "checkpoint": "2024-01-15T10:30:00Z"
}
```

### Checkpoint rules
- Save after every 10 items
- Save immediately on error
- Record in `state.json`

### Resume method
1. Read `state.json`
2. Continue after `processed`
3. Delete state file on completion
```

### Bad example

```markdown
# No state management
Migrate 100 files

# Insufficient
Show progress while you work
```

### Improvement pattern

```markdown
# Before
Convert all test files from Jest to Vitest

# After
## State Tracking
- Before start: create target list → `migration-state.json`
- After each file: update state
- Every 10 files: git commit (checkpoint)
- On failure: add to errors array, continue
- Resume: continue after processed in state.json
```

---

## 7. TOOL_USAGE (Claude 4.x Extension)

### Definition
Clearly define which tools to use and how to use them.

### When to apply
- [ ] File read/write required
- [ ] External commands required
- [ ] Web search/API calls required
- [ ] Combine multiple tools

**If none apply, mark N/A (excluded from scoring)**

### Scoring criteria

| Score | Criteria | Example |
|------|------|------|
| **0** | No tool instructions (when needed) | "Find and fix files" |
| **1** | Partial tool instructions | "Search with grep" (no strategy) |
| **2** | Clear tool instructions | Tool criteria + parallel/sequential + error handling |

### Checklist

- [ ] Tool list specified
- [ ] Tool selection criteria defined
- [ ] Parallel vs sequential strategy defined
- [ ] Error handling for tool failures defined
- [ ] How to use tool outputs specified

### Tool usage pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel execution (independent tasks)                      │
│  ────────────────────                                       │
│  Read multiple files → parallel Read calls                   │
│  Independent searches → parallel Grep/Glob                   │
│  No dependency between tasks → concurrent execution          │
├─────────────────────────────────────────────────────────────┤
│  Sequential execution (dependent tasks)                      │
│  ────────────────────                                       │
│  Read → analyze → edit (dependent results)                   │
│  Search → locate files → read content                        │
│  mkdir → create file → write content                         │
└─────────────────────────────────────────────────────────────┘
```

### Good example

```markdown
## Tool Usage

### Tools
- **Glob**: file pattern search (`*.test.ts`)
- **Read**: read file contents
- **Edit**: modify files
- **Bash**: run tests

### Strategy
1. Use Glob to list all test files (once)
2. Read files in parallel (independent)
3. Analyze and Edit sequentially (dependent)
4. After all edits, run tests with Bash

### Error handling
- Read failure: skip file, record error
- Edit failure: rollback and notify
- Bash failure: analyze results and propose fixes

### Tool selection criteria
| Situation | Tool | Reason |
|------|------|------|
| Find files | Glob (not find) | Faster and safer |
| Search content | Grep (not grep) | Better permission handling |
| Edit files | Edit (not sed) | Safer edits |
```

### Bad example

```markdown
# No tool specified
Fix TypeScript errors in the project

# Insufficient
Search with grep and fix
```

### Improvement pattern

```markdown
# Before
Find deprecated APIs and replace them

# After
## Tool Usage

### Step 1: Search (parallel)
- Glob: `**/*.ts`, `**/*.tsx` file list
- Grep: `deprecatedFunction` pattern search
→ These can run in parallel

### Step 2: Analysis (sequential)
- Use search results to select target files
- Read each file for context
→ Depends on Step 1

### Step 3: Edit (sequential)
- Edit each file
- Validate after each edit

### Step 4: Verify
- Bash: `npm run typecheck`
- If failure: review changes
```

---

## Score Interpretation Guide

| Total score | Grade | Interpretation | Recommended action |
|------|------|------|----------|
| 9-10 | A | Production-ready | Test then deploy |
| 7-8 | B | Good, improvement recommended | Minor improvements before use |
| 5-6 | C | Needs improvement | Strengthen key items |
| 3-4 | D | Poor | Full rewrite recommended |
| 0-2 | F | Unacceptable | Redesign from scratch |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                7-POINT QUALITY CHECK                        │
├─────────────────────────────────────────────────────────────┤
│  [Base 5 items - always evaluated]                           │
│                                                             │
│  ROLE (0-2)                                                  │
│  ✓ "You are a [specific role]..."                           │
│  ✓ Domain expertise + experience                             │
│                                                             │
│  CONTEXT (0-2)                                               │
│  ✓ Domain/industry                                           │
│  ✓ Users/audience                                            │
│  ✓ Constraints                                               │
│                                                             │
│  INSTRUCTION (0-2)                                           │
│  ✓ Specific actions                                          │
│  ✓ No vagueness                                              │
│  ✓ Steps for complex tasks                                   │
│                                                             │
│  EXAMPLE (0-2)                                               │
│  ✓ Input-output pairs                                        │
│  ✓ 2+ examples                                               │
│  ✓ Diverse cases                                             │
│                                                             │
│  FORMAT (0-2)                                                │
│  ✓ Format specified (JSON/MD/table)                          │
│  ✓ Schema/structure                                          │
│  ✓ Length constraints                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Claude 4.x extensions - only if applicable]                │
│                                                             │
│  STATE_TRACKING (0-2/N/A)                                    │
│  ✓ State format (JSON)                                       │
│  ✓ Checkpoint timing                                         │
│  ✓ Resume method                                             │
│  Applies to: multi-step/long tasks                           │
│                                                             │
│  TOOL_USAGE (0-2/N/A)                                        │
│  ✓ Tool list                                                 │
│  ✓ Parallel/sequential strategy                              │
│  ✓ Error handling                                            │
│  Applies to: file/command/API usage                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Score = (raw score/applied items×2) × 10                    │
│  9+:A | 7-8:B | 5-6:C | 3-4:D | 0-2:F                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Related References

- [anti-patterns.md](anti-patterns.md) - Patterns to avoid
- [../playbooks/lint/full-lint.md](../playbooks/lint/full-lint.md) - LINT workflow
- [../templates/prompt-template.md](../templates/prompt-template.md) - Prompt template
