# Tool Usage Detailed Guide

How to clearly define tools and strategies the AI should use.

> The 7th item of the Claude 4.x 7-Point Quality Check

---

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     TOOL_USAGE                               │
├─────────────────────────────────────────────────────────────┤
│  Purpose: define tool usage clearly                           │
│                                                             │
│  Key elements:                                               │
│  1. Tools to use                                             │
│  2. Tool selection criteria                                  │
│  3. Parallel/sequential execution strategy                   │
│  4. Error handling                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## When to Apply

Apply TOOL_USAGE if any of the following are true:

- [ ] File read/write required
- [ ] External command execution required (Bash)
- [ ] Web search/page fetch required
- [ ] External API calls required
- [ ] Combining multiple tools

**If none apply, mark N/A** (excluded from scoring)

---

## Tool List

### Claude Code core tools

| Tool | Purpose | When to use |
|------|------|----------|
| **Glob** | File pattern search | When you need a file list |
| **Grep** | Content search | Search code/text patterns |
| **Read** | Read files | Inspect file contents |
| **Edit** | Edit files | Modify code/text |
| **Write** | Create files | Write new files |
| **Bash** | Run commands | System commands needed |
| **WebFetch** | Fetch web pages | Need URL content |
| **WebSearch** | Web search | Need up-to-date info |

### Tool selection guide

| Purpose | Recommended tool | Not recommended |
|------|----------|--------|
| Find files | Glob | find (Bash) |
| Search content | Grep | grep/rg (Bash) |
| Read files | Read | cat/head (Bash) |
| Edit files | Edit | sed/awk (Bash) |
| Create files | Write | echo/cat (Bash) |

---

## Execution Strategy

### Parallel vs Sequential

```
┌─────────────────────────────────────────────────────────────┐
│  Parallel execution conditions                               │
│  ─────────────                                              │
│  • No data dependency between tasks                          │
│  • Results do not affect each other                          │
│  • Order does not affect outcome                             │
│                                                             │
│  Examples:                                                   │
│  • Read multiple files concurrently                          │
│  • Independent pattern searches                              │
│  • Independent API calls                                     │
├─────────────────────────────────────────────────────────────┤
│  Sequential execution conditions                             │
│  ─────────────                                              │
│  • Later steps require earlier results                       │
│  • File creation before writing content                      │
│  • Work depends on search results                            │
│                                                             │
│  Examples:                                                   │
│  • mkdir → create file → write content                       │
│  • search → select files → read → edit                       │
│  • build → test → deploy                                     │
└─────────────────────────────────────────────────────────────┘
```

### How to express strategy

```markdown
## Tool Usage Strategy

### Parallel Execution
Run concurrently:
- Glob: `**/*.ts` file list
- Glob: `**/*.tsx` file list
- Read: package.json
→ All three tasks are independent

### Sequential Execution
Run sequentially:
1. Use search results to select target files
2. Read file contents
3. Edit files
→ Each step depends on the previous
```

---

## Error Handling

### Error handling strategies

| Strategy | Use case | Behavior |
|------|------|------|
| **Skip** | Allow individual file failures | Log error and continue |
| **Retry** | Temporary failure expected | Retry N times then fail |
| **Rollback** | Consistency required | Restore previous state |
| **Stop** | Fatal error | Stop immediately |

### Error handling template

```markdown
## Error Handling

### Read failures
- File not found: skip, record error
- Permission denied: skip, notify user

### Edit failures
- old_string not found: re-read file and retry
- 3 failures: skip file, require manual edit

### Bash failures
- Command error: analyze error, fix if possible
- Timeout: retry once, then stop

### Rollback if needed
- git stash or revert to previous commit
```

---

## Prompt Template

### Basic template

