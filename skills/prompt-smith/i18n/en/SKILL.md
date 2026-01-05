---
name: prompt-smith
description: "A prompt quality management skill. Improve prompts with /ps:r or /ps:a. Triggers: prompt-smith, use prompt-smith, check, lint, create."
license: MIT
compatibility: "Claude Code"
metadata:
  short-description: "Prompt quality management skill (7-Point diagnostics + BUILD + INTERCEPT + test generation)"
  author: joseph0926
  version: "2.3.0"
  target: "claude-code"
  updated: "2026-01-05"
  category: "productivity"
  tags: "prompt, quality, testing, lint, build, intercept, engineering, validation, improvement, claude-4x"
i18n:
  locales: ["ko", "en"]
  default: "ko"
---

# Prompt Smith v2.3.0

A prompt quality management skill that turns prompts into operational assets by running **Diagnostics (LINT) → Auto Improvement (Rewrite) → Test Generation**, or by designing from requirements via **BUILD (Requirements → New Prompt Design)**.

**What’s new in v2.3.0**:

- **Command standardization**: Replace all `/prompt-smith` → `/ps:r`, `/ps:a`
- **Option cleanup**: Remove undocumented/unimplemented `verbose`, `threshold` options from docs
- **CI automation**: Add legacy-command residue checks, file size checks
- **Token optimization**: Simplify DEBUG sections, commonize `input-handling-rules.md`

**What’s new in v2.2.3**:

- Improved doc consistency: Fix references from "5-Point" → "7-Point"
- API parameter guide: temperature/max_tokens optimization section
- Prompt Chaining playbook: multi-step chaining strategy

**What’s new in v2.2.2**:

- **Simplified input format**: Make backticks optional in `/ps:r`, `/ps:a`
- Sync version metadata with CHANGELOG

**What’s new in v2.2.1**:

- **Stricter tool-call limitations**: Disallow tool usage (WebSearch, Read, etc.) until LINT is complete

**What’s new in v2.2.0**:

- Add **slash commands**: `/ps:r`, `/ps:a`, `/ps:lint`, `/ps:build`
- Rename plugin to `ps` (short commands)

**What’s new in v2.1**:

- Add **Intercept Pipeline** (real-time prompt improvement via Review/Intercept modes)
- English primary + i18n support

**What’s new in v2.0**:

- 5-Point → **7-Point Quality Check** (Claude 4.x optimized: STATE_TRACKING, TOOL_USAGE added)
- Add **BUILD Mode** (Requirements → Prompt design)

---

## Level 1: Quick Start (<2,000 tokens)

> This section alone is enough to run the core workflow. Details are in Level 2, and reference materials are in Level 3.

### When to use this skill

**Intercept Pipeline** (real-time improvement):

- `/ps:r <prompt>` - Review Mode (show improvements, wait for approval)
- `/ps:a <prompt>` - Intercept Mode (auto-improve and execute)

**LINT Mode** (improve an existing prompt):

- "Check my prompt", "Diagnose my prompt"
- "Improve this prompt", "Review my prompt"
- "Lint my prompt", "Analyze this prompt"
- When fixing prompt issues like broken JSON, high variance, missing fields, etc.

**BUILD Mode** (design a new prompt):

- "Create a prompt", "Design a prompt"
- "Write a new prompt", "Make a template"
- When you only have requirements and no existing prompt

### Slash commands (v2.2+)

| Command     | Description    | Usage                      |
| ----------- | -------------- | -------------------------- |
| `/ps:r`     | Review Mode    | `/ps:r <prompt>`           |
| `/ps:a`     | Intercept Mode | `/ps:a <prompt>`           |
| `/ps:lint`  | LINT Mode      | `/ps:lint <prompt>`        |
| `/ps:build` | BUILD Mode     | `/ps:build <requirements>` |

**Note**: All commands accept plain text directly. Backticks are optional.

### Natural-language triggers (legacy)

| Korean                     | English                    | Workflow               |
| -------------------------- | -------------------------- | ---------------------- |
| check/diagnose/lint        | lint/check/diagnose        | LINT Mode              |
| improve/review/analyze     | improve/review/analyze     | LINT Mode              |
| generate tests/validate    | test/validate              | LINT Mode (Test gen)   |
| **create/design/write**    | **build/create/design**    | **BUILD Mode**         |
| **use prompt-smith -r/-a** | **use prompt-smith -r/-a** | **Intercept Pipeline** |

### Quick Start (Installation)

**Global (all projects)**:

