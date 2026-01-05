# State Tracking Detailed Guide

How to manage state for long-running or multi-step tasks.

> The 6th item of the Claude 4.x 7-Point Quality Check

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE_TRACKING                            │
├─────────────────────────────────────────────────────────────┤
│  Purpose: track and recover long-running tasks               │
│                                                             │
│  Key elements:                                               │
│  1. State storage format (JSON recommended)                  │
│  2. Checkpoint timing                                        │
│  3. Resume method                                            │
│  4. Progress display                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## When to Apply

Apply STATE_TRACKING if any of the following are true:

- [ ] 3+ step multi-step tasks
- [ ] 10+ items processed sequentially
- Long tasks with possible session interruption
- Tasks requiring checkpoints/rollback

**If none apply, mark N/A** (excluded from scoring)

---

## State File Schema

### Base schema

```json
{
  "task_id": "string - unique identifier",
  "status": "pending | in_progress | completed | failed | paused",
  "progress": {
    "total": "number - total items",
    "completed": "number - completed items",
    "current": "string - current item"
  },
  "checkpoint": "ISO 8601 timestamp - last checkpoint",
  "errors": [
    {
      "item": "string - failed item",
      "error": "string - error message",
      "timestamp": "ISO 8601"
    }
  ],
  "metadata": {
    "started_at": "ISO 8601",
    "updated_at": "ISO 8601",
    "version": "string - prompt/script version"
  }
}
```

### Example

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

---

## Checkpoint Strategy

### Time-based

```markdown
## Checkpoint Rules
- Save state every 5 minutes
- Save at task start/end
```

### Item-based

```markdown
## Checkpoint Rules
- Save after every 10 items
- Save immediately on error
```

### Event-based

```markdown
## Checkpoint Rules
- Save after each step
- Save before/after external API calls
- Save before/after file edits
```

### Git checkpoints

```markdown
## Checkpoint Rules
- Commit after every 10 files
- Commit message: "checkpoint: [task_id] - [progress]"
- Roll back to the commit if needed
```

---

## Resume Protocol

### Base protocol

```markdown
## Resume Protocol

1. Read the state file
   - Confirm file exists
   - Validate schema

2. Check status
   - If "in_progress" or "paused", continue
   - If "completed", exit
   - If "failed", decide whether to retry

3. Determine position
   - Check progress.completed
   - Identify next item

4. Continue execution
   - Start from item after completed
   - Update state after each item
```

### Example steps

```markdown
## Resume Steps

1. Read state.json
2. Check status:
   - "completed" → Exit successfully
   - "failed" → Review errors, decide retry
   - "in_progress" → Continue from progress.completed
3. Set current = items[progress.completed]
4. Process from current item
5. Update state after each item
6. On completion: status = "completed"
```

---

## Progress Display

### Console output

```markdown
## Progress Display

Processing: 45/100 (45%)
Current: src/utils/date.test.ts
Errors: 1
ETA: 15 minutes

Last checkpoint: 2024-01-15 10:30:00
```

### Status summary

```markdown
## Status Summary

[██████████░░░░░░░░░░] 45/100

✅ Completed: 44
🔄 In Progress: 1
❌ Errors: 1
⏸️ Remaining: 54
```

---

## Error Handling

### Continue on error

```markdown
## Error Handling: Continue

1. On error:
   - Add item to errors array
   - Do not increment progress.completed
   - Move to next item

2. After processing all items:
   - Review errors array
   - Reprocess if needed
```

### Stop on error

```markdown
## Error Handling: Stop

1. On error:
   - status = "failed"
   - Save state
   - Stop immediately

2. On restart:
   - Resolve root cause
   - Run Resume Protocol
```

### Retry logic

```markdown
## Error Handling: Retry

1. On error:
   - Retry up to 3 times
   - Backoff: 1s, 5s, 30s

2. After 3 failures:
   - Add to errors array
   - Move to next item (or stop)
```

---

## Prompt Template

```markdown
## State Tracking

### State file
File: {{state_file}}

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

### Checkpoint rules
- Save after every {{checkpoint_interval}} items
- Save immediately on error
- At each checkpoint, {{checkpoint_action}}

### Resume method
1. Read {{state_file}}
2. Check progress.completed
3. Continue after completed items
4. On completion, clean up the state file

### Error handling
- On error: {{error_action}}
- Retry count: {{retry_count}}
```

---

## Scoring Criteria

| Score | Criteria |
|------|------|
| **0** | No state management (when needed) |
| **1** | Partial state management (progress only, not structured) |
| **2** | Systematic state management (JSON state + checkpoints + resume) |

---

## Checklist

```markdown
## STATE_TRACKING Checklist

### Required
- [ ] State storage format defined (JSON recommended)
- [ ] Checkpoint timing specified
- [ ] Resume method defined

### Recommended
- [ ] Progress display method defined
- [ ] Error handling strategy defined
- [ ] Completion criteria clear
- [ ] Rollback method defined
```

---

## Related References

- [quality-checklist.md](quality-checklist.md) - 7-Point Quality Check
- [claude-4x-best-practices.md](claude-4x-best-practices.md) - Claude 4.x guide
- [tool-usage-guide.md](tool-usage-guide.md) - Tool usage guide
