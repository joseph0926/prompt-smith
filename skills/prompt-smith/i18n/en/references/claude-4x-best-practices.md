# Claude 4.x Best Practices

A prompt optimization guide tailored to Claude 4.x models (Sonnet 4, Opus 4.5).

> **Applicable models**: claude-sonnet-4-5-20250929, claude-opus-4-5-20251101

---

## Core Principles

```
┌─────────────────────────────────────────────────────────────┐
│              Claude 4.x Prompt Principles                    │
├─────────────────────────────────────────────────────────────┤
│  1. EXPLICIT    Ask explicitly, not implicitly               │
│  2. MOTIVATED   Provide reasons and motivation               │
│  3. EXEMPLIFIED Examples match expected output               │
│  4. TRACKED     Long tasks require state tracking            │
│  5. PARALLELIZED Parallelize independent work                │
│  6. FORMATTED   Structure with XML tags or JSON schema       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Explicit Instructions (EXPLICIT)

### Claude 4.x trait
Claude 4.x follows instructions **literally**. Implicit expectations don't work well.

### Pattern

| Intent | ❌ Implicit | ✅ Explicit |
|------|----------|----------|
| Code | "Implement this feature" | "Implement this feature and write tests in tests/" |
| Analysis | "Analyze it" | "Analyze it and output results as JSON" |
| Suggest | "Improve it" | "Suggest 3 improvements" (or "edit it directly") |
| Review | "Check it" | "Review the code and list problems" |

### Example

```markdown
# ❌ Implicit (incomplete results)
Create an API endpoint

# ✅ Explicit (complete results)
Create an API endpoint:
1. Implement GET /users in src/routes/users.ts
2. Define User type in src/types/user.ts
3. Write tests in src/__tests__/users.test.ts
4. Run npm test and confirm it passes
```

---

## 2. Provide Motivation (MOTIVATED)

### Claude 4.x trait
Claude 4.x makes better judgments when it understands "why".

### Pattern

```markdown
## Context
[Background + why it is needed]

## Goal
[Desired outcome]

## Constraints
[Constraints + reasons]
```

### Example

```markdown
# ❌ No motivation
Optimize this function

# ✅ With motivation
## Context
This function runs every second in a realtime dashboard.
It currently averages 200ms, causing UI stutter.

## Goal
Reduce response time to under 50ms.

## Constraints
- Memory usage must stay at current levels (already near limit)
- No external cache system (infrastructure constraint)
```

---

## 3. Example Alignment (EXEMPLIFIED)

### Claude 4.x trait
Claude 4.x follows example formats very precisely.

### Principle
**Example format = desired output format**

### Pattern

```markdown
## Examples

### Example 1
**Input**: [example input]
**Output**:
[output in exact desired format]

### Example 2
**Input**: [another input]
**Output**:
[output in the same format]
```

### Example

```markdown
# ❌ Example/output mismatch
Example: "Apple" → technology company
(natural language)

Expected output: JSON
(format mismatch)

# ✅ Example = expected output
## Examples

**Input**: "Apple announced new iPhone today"
**Output**:
```json
{
  "entities": [
    {"name": "Apple", "type": "company"},
    {"name": "iPhone", "type": "product"}
  ],
  "topic": "technology",
  "date_mentioned": true
}
```

**Input**: "The weather is nice"
**Output**:
```json
{
  "entities": [],
  "topic": "general",
  "date_mentioned": false
}
```
```

---

## 4. State Management (TRACKED)

### Claude 4.x trait
Claude 4.x can systematically manage state for long-running tasks.

### When to apply
- 3+ step multi-step tasks
- Tasks that might be interrupted
- 10+ files/items processed

### Pattern

```markdown
## State Tracking

### State Schema
```json
{
  "task_id": "string",
  "status": "pending | in_progress | completed | failed",
  "progress": {
    "total": "number",
    "completed": "number",
    "current": "string"
  },
  "checkpoint": "ISO timestamp",
  "errors": ["string"]
}
```