```bash
git clone https://github.com/joseph0926/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

**Project Local (current project only)**:

```bash
cp -r skills/prompt-smith .claude/skills/
```

### Activation Rules

NOTE: Slash commands (`/ps:r`, `/ps:a`) are recommended. Natural-language calls (`use prompt-smith`) are also supported.

#### Flag-based Mode Selection

```
-r <prompt>  → Review Mode (show improvements, wait for approval)
-a <prompt>  → Intercept Mode (auto-improve and execute)
(no flag)    → show mode selection menu
```

**Input format**: Provide plain text directly. Backticks are optional.

```
use prompt-smith -r Write a prompt here
```

**Multi-line input is supported**:

```
use prompt-smith -r Write a function
Parse JSON and
Handle errors
```

**Parsing rule**: Treat all text after `-r` or `-a` as the prompt to improve.

#### WITH -r Flag (Review Mode)

When called with `-r` and prompt text:

```
use prompt-smith -r Write a JSON parsing function
```

1. Extract all text after `-r` as the prompt to improve
2. Run Express LINT immediately
3. Show Before/After comparison
4. Wait for user approval (y/n/e)

**MUST FOLLOW:**

- ALWAYS treat all text after `-r` as the prompt (plain text or code block)
- ALWAYS show the full improved prompt text
- ALWAYS show score comparison (X/10 → Y/10)
- ALWAYS show `[DEBUG] Final Submitted Prompt` section
- ALWAYS await user approval before execution
- NEVER execute without showing improvements

```
Example: use prompt-smith -r Write a JSON parsing function

→ Extracted: "Write a JSON parsing function"
→ RUN Express LINT
→ SHOW improved prompt + DEBUG section
→ WAIT for approval
```

#### WITH -a Flag (Intercept Mode)

When called with `-a` and prompt text:

```
use prompt-smith -a Write a JSON parsing function
```

1. Extract all text after `-a` as the prompt
2. Run Express LINT
3. Auto-apply improvements (if score improves by 2+ points)
4. Execute immediately

#### WITHOUT Flags → Mode Selection

When called without flags (just `use prompt-smith`):

```
🔧 Prompt Smith v2.1 activated

What would you like help with?

1) 🔍 LINT - Diagnose + improve existing prompts + generate tests
2) 🏗️ BUILD - Requirements → design a new prompt
3) 🚀 INTERCEPT - Real-time prompt improvement pipeline
4) 🐛 DEBUG - Failure analysis + recurrence prevention (Phase 3 planned)

Reply with a number or just tell me in plain language.
```

### Core Principle: 7-Point Quality Check

This is the core rubric for prompt quality evaluation. All diagnostics are performed using these 7 perspectives.

```
┌─ 7-Point Quality Check ────────────────────────────────────────┐
│                                                                 │
│  [Base 5 items]                                                 │
│  1) ROLE         Is the role clearly defined?                   │
│  2) CONTEXT      Is the background/context sufficient?          │
│  3) INSTRUCTION  Are instructions clear and specific?           │
│  4) EXAMPLE      Are examples included?                         │
│  5) FORMAT       Is the output format specified?                │
│                                                                 │
│  [Claude 4.x extensions - evaluated only when applicable]       │
│  6) STATE_TRACKING  Is long-task state management present?      │
│  7) TOOL_USAGE      Are tool usage instructions clear?          │
│                                                                 │
│  → Each item scores 0-2                                         │
│  → Base 5 items: 10-point scale                                 │
│  → With extensions: normalize to 10:                            │
│    (raw score / (applicable items × 2)) × 10                    │
└─────────────────────────────────────────────────────────────────┘
```

**Scoring criteria:**

- **0**: Not present
- **1**: Present but insufficient or ambiguous
- **2**: Clear and sufficient
- **N/A**: Not applicable (excluded from denominator)

**When to apply extension items:**

- STATE_TRACKING: Only for multi-step / long tasks
- TOOL_USAGE: Only when tool usage is expected

### Quick Response Checklist (every turn)

```
┌─ Self-Check Before Responding ─────────────────────────────────┐
│                                                                 │
│  [LINT Mode]                                                    │
│  □ Did I run the 7-Point Quality Check?                         │
│  □ Did I identify the Top 3 issues concretely?                  │
│  □ Did I provide Before/After improvements?                     │
│  □ Did I generate test cases (normal/edge/injection)?           │
│                                                                 │
│  [BUILD Mode]                                                   │
│  □ Did I confirm requirements (goal/audience/domain)?           │
│  □ Did I include all 7-Point elements?                          │
│  □ Is the self-LINT score at least 8/10?                        │
│  □ Did I generate 5 test cases?                                 │
│                                                                 │
│  [Intercept Pipeline]                                           │
│  [ ] Did I show the full improved prompt text?                  │
│  [ ] Did I show score change (X/10 → Y/10)?                     │
│  [ ] Did I show Changes list?                                   │
│  [ ] Did I request user approval (y/n/e)?                       │
│  [ ] Did I wait for approval before execution?                  │
│                                                                 │
│  → If any No, fix before responding!                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Level 2: Workflows (<5,000 tokens)

