# Prompt Chaining Guide

A strategy to improve quality and reliability by splitting complex tasks into multiple prompts.

> **Related reference**: Solution to the "Excessive complexity" pattern in anti-patterns.md

---

## When Chaining Is Needed

```
┌─────────────────────────────────────────────────────────────┐
│  Chaining Conditions                                         │
├─────────────────────────────────────────────────────────────┤
│  • Tasks with 3+ dependent steps                             │
│  • Single prompt output near token limits                    │
│  • Intermediate result validation needed                     │
│  • Complex transformations needing rollback/retry            │
│  • Large tasks where partial failure is acceptable           │
└─────────────────────────────────────────────────────────────┘
```

### When chaining is not needed

- Tasks that can be completed in a single step
- Simple transformations that do not need intermediate verification
- When overhead is larger than task complexity

---

## Chaining Patterns

### 1. Sequential Chain

Each step's output becomes the next step's input.

```
[Input] → [Step 1: Analysis] → [Step 2: Transform] → [Step 3: Validate] → [Output]
```

**Use cases**:
- Data transformation pipelines
- Document migration
- Step-by-step refactoring

**Example**:
```markdown
Step 1: Read files → Analyze structure
Step 2: Use analysis → Build transformation plan
Step 3: Apply plan → Modify code
Step 4: Validate changes → Run tests
```

### 2. Branching Chain

Branch to different paths based on conditions.

```
            ┌→ [Step 2A: Option A]
[Step 1] ──┤
            └→ [Step 2B: Option B]
                     ↓
               [Step 3: Choose/Merge]
```

**Use cases**:
- A/B test creation
- Comparing multiple approaches
- Conditional processing

### 3. Parallel Chain

Run independent tasks simultaneously and merge results.

```
         ┌→ [Task A] ─┐
[Input] ─┼→ [Task B] ─┼→ [Merge] → [Output]
         └→ [Task C] ─┘
```

**Use cases**:
- Analyze multiple files at once
- Independent verification tasks
- Large-scale data processing

**Implementation in Claude 4.x**:
```markdown
## Tool Usage Strategy
### Step 1: Parallel analysis
Run concurrently:
- Read: file_a.ts
- Read: file_b.ts
- Read: file_c.ts
→ All three tasks are independent

### Step 2: Merge
After all reads complete:
- Combine analysis results
- Produce a unified report
```

---

## State Management

### State file structure

```json
{
  "chain_id": "doc-migration-001",
  "current_step": 2,
  "total_steps": 5,
  "status": "in_progress",
  "steps": [
    {
      "name": "extract",
      "status": "completed",
      "output_ref": "step1.json",
      "completed_at": "2026-01-03T10:00:00Z"
    },
    {
      "name": "transform",
      "status": "in_progress",
      "output_ref": null,
      "started_at": "2026-01-03T10:05:00Z"
    },
    {
      "name": "validate",
      "status": "pending",
      "output_ref": null
    }
  ],
  "checkpoint": "2026-01-03T10:05:00Z",
  "errors": []
}
```

### Checkpoint rules

| Timing | Save contents | Reason |
|------|----------|------|
| After each step | Step result + state | Resume capability |
| On error | Error info + last success state | Debugging |
| After N items | Progress + intermediate results | Long tasks tracking |

---

## Error Handling Strategy

| Strategy | Description | Use case |
|------|------|------|
| **Retry** | Retry the same step | Temporary errors (network, timeout) |
| **Fallback** | Try an alternative approach | Failure on specific input |
| **Skip** | Skip the item | Large batches with partial failure allowed |
| **Rollback** | Revert to previous checkpoint | Severe error |
| **Abort** | Stop the whole chain | Fatal error |

### Error handling example

```markdown
## Error Handling
- Read failure → Skip (skip the file, record error)
- Transform failure → Retry (up to 2 times)
- Validate failure → Rollback (revert to pre-change state)
- 3 consecutive failures → Abort (notify user)
```

---

## Example: Document Migration Chain

### Overall flow

```
┌───────────────────────────────────────────────────────────────┐
│ Step 1: [Collect file list]                                    │
│   Input: directory path                                       │
│   Output: target file list (files.json)                       │
├───────────────────────────────────────────────────────────────┤
│ Step 2: [Analyze each file] ← parallel possible               │
│   Input: file path                                            │
│   Output: AST/structure analysis result                       │
├───────────────────────────────────────────────────────────────┤
│ Step 3: [Apply transformations] ← sequential                  │
│   Input: analysis results + transformation rules              │
│   Output: transformed code                                    │
├───────────────────────────────────────────────────────────────┤
│ Step 4: [Validate] ← parallel possible                         │
│   Input: transformed file                                     │
│   Output: test pass/fail                                      │
├───────────────────────────────────────────────────────────────┤
│ Step 5: [Commit] ← sequential                                 │
│   Input: validated files                                      │
│   Output: Git commit                                          │
└───────────────────────────────────────────────────────────────┘
```

### Detailed prompt structure

```markdown
## Chain: Jest → Vitest Migration

### Step 1 Prompt
Goal: Collect target file list

Glob patterns: **/*.test.ts, **/*.spec.ts
Exclude: node_modules/, dist/
Output: JSON array (file paths)

### Step 2 Prompt (per file)
Goal: Analyze file structure

Analyze:
- import statements
- describe/it block structure
- mock usage patterns
- timers/async patterns

Output: Structured analysis result (JSON)

### Step 3 Prompt
Goal: Convert Jest → Vitest

Input: Step 2 analysis result
Rules:
- jest.fn() → vi.fn()
- jest.mock() → vi.mock()
- beforeEach → beforeEach (keep)
- jest.useFakeTimers() → vi.useFakeTimers()

Output: Converted code

### Step 4 Prompt
Goal: Validate conversion

Validation items:
- TypeScript compilation passes
- Vitest runs successfully
- Test pass rate preserved

### Step 5
Bash: git add . && git commit -m "chore: migrate tests from Jest to Vitest"
```

---

## Performance Optimization

### Parallel vs Sequential decision

| Condition | Strategy | Example |
|------|------|------|
| No data dependency | Parallel | Read multiple files at once |
| Output dependency | Sequential | Analyze → transform → validate |
| Potential resource contention | Sequential | Modify the same file |
| Order doesn't matter | Parallel | Independent validations |

### Token efficiency

- **Minimize** each step's prompt
- Pass **only necessary** parts of prior results
- Separate context using state files

```markdown
# ❌ Inefficient
Include full previous conversation context

# ✅ Efficient
Store previous step output in a file
Read only what is needed for the current step
```

---

## Checklist

```
┌─ Prompt Chaining Design Checklist ───────────────────────────┐
│                                                             │
│  Design                                                      │
│  □ Total steps defined (3+?)                                 │
│  □ Input/output defined for each step                        │
│  □ Parallel/sequential strategy decided                      │
│  □ State file structure designed                             │
│                                                             │
│  Implementation                                              │
│  □ Prompt for each step written                              │
│  □ Error handling strategy defined                           │
│  □ Checkpoint timing set                                     │
│  □ Resume logic implemented                                  │
│                                                             │
│  Validation                                                  │
│  □ Normal case tests                                         │
│  □ Error case tests                                          │
│  □ Pause/resume tests                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Related References

- [claude-4x-best-practices.md](../references/claude-4x-best-practices.md) - PARALLELIZED pattern
- [state-tracking-guide.md](../references/state-tracking-guide.md) - State management details
- [tool-usage-guide.md](../references/tool-usage-guide.md) - Tool usage strategy
- [anti-patterns.md](../references/anti-patterns.md) - Prevent excessive complexity