### Checkpoint Rules
- [checkpoint timing]
- [storage location]

### Resume Protocol
1. [how to resume]
2. [how to validate]
```

### Example

```markdown
## State Tracking

This task migrates 100 files.

### State File: migration-state.json
```json
{
  "task_id": "jest-to-vitest",
  "status": "in_progress",
  "progress": {
    "total": 100,
    "completed": 45,
    "current": "src/utils/date.test.ts"
  },
  "checkpoint": "2024-01-15T10:30:00Z",
  "errors": [
    "src/legacy/old.test.ts: Cannot convert dynamic import"
  ]
}
```

### Checkpoint Rules
- Save state after every 10 files
- Save immediately on error
- Commit at each checkpoint

### Resume Protocol
1. Read state.json
2. Continue after progress.completed
3. Confirm previous checkpoint commit
```

---

## 5. Parallel vs Sequential Execution (PARALLELIZED)

### Claude 4.x trait
Claude 4.x can execute independent tool calls in parallel.

### Decision criteria

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel execution conditions                               │
│  ─────────────                                              │
│  • No data dependency between tasks                          │
│  • Results do not affect each other                          │
│  • Order does not affect outcome                             │
├─────────────────────────────────────────────────────────────┤
│  Sequential execution conditions                             │
│  ─────────────                                              │
│  • Later steps require earlier results                       │
│  • File creation before writing content                      │
│  • Work depends on search results                            │
└─────────────────────────────────────────────────────────────┘
```

### Pattern

```markdown
## Tool Usage Strategy

### Parallel (independent)
[Run tasks A, B, C concurrently]

### Sequential (dependent)
[Task D] → [Task E (uses D result)] → [Task F (uses E result)]
```

### Example

```markdown
## Tool Usage Strategy

### Step 1: Information gathering (parallel)
Run concurrently:
- Glob: `**/*.ts` file list
- Glob: `**/*.tsx` file list
- Read: package.json
→ All three are independent

### Step 2: Analysis (sequential)
After Step 1:
- Select target files from Step 1 list
- Read each file and analyze
→ Depends on Step 1

### Step 3: Editing (sequential)
For each file:
- Read → analyze → Edit
→ Sequential to avoid conflicts

### Step 4: Verification (sequential)
After all edits:
- Bash: `npm run build`
- Bash: `npm test`
→ Run tests after build
```

---

## 6. Structured Output (FORMATTED)

### Claude 4.x trait
Claude 4.x follows XML tags and JSON schemas accurately.

### Format selection

| Use case | Recommended format | Reason |
|------|----------|------|
| Data exchange | JSON | Easy to parse |
| Long text separation | XML tags | Clear structure |
| Mixed output | JSON + Markdown | Flexibility |

### XML tag pattern

```markdown
## Output Format

Use the following XML structure:

<response>
  <analysis>
    [analysis]
  </analysis>
  <recommendation>
    [recommendations]
  </recommendation>
  <code>
    [code, if any]
  </code>
</response>
```

### JSON schema pattern

```markdown
## Output Format

```json
{
  "analysis": {
    "summary": "string (max 100 chars)",
    "issues": [
      {
        "severity": "critical | major | minor",
        "location": "string",
        "description": "string"
      }
    ],
    "metrics": {
      "complexity": "number (1-10)",
      "maintainability": "number (1-10)"
    }
  },
  "recommendations": ["string"],
  "estimated_effort": "string"
}
```

Required: analysis.summary, analysis.issues
Optional: analysis.metrics, recommendations, estimated_effort
```

---

## 7. Using Extended Thinking

### Claude 4.x trait
For complex tasks, Claude 4.x can think more deeply. Explicitly asking for reasoning yields better results.

### When to apply
- Need to choose among multiple approaches
- Need trade-off analysis
- Need to evaluate tool results

### Pattern