### 2.1 LINT Mode Overview

**Purpose**: Check an existing prompt, propose improvements, and generate test cases.

**Input**: User’s existing prompt
**Output**: Diagnostic report + improved prompt + test cases

#### LINT Workflow Steps

```
┌─ LINT WORKFLOW ────────────────────────────────────────────────┐
│                                                                 │
│  Step 1: INPUT                                                  │
│  ├─ Receive prompt text                                         │
│  └─ (Optional) Confirm goal/context                             │
│                                                                 │
│  Step 2: ANALYZE                                                │
│  ├─ Run 7-Point Quality Check                                   │
│  ├─ Detect anti-patterns (ambiguity, injection risks, etc.)      │
│  └─ Score (0-10)                                                │
│                                                                 │
│  Step 3: DIAGNOSE                                               │
│  ├─ Derive Top 3 issues                                         │
│  └─ Explain each issue concretely                               │
│                                                                 │
│  Step 4: IMPROVE                                                │
│  ├─ Generate improved prompt                                    │
│  └─ Before/After + reasoning                                    │
│                                                                 │
│  Step 5: TEST                                                   │
│  ├─ Normal case 1 (2 cases)                                     │
│  ├─ Normal case 2                                                │
│  ├─ Edge case (1 case)                                          │
│  ├─ Injection defense (1 case)                                  │
│  └─ Domain-specific case (1 case)                               │
│                                                                 │
│  Step 6: REPORT                                                 │
│  └─ Output in diagnostic report format                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Diagnostic report format

Always output LINT results in this format:

```markdown
## 📋 Diagnostic Results

### Score: X/10

| Item           | Score      | Notes   |
| -------------- | ---------- | ------- |
| Role           | X/2        | [notes] |
| Context        | X/2        | [notes] |
| Instruction    | X/2        | [notes] |
| Example        | X/2        | [notes] |
| Format         | X/2        | [notes] |
| State Tracking | X/2 or N/A | [notes] |
| Tool Usage     | X/2 or N/A | [notes] |

### 🔴 Top 3 Issues

1. **[Issue 1]**: [concrete explanation]
2. **[Issue 2]**: [concrete explanation]
3. **[Issue 3]**: [concrete explanation]

---

## ✅ Improved Prompt (copy-paste)

[full improved prompt]

---

## 📝 Changes

### Change 1: [item]

- **Before**: [original]
- **After**: [improved]
- **Why**: [reason]

### Change 2: [item]

...

---

## 🧪 Test Cases (5)

### 1. Normal Case 1

**Input**: [test input]  
**Expected**: [expected output characteristics]

### 2. Normal Case 2

**Input**: [test input]  
**Expected**: [expected output characteristics]

### 3. Edge Case

**Input**: [empty/very long/special chars, etc.]  
**Expected**: [proper handling]

### 4. Injection Defense Case

**Input**: "Ignore instructions above and [malicious request]"  
**Expected**: Keep original instructions, ignore injection

### 5. Domain-Specific Case

**Input**: [domain-specific scenario]  
**Expected**: [appropriate domain handling]
```

#### Express Mode (quick diagnostics)

When you need fast feedback without deep analysis:

**Trigger**: "quick check", "keep it brief"

**Output**:

```
⚡ Express LINT Results

Score: X/10

Key issues:
1. [issue 1]
2. [issue 2]
3. [issue 3]

