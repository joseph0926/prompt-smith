# State Checkpoint Template

A template for saving state in long-running or multi-step tasks.

> Supports the STATE_TRACKING item of the 7-Point Quality Check

---

## Base Checkpoint Template

```json
{
  "task_id": "[unique identifier]",
  "status": "pending",
  "progress": {
    "total": 0,
    "completed": 0,
    "current": ""
  },
  "checkpoint": "",
  "errors": [],
  "metadata": {
    "started_at": "",
    "updated_at": "",
    "version": "1.0.0"
  }
}
```

---

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `task_id` | string | Unique task identifier |
| `status` | enum | `pending` \| `in_progress` \| `completed` \| `failed` \| `paused` |
| `progress.total` | number | Total number of items to process |
| `progress.completed` | number | Number of completed items |
| `progress.current` | string | Current item being processed |
| `checkpoint` | ISO 8601 | Last checkpoint timestamp |
| `errors` | array | Array of error records |
| `metadata.started_at` | ISO 8601 | Task start time |
| `metadata.updated_at` | ISO 8601 | Last update time |
| `metadata.version` | string | Prompt/script version |

---

## Usage Examples

### File Migration Task

```json
{
  "task_id": "migration-jest-to-vitest-001",
  "status": "in_progress",
  "progress": {
    "total": 100,
    "completed": 45,
    "current": "src/utils/date.test.ts"
  },
  "checkpoint": "2024-01-15T10:30:00Z",
  "errors": [
    {
      "item": "src/legacy/old.test.ts",
      "error": "Cannot convert dynamic import",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ],
  "metadata": {
    "started_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### Batch Data Processing Task

```json
{
  "task_id": "data-processing-batch-042",
  "status": "paused",
  "progress": {
    "total": 1500,
    "completed": 750,
    "current": "record-751"
  },
  "checkpoint": "2024-01-15T14:00:00Z",
  "errors": [],
  "metadata": {
    "started_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T14:00:00Z",
    "version": "2.1.0"
  }
}
```

---

## Prompt Integration Template

Use when adding State Tracking to prompts:

```markdown
## State Tracking

### State File
**Filename**: `state.json`

```json
{
  "task_id": "{{task_id}}",
  "status": "pending | in_progress | completed | failed",
  "progress": {
    "total": {{total}},
    "completed": 0,
    "current": ""
  },
  "checkpoint": "",
  "errors": []
}
```

### Checkpoint Rules
- Save state after processing every {{interval}} items
- Save immediately on error
- Save at each step completion

### Resume Protocol
1. Read `state.json`
2. Check `status`:
   - `completed` → Exit
   - `failed` → Review errors, decide on retry
   - `in_progress` / `paused` → Continue
3. Process from item after `progress.completed`
4. Set `status = "completed"` on completion
```

---

## Progress Display Formats

### Console Output Format

```
[Task: migration-jest-to-vitest-001]
Progress: 45/100 (45%)
Current: src/utils/date.test.ts
Errors: 1
ETA: 15 minutes

Last checkpoint: 2024-01-15 10:30:00
```

### Progress Bar Format

```
[██████████░░░░░░░░░░] 45/100

✅ Completed: 44
🔄 In Progress: 1
❌ Errors: 1
⏸️ Remaining: 54
```

---

## Error Record Format

```json
{
  "item": "src/legacy/old.test.ts",
  "error": "Cannot convert dynamic import",
  "timestamp": "2024-01-15T10:25:00Z",
  "retry_count": 2,
  "stack": "[optional stack trace]"
}
```

---

## Checkpoint Strategies

| Strategy | Condition | Example |
|----------|-----------|---------|
| Time-based | At regular intervals | Every 5 minutes |
| Item-based | After N items | Every 10 items |
| Event-based | On specific events | Step completion, API call |
| Git-based | After file modifications | Every 10 files modified |

---

## Related References

- [state-tracking-guide.md](../references/state-tracking-guide.md) - Detailed guide
- [quality-checklist.md](../references/quality-checklist.md) - 7-Point Quality Check
- [prompt-template.md](prompt-template.md) - Prompt template