```markdown
## Decision Process

Analyze each option and explain:
1. Pros/cons of Option A
2. Pros/cons of Option B
3. Reason for selection

Evaluation criteria (in priority order):
- [Criterion 1]
- [Criterion 2]
```

### Example

```markdown
## Decision Process

We need to choose a database migration strategy.

### Options to Evaluate
1. Big Bang: migrate all at once
2. Gradual: phased migration (dual write)
3. Blue-Green: run new DB in parallel then switch

### Evaluation Criteria (priority order)
1. Minimize downtime (business continuity)
2. Data consistency (integrity)
3. Ease of rollback (risk management)
4. Implementation complexity (resources)

Evaluate each option and recommend the best choice.
```

---

## 8. API Parameter Optimization (API_PARAMETERS)

### Claude 4.x trait
Proper API parameter settings impact quality and consistency.

### Recommended parameters

| Parameter | Recommended | Purpose |
|----------|--------|------|
| **temperature** | 0-0.3 | Accuracy-focused (code, extraction, classification) |
| **temperature** | 0.7-1.0 | Creativity-focused (brainstorming, writing) |
| **max_tokens** | expected length × 1.5 | Safety margin |
| **top_p** | 0.9 (default) | Usually default |
| **stop_sequences** | per task | Delimit responses in chaining |

### Scenario-based settings

```markdown
## Code generation
temperature: 0.1-0.3
max_tokens: 2048+
stop_sequences: ["```\n\n", "---"]

## Analysis/Summarization
temperature: 0.3-0.5
max_tokens: 1024

## Creative tasks
temperature: 0.8-1.0
max_tokens: task-specific
```

### Pattern

```markdown
# ❌ Anti-Pattern
Attempt to control output with prompts only
(use default temperature for everything)

# ✅ Correct
Combine API parameters + prompts
- Lower temperature for accuracy
- Use Structured Outputs (format guarantees)
- Use stop_sequences to bound responses
```

### Claude Code note
In Claude Code, **CLAUDE.md rules** provide more leverage than API parameters.
Focus on managing project rules rather than overfitting prompts.

---

## Anti-Patterns (What to avoid in Claude 4.x)

### 1. Implicit expectations

```markdown
# ❌ Anti-Pattern
Review this code
(assuming it will also write tests...)

# ✅ Correct
Review the code and write test cases for any issues found
```

### 2. Vague completion criteria

```markdown
# ❌ Anti-Pattern
Fix it until it works well

# ✅ Correct
Fix it until all of the following pass:
- npm test
- npm run lint
- TypeScript typecheck
```

### 3. No tool usage specified

```markdown
# ❌ Anti-Pattern
Find errors and fix them

# ✅ Correct
## Tool Usage
1. Use Grep to search for "TODO", "FIXME"
2. Use Read to check context
3. Edit the file
4. Run tests with Bash
```

### 4. Long tasks without state tracking

```markdown
# ❌ Anti-Pattern
Migrate all 100 files

# ✅ Correct
Migrate 100 files:
- Record progress in migration-state.json
- Checkpoint: git commit every 10 files
- On failure: record error and continue
- Resume based on the state file
```

---

## Quick Checklist

```
┌─────────────────────────────────────────────────────────────┐
│           Claude 4.x Prompt Checklist                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ Did you ask for desired behavior explicitly?              │
│  □ Did you explain why the task is needed?                   │
│  □ Do examples match the expected output format?             │
│  □ Did you define state tracking for long tasks?             │
│  □ Did you define tool usage strategy (parallel/sequential)? │
│  □ Did you structure the output (JSON/XML)?                  │
│  □ Are completion criteria verifiable?                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related References

- [quality-checklist.md](quality-checklist.md) - 7-Point Quality Check
- [anti-patterns.md](anti-patterns.md) - Patterns to avoid
- [../templates/prompt-template.md](../templates/prompt-template.md) - Prompt template
- [state-tracking-guide.md](state-tracking-guide.md) - State tracking details
- [tool-usage-guide.md](tool-usage-guide.md) - Tool usage details