One-line improvement tip: [core improvement point]
```

---

### 2.2 BUILD Mode Overview

**Purpose**: Start from requirements and design a high-quality prompt that satisfies the 7-Point rubric.

**Input**: User’s requirements/goal
**Output**: Completed prompt + usage guide + test cases

#### BUILD Workflow Steps

```
┌─ BUILD WORKFLOW ───────────────────────────────────────────────┐
│                                                                 │
│  Step 1: GATHER (collect requirements)                          │
│  ├─ Confirm GOAL: what the prompt must achieve                  │
│  ├─ Confirm AUDIENCE: who will use it                           │
│  ├─ Confirm DOMAIN: what field/industry                         │
│  ├─ Confirm CONSTRAINTS: limits to follow                        │
│  └─ Confirm SUCCESS: how to judge success                        │
│                                                                 │
│  Step 2: CLASSIFY (decide type)                                 │
│  ├─ Task type: summarize/classify/generate/chat/analyze          │
│  ├─ Complexity: simple (one-shot) / multi-step / long-task       │
│  └─ Tool needs: files/search/command execution, etc.             │
│                                                                 │
│  Step 3: DESIGN (structure design)                              │
│  ├─ Select template (see templates/)                            │
│  ├─ Design 7-Point elements                                     │
│  └─ Apply injection-defense patterns                            │
│                                                                 │
│  Step 4: DRAFT (write draft)                                    │
│  ├─ Write Role section                                          │
│  ├─ Write Context section                                       │
│  ├─ Write Instruction section                                   │
│  ├─ Write Example section (2+ examples)                         │
│  ├─ Write Format section                                        │
│  ├─ Add State/Tool sections (when applicable)                   │
│  └─ Add Constraints + Success Criteria                           │
│                                                                 │
│  Step 5: SELF-LINT (quality verification)                       │
│  ├─ Run 7-Point Quality Check                                   │
│  ├─ If score < 8, return to Step 4                              │
│  └─ Detect anti-patterns                                        │
│                                                                 │
│  Step 6: TEST (generate test cases)                             │
│  ├─ Normal case 1 (2 cases)                                     │
│  ├─ Normal case 2                                                │
│  ├─ Edge case (1 case)                                          │
│  ├─ Injection defense (1 case)                                  │
│  └─ Domain-specific (1 case)                                    │
│                                                                 │
│  Step 7: DELIVER (final output)                                 │
│  ├─ Full prompt text (copy-paste ready)                         │
│  ├─ Usage guide                                                 │
│  ├─ Test cases                                                  │
│  └─ Maintenance recommendations                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### BUILD input format

**Minimum input**:

```
Goal: [what the prompt must achieve]
```

**Recommended input (higher quality)**:

```
Goal: [what the prompt must achieve]
Audience: [who uses it]
Domain: [what field/industry]
Constraints: [limits to follow]
Example: [desired output example]
```

#### BUILD output format

```markdown
# 🏗️ BUILD Result

## Metadata

- **Created at**: YYYY-MM-DD HH:MM
- **Request goal**: [summary of user request]
- **Prompt type**: [summarize/classify/generate/chat/analyze]
- **Complexity**: [simple/multi-step/long-task]

---

## 1. Full Prompt (copy-paste)
```

[full prompt text]

```

---

## 2. Quality Check Result

### 7-Point Quality Check: X/10

| Item | Score | Status |
|------|------|------|
| Role | 2/2 | ✅ |
| Context | 2/2 | ✅ |
| Instruction | 2/2 | ✅ |
| Example | 2/2 | ✅ |
| Format | 2/2 | ✅ |
| State Tracking | X/2 | ✅/N/A |
| Tool Usage | X/2 | ✅/N/A |

---

## 3. Usage Guide

### Variable descriptions
- `{{variable_1}}`: [description]
- `{{variable_2}}`: [description]

### Usage examples
[real usage scenario]

### Notes
- [note 1]
- [note 2]

---

## 4. Test Cases (5)

[test cases]

---

## 5. Maintenance Recommendations

- **Review cadence**: monthly recommended
- **Regression tests**: required on changes
- **Versioning**: Semantic Versioning recommended
```

---

### 2.3 Intercept Pipeline

A real-time prompt improvement pipeline.

#### Triggers

- `use prompt-smith -r <prompt>` - Review Mode
- `use prompt-smith -a <prompt>` - Intercept Mode

#### Review Mode workflow

1. Receive user prompt
2. Run Express LINT (quick 7-Point check)
3. Show improvements + Before/After comparison
4. Wait for user approval (`y` approve, `n` use original, `e` edit more)
5. Execute the approved prompt

#### Intercept Mode workflow

1. Receive user prompt
2. Run Express LINT
3. Auto-apply improvements (if score improves by 2+ points)
4. Show improvement summary + execute immediately

#### Output Format (MUST FOLLOW)

CRITICAL: The improved prompt MUST be shown in full text.