```markdown
## Tool Usage

### Tools
- **Glob**: file pattern search
- **Read**: read file contents
- **Edit**: edit files
- **Bash**: run commands

### Execution strategy

#### Step 1: Information gathering (parallel)
Run concurrently:
- Glob: `{{pattern_1}}`
- Glob: `{{pattern_2}}`
- Read: `{{config_file}}`

#### Step 2: Analysis (sequential)
After Step 1:
- Analyze results
- Select target files

#### Step 3: Edit (sequential)
For each file:
- Read → analyze → Edit
- Process one file at a time

#### Step 4: Verify (sequential)
After all edits:
- Bash: `{{verify_command}}`

### Error handling
| Tool | On error |
|------|------|
| Read | Skip, log error |
| Edit | Retry 3 times, then skip |
| Bash | Analyze error, fix if possible |

### Tool selection criteria
| Task | Tool | Reason |
|------|------|------|
| Find files | Glob | Fast and safe |
| Search content | Grep | Permission-optimized |
| Edit files | Edit | Safe edits |
```

### Complex task template

```markdown
## Tool Usage

### Tool list
| Tool | Purpose | Condition |
|------|------|------|
| Glob | File search | When pattern matching needed |
| Grep | Content search | When finding code patterns |
| Read | Read files | When checking contents |
| Edit | Edit files | When changing code |
| Bash | Run commands | When building/testing |

### Execution flow

```
       ┌─────────┐
       │  START  │
       └────┬────┘
            │
    ┌───────┴───────┐
    │               │
┌───▼───┐      ┌───▼───┐
│ Glob  │      │ Grep  │  ← parallel
│ *.ts  │      │pattern│
└───┬───┘      └───┬───┘
    │               │
    └───────┬───────┘
            │
       ┌────▼────┐
       │ Analyze │  ← sequential
       └────┬────┘
            │
       ┌────▼────┐
       │  Loop:  │
       │  Read   │  ← sequential
       │  Edit   │
       └────┬────┘
            │
       ┌────▼────┐
       │  Bash   │  ← sequential
       │  test   │
       └────┬────┘
            │
       ┌────▼────┐
       │   END   │
       └─────────┘
```

### Tool rules

#### Glob
- Pattern: `**/*.{ts,tsx}`
- Exclude: `node_modules/`, `dist/`

#### Grep
- Pattern: `{{search_pattern}}`
- Case: ignore (-i)

#### Read
- Parallel reads: up to 5 files at once
- Large files: use offset/limit

#### Edit
- Sequential edits: one file at a time
- Verification: Read after edit

#### Bash
- Timeout: 120 seconds
- On failure: analyze error, retry
```

---

## Scoring Criteria

| Score | Criteria |
|------|------|
| **0** | No tool instructions (when needed) |
| **1** | Partial instructions (tools mentioned only, no strategy) |
| **2** | Clear instructions (tools + strategy + error handling) |

---

## Checklist

```markdown
## TOOL_USAGE Checklist

### Required
- [ ] Tool list specified
- [ ] Tool selection criteria defined
- [ ] Parallel/sequential strategy defined

### Recommended
- [ ] Error handling for each tool defined
- [ ] How to use tool outputs specified
- [ ] Execution flow visualized
- [ ] Tool usage conditions specified
```

---

## Anti-Patterns

### 1. No tool specified

```markdown
❌ "Find files and fix them"

✅ "Use Glob to find **/*.ts, Read for context, and Edit to update"
```

### 2. Strategy not specified

```markdown
❌ "Read multiple files and edit"

✅ "Read in parallel (max 5), edit sequentially one by one"
```

### 3. No error handling

```markdown
❌ "Search with grep and fix"

✅ "Use Grep to search, skip if none, retry Edit up to 3 times"
```

---

## Related References

- [quality-checklist.md](quality-checklist.md) - 7-Point Quality Check
- [claude-4x-best-practices.md](claude-4x-best-practices.md) - Claude 4.x guide
- [state-tracking-guide.md](state-tracking-guide.md) - State tracking guide