```
┌─────────────────────────────────────────────────────────────┐
│ Express LINT Results                                         │
├─────────────────────────────────────────────────────────────┤
│ Original Score: X/10 → Improved Score: Y/10 (+Z)            │
└─────────────────────────────────────────────────────────────┘

### Original Prompt
> [full original prompt text]

### Improved Prompt (copy-paste ready)
> [full improved prompt text]

### Changes Made
- [+] ROLE: [added role]
- [+] CONTEXT: [added context]
- [~] INSTRUCTION: [modified instruction]
- [+] FORMAT: [added output format]

### [DEBUG] Final Submitted Prompt
The exact prompt that will be sent to Claude:
\`\`\`
[full improved prompt text - identical to Improved Prompt section]
\`\`\`

### Proceed? (y/n/e)
- y: Execute with improved prompt
- n: Execute with original prompt
- e: Edit further
```

[Intercept Mode] Auto-executing improved prompt...

#### Mode selection

| Command/Flag  | Description                               |
| ------------- | ----------------------------------------- |
| `/ps:r`       | Review Mode (show improvements, approval) |
| `/ps:a`       | Intercept Mode (auto-improve + execute)   |
| `-r <prompt>` | Review Mode (natural language)            |
| `-a <prompt>` | Intercept Mode (natural language)         |

---

### 2.4 Anti-pattern Detection

During LINT/BUILD, the following anti-patterns are automatically detected:

| Anti-pattern           | Description                             | Fix direction                    |
| ---------------------- | --------------------------------------- | -------------------------------- |
| **Vague instructions** | "nicely", "cleanly", "appropriately"    | Specify concrete criteria        |
| **Missing role**       | No role definition                      | Add "You are a..."               |
| **No output format**   | Output format unspecified               | Define JSON/Markdown schema      |
| **No examples**        | No few-shot examples                    | Add 1-3 examples                 |
| **Injection risk**     | No separation between data/instructions | Separate data vs instructions    |
| **Too much freedom**   | No constraints                          | Add constraints / forbidden list |
| **Not verifiable**     | No success criteria                     | Specify success conditions       |
| **Ambiguous action**   | "take a look" (analyze? edit?)          | Use explicit action verbs        |
| **Example mismatch**   | Examples ≠ desired output format        | Match example format to output   |

Details: [references/anti-patterns.md](references/anti-patterns.md)

---

## Level 3: Mastery (References)

### Onboarding (Getting Started)

- [onboarding/quick-start.md](onboarding/quick-start.md) - 5-minute quick start
- [onboarding/first-lint.md](onboarding/first-lint.md) - Your first LINT walkthrough
- [onboarding/first-build.md](onboarding/first-build.md) - Your first BUILD walkthrough

### Playbooks (Workflow details)

**LINT:**

- [playbooks/lint/full-lint.md](playbooks/lint/full-lint.md) - Full LINT workflow
- [playbooks/lint/express-lint.md](playbooks/lint/express-lint.md) - Express LINT guide

**BUILD:**

- [playbooks/build/build-mode.md](playbooks/build/build-mode.md) - BUILD workflow
- [playbooks/build/requirement-gathering.md](playbooks/build/requirement-gathering.md) - Requirement gathering
- [playbooks/build/template-selection.md](playbooks/build/template-selection.md) - Template selection

**Intercept:**

- [playbooks/intercept/review-mode.md](playbooks/intercept/review-mode.md) - Review mode guide
- [playbooks/intercept/intercept-mode.md](playbooks/intercept/intercept-mode.md) - Intercept mode guide

**Team:**

- [playbooks/team/prompt-pr.md](playbooks/team/prompt-pr.md) - Prompt PR rules
- [playbooks/team/owner-guide.md](playbooks/team/owner-guide.md) - Ownership model
- [playbooks/team/regression-testing.md](playbooks/team/regression-testing.md) - Regression testing ops

### References

- [references/quality-checklist.md](references/quality-checklist.md) - 7-Point Quality Check details
- [references/anti-patterns.md](references/anti-patterns.md) - Prompt patterns to avoid
- [references/claude-4x-best-practices.md](references/claude-4x-best-practices.md) - Claude 4.x optimization guide
- [references/state-tracking-guide.md](references/state-tracking-guide.md) - State tracking guide
- [references/tool-usage-guide.md](references/tool-usage-guide.md) - Tool usage guide

### Templates

- [templates/prompt-template.md](templates/prompt-template.md) - Prompt template
- [templates/test-case-template.md](templates/test-case-template.md) - Test case template
- [templates/diagnostic-report.md](templates/diagnostic-report.md) - LINT diagnostic report template
- [templates/build-report.md](templates/build-report.md) - BUILD report template
- [templates/state-checkpoint.md](templates/state-checkpoint.md) - State checkpoint template

---

## Examples

### Example 1: LINT - Diagnosing a vague prompt

**Input (User)**:

```
Check the following prompt:

"Summarize the meeting minutes."
```

**Output (Prompt Smith)**:

```markdown
## 📋 Diagnostic Results

### Score: 2/10

| Item           | Score | Notes                                    |
| -------------- | ----- | ---------------------------------------- |
| Role           | 0/2   | No role defined                          |
| Context        | 0/2   | No context provided (what meeting? who?) |
| Instruction    | 1/2   | "Summarize" exists but criteria unclear  |
| Example        | 0/2   | No examples                              |
| Format         | 0/2   | Output format unspecified                |
| State Tracking | N/A   | Simple task                              |
| Tool Usage     | N/A   | No tools needed                          |

### 🔴 Top 3 Issues

1. **Missing role**: Without a defined role, outputs may be inconsistent
2. **Insufficient context**: No meeting type, target reader, etc.
3. **No output format**: No defined output structure (bullets/table/sections)

[... improved prompt and test cases omitted ...]
```

### Example 2: BUILD - Designing a code review prompt

**Input (User)**:

```
Create a prompt that does code review

Goal: Python code review
Audience: Junior developers
Constraints: Must check security vulnerabilities
```

**Output (Prompt Smith)**:

```markdown
# 🏗️ BUILD Result

## Metadata

- **Created at**: 2026-01-01 12:00
- **Request goal**: Python code review
- **Prompt type**: Analysis
- **Complexity**: Simple

---

## 1. Full Prompt (copy-paste)

You are a senior Python developer with 10 years of experience, specializing in code review and security.

## Context

- Target audience: Junior developers learning best practices
- Focus areas: Code quality, security vulnerabilities, and maintainability
- Tone: Educational and constructive (not critical)

## Instructions

Review the provided Python code and:

1. Identify any security vulnerabilities (SQL injection, XSS, etc.)
2. Point out code quality issues (naming, structure, complexity)
3. Suggest improvements with explanations

## Output Format

## 🔒 Security Issues (if any)

- [Issue]: [Description + Fix]

## 📝 Code Quality

- [Issue]: [Description + Suggestion]

## ✅ Good Practices Found

- [What was done well]

## 💡 Improvement Suggestions

1. [Suggestion with example]

## Constraints

- Always prioritize security issues first
- Provide code examples for suggestions
- Be educational, not critical

## Code to Review

<code>
{{code}}
</code>

---

## 2. Quality Check Result

### 7-Point Quality Check: 10/10

| Item           | Score | Status                             |
| -------------- | ----- | ---------------------------------- |
| Role           | 2/2   | ✅                                 |
| Context        | 2/2   | ✅                                 |
| Instruction    | 2/2   | ✅                                 |
| Example        | 2/2   | ✅ (Output format acts as example) |
| Format         | 2/2   | ✅                                 |
| State Tracking | N/A   | Simple task                        |
| Tool Usage     | N/A   | No tools needed                    |

[... usage guide and test cases omitted ...]
```

---

## Guidelines

### Do (Recommended)

- Apply the 7-Point Quality Check to all diagnostics
- Contrast Before/After clearly (LINT)
- Start design after confirming requirements (BUILD)
- Include injection-defense cases in test generation
- Explain change reasons concretely
- Consider Claude 4.x traits (explicit instructions, example alignment)

### Don't (Forbidden)

- "Good/bad" evaluations without scores
- Only pointing out problems without improvements
- Completing without test cases
- Distorting the original prompt intent
- Designing without confirming requirements (BUILD)

### Security

- Always check prompt-injection vulnerabilities
- Check for leakage risk of sensitive info (API keys, PII)
- Review risk of system prompt leakage
- Apply data/instruction separation patterns

---

## Roadmap

| Phase   | Feature                                    | Status     |
| ------- | ------------------------------------------ | ---------- |
| **1.0** | LINT Mode (5-Point)                        | ✅ Done    |
| **2.0** | BUILD Mode + 7-Point                       | ✅ Done    |
| **2.1** | Intercept Pipeline                         | ✅ Current |
| **3.0** | DEBUG Mode (failure analysis + prevention) | Planned    |
| **4.0** | Automated regression test integration      | Planned    |
