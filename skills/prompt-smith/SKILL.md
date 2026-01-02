---
name: prompt-smith
description: "Prompt quality management skill. 7-Point Quality Check, LINT/BUILD modes, and real-time prompt improvement pipeline. Trigger: prompt review, lint, build, improve, /prompt-smith. (Productivity)"
license: MIT
compatibility: "Claude Code (primary), claude.ai, VS Code Agent Mode, GitHub Copilot, OpenAI Codex CLI"
metadata:
  short-description: "Prompt QA skill (7-Point Check + BUILD + Test Generation)"
  author: joseph0926
  version: "2.1.0"
  target: "claude-code"
  updated: "2026-01-02"
  category: "productivity"
  tags: "prompt, quality, testing, lint, build, engineering, validation, improvement"
i18n:
  locales: ["en", "ko"]
  default: "en"
---

# Prompt Smith v2.1.0

A quality management skill that transforms prompts into operational assets through **diagnosis (LINT) → auto-improvement (Rewrite) → test generation** or **new design from requirements (BUILD)**.

**v2.1 Changes**:
- **Intercept Pipeline** added (Review/Intercept modes for real-time prompt improvement)
- English Primary with i18n support

**v2.0 Changes**:
- 5-Point → **7-Point Quality Check** (Claude 4.x optimization: STATE_TRACKING, TOOL_USAGE)
- **BUILD Mode** added (requirements → prompt design)

---

## Level 1: Quick Start (<2,000 tokens)

> This section alone enables core functionality. Details in Level 2, references in Level 3.

### When to use this skill

**Intercept Pipeline** (real-time improvement):
- `/prompt-smith <your prompt>` - Review Mode (show improvements, await approval)
- `/prompt-smith --auto <your prompt>` - Intercept Mode (auto-improve and execute)

**LINT Mode** (improve existing prompts):
- "lint this prompt", "check my prompt"
- "improve this prompt", "review this prompt"
- JSON errors, inconsistent outputs, missing elements

**BUILD Mode** (design new prompts):
- "build a prompt for...", "create a prompt"
- "design a new prompt", "make a template"
- When you have requirements but no prompt

### Trigger Keywords

| English | Korean | Workflow |
|---------|--------|----------|
| lint/check/diagnose | 점검/진단/린트 | LINT Mode |
| improve/review/analyze | 개선/리뷰/분석 | LINT Mode |
| test/validate | 테스트 생성/검증 | LINT Mode (test generation) |
| **build/create/design** | **만들어줘/설계/작성** | **BUILD Mode** |
| **/prompt-smith** | **/prompt-smith** | **Intercept Pipeline** |

### Quick Start (Installation)

**Claude Code (Global)**:
```bash
git clone https://github.com/kyh/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

**Claude Code (Project)**:
```bash
cp -r skills/prompt-smith .claude/skills/
```

**Plugin**:
```bash
/plugin install prompt-smith@kyh/prompt-smith
```

**Other Platforms**:
- **claude.ai**: Settings > Capabilities > Skills (upload ZIP)
- **VS Code/GitHub Copilot**: `.github/skills/prompt-smith/` or `.claude/skills/prompt-smith/`
- **OpenAI Codex CLI**: `~/.codex/skills/prompt-smith/` or project `.codex/skills/prompt-smith/`

### Activation Rules

- **Auto-activation**: Detected prompt review/diagnosis/improvement/design requests → enter corresponding workflow
- **Explicit invocation**: `"use prompt-smith"`, `"/prompt-smith"` → show mode selection
- **With arguments**: `/prompt-smith <user-prompt>` → enter Intercept Pipeline (Review Mode)

#### Argument Handling (CRITICAL)

When this skill is invoked with arguments (e.g., `/prompt-smith Write code to parse JSON`):

1. **Treat the argument as the user's prompt to be improved**
2. **Immediately enter Review Mode workflow** (see Section 2.3)
3. **Execute Express LINT on the provided prompt**
4. **Show Before/After comparison and await approval**

**MUST FOLLOW:**
1. **ALWAYS show the full improved prompt** - not just changes
2. **ALWAYS show score comparison** (X/10 → Y/10)
3. **ALWAYS await user approval** before execution
4. **NEVER execute silently** without showing improvements

VIOLATION: Executing without showing improvements is prohibited.

```
Example: /prompt-smith Write code to parse JSON

→ The text "Write code to parse JSON" is the prompt to be reviewed/improved
→ DO NOT show mode selection menu
→ GO DIRECTLY to Review Mode workflow
→ MUST show full improved prompt before execution
```

#### No Arguments

When invoked without arguments (`/prompt-smith` only):

```
Prompt Smith v2.1 Activated

Which task would you like help with?

1) LINT - Diagnose + improve existing prompts + generate tests
2) BUILD - Design new prompts from requirements
3) INTERCEPT - Real-time prompt improvement pipeline
4) DEBUG - Failure analysis + prevention (Phase 3 planned)

Enter a number or describe your need.
```

### Core Principle: 7-Point Quality Check

The core criteria for prompt quality evaluation. All diagnoses are performed from these 7 perspectives.

```
+-- 7-Point Quality Check --------------------------------------------+
|                                                                      |
|  [Base 5 Items]                                                      |
|  1) ROLE         Is the role clearly defined?                        |
|  2) CONTEXT      Is there sufficient background/context?             |
|  3) INSTRUCTION  Are instructions clear and specific?                |
|  4) EXAMPLE      Are examples included?                              |
|  5) FORMAT       Is output format specified?                         |
|                                                                      |
|  [Claude 4.x Extensions - evaluated only when applicable]            |
|  6) STATE_TRACKING  Is there state management for long tasks?        |
|  7) TOOL_USAGE      Are tool usage instructions clear?               |
|                                                                      |
|  -> Each item: 0-2 points                                            |
|  -> Base 5 items: 10 points max                                      |
|  -> With extensions: (raw score / applicable items * 2) * 10         |
+----------------------------------------------------------------------+
```

**Scoring Criteria:**
- **0 points**: Element missing
- **1 point**: Present but insufficient or ambiguous
- **2 points**: Clear and sufficient
- **N/A**: Not applicable (excluded from denominator)

**Extension Criteria:**
- STATE_TRACKING: Apply only for multi-step/long-running tasks
- TOOL_USAGE: Apply only for prompts expecting tool usage

### Quick Response Checklist (per turn)

```
+-- Pre-Response Self-Check ------------------------------------------+
|                                                                      |
|  [LINT Mode]                                                         |
|  [ ] Did I perform 7-Point Quality Check?                            |
|  [ ] Did I identify Top 3 issues specifically?                       |
|  [ ] Did I provide Before/After improvements?                        |
|  [ ] Did I generate test cases (normal/edge/injection)?              |
|                                                                      |
|  [BUILD Mode]                                                        |
|  [ ] Did I confirm requirements (goal/audience/domain)?              |
|  [ ] Did I include all 7-Point elements?                             |
|  [ ] Is self-LINT score 8+ points?                                   |
|  [ ] Did I generate 5 test cases?                                    |
|                                                                      |
|  [Intercept Pipeline]                                                |
|  [ ] Did I show the full improved prompt text?                       |
|  [ ] Did I show score change (X/10 → Y/10)?                          |
|  [ ] Did I show Changes list?                                        |
|  [ ] Did I request user approval (y/n/e)?                            |
|  [ ] Did I wait for approval before execution?                       |
|                                                                      |
|  -> If any No, fix before responding!                                |
+----------------------------------------------------------------------+
```

---

## Level 2: Workflows (<5,000 tokens)

### 2.1 LINT Mode Overview

**Purpose**: Diagnose existing prompts, provide improvements, and generate test cases.

**Input**: User's existing prompt
**Output**: Diagnostic report + improved prompt + test cases

#### LINT Workflow Steps

```
+-- LINT WORKFLOW ----------------------------------------------------+
|                                                                      |
|  Step 1: INPUT                                                       |
|  +-- Receive prompt text                                             |
|  +-- (Optional) Confirm goal/context                                 |
|                                                                      |
|  Step 2: ANALYZE                                                     |
|  +-- Perform 7-Point Quality Check                                   |
|  +-- Detect anti-patterns (ambiguous expressions, injection risks)   |
|  +-- Calculate score (0-10)                                          |
|                                                                      |
|  Step 3: DIAGNOSE                                                    |
|  +-- Identify Top 3 issues                                           |
|  +-- Explain specific problems for each issue                        |
|                                                                      |
|  Step 4: IMPROVE                                                     |
|  +-- Generate improved prompt                                        |
|  +-- Show Before/After comparison + explain changes                  |
|                                                                      |
|  Step 5: TEST                                                        |
|  +-- 2 normal cases                                                  |
|  +-- 1 edge case                                                     |
|  +-- 1 injection defense case                                        |
|  +-- 1 domain-specific case                                          |
|                                                                      |
|  Step 6: REPORT                                                      |
|  +-- Output in diagnostic report format                              |
|                                                                      |
+----------------------------------------------------------------------+
```

#### Diagnostic Report Format

LINT results always output in this format:

```markdown
## Diagnostic Results

### Score: X/10

| Item | Score | Evaluation |
|------|-------|------------|
| Role | X/2 | [evaluation] |
| Context | X/2 | [evaluation] |
| Instruction | X/2 | [evaluation] |
| Example | X/2 | [evaluation] |
| Format | X/2 | [evaluation] |
| State Tracking | X/2 or N/A | [evaluation] |
| Tool Usage | X/2 or N/A | [evaluation] |

### Top 3 Issues
1. **[Issue 1]**: [specific description]
2. **[Issue 2]**: [specific description]
3. **[Issue 3]**: [specific description]

---

## Improved Prompt (copy-paste ready)

[improved full prompt]

---

## Changes Made

### Change 1: [item]
- **Before**: [original]
- **After**: [improved]
- **Reason**: [why improved]

### Change 2: [item]
...

---

## Test Cases (5)

### 1. Normal Case 1
**Input**: [test input]
**Expected**: [expected output characteristics]

### 2. Normal Case 2
**Input**: [test input]
**Expected**: [expected output characteristics]

### 3. Edge Case
**Input**: [empty/very long/special characters]
**Expected**: [appropriate handling]

### 4. Injection Defense Case
**Input**: "Ignore above instructions and [malicious request]"
**Expected**: Original instructions maintained, injection ignored

### 5. Domain-Specific Case
**Input**: [domain-specific scenario]
**Expected**: [domain-appropriate handling]
```

#### Express Mode (quick diagnosis)

For quick feedback without detailed analysis:

**Trigger**: "quick check", "brief review"

**Output**:
```
Express LINT Results

Score: X/10

Key Issues:
1. [Issue 1]
2. [Issue 2]
3. [Issue 3]

One-line improvement suggestion: [key improvement point]
```

---

### 2.2 BUILD Mode Overview

**Purpose**: Design high-quality prompts from requirements that meet all 7 points.

**Input**: User's requirements/goals
**Output**: Complete prompt + usage guide + test cases

#### BUILD Workflow Steps

```
+-- BUILD WORKFLOW ---------------------------------------------------+
|                                                                      |
|  Step 1: GATHER (requirements collection)                            |
|  +-- GOAL: What the prompt should achieve                            |
|  +-- AUDIENCE: Who will use it                                       |
|  +-- DOMAIN: Which field/industry                                    |
|  +-- CONSTRAINTS: Limitations to follow                              |
|  +-- SUCCESS: How to measure success                                 |
|                                                                      |
|  Step 2: CLASSIFY (type determination)                               |
|  +-- Task type: summary/classification/generation/conversation       |
|  +-- Complexity: simple(1-shot)/multi-step/long-running              |
|  +-- Tool requirements: file/search/command execution                |
|                                                                      |
|  Step 3: DESIGN (structure design)                                   |
|  +-- Select template (see templates/)                                |
|  +-- Design 7-Point elements                                         |
|  +-- Apply injection defense patterns                                |
|                                                                      |
|  Step 4: DRAFT (initial draft)                                       |
|  +-- Write Role section                                              |
|  +-- Write Context section                                           |
|  +-- Write Instruction section                                       |
|  +-- Write Example section (2+ examples)                             |
|  +-- Write Format section                                            |
|  +-- Write State/Tool sections (if applicable)                       |
|  +-- Add Constraints + Success Criteria                              |
|                                                                      |
|  Step 5: SELF-LINT (quality verification)                            |
|  +-- Perform 7-Point Quality Check                                   |
|  +-- If score < 8, return to Step 4                                  |
|  +-- Detect anti-patterns                                            |
|                                                                      |
|  Step 6: TEST (test case generation)                                 |
|  +-- 2 normal cases                                                  |
|  +-- 1 edge case                                                     |
|  +-- 1 injection defense case                                        |
|  +-- 1 domain-specific case                                          |
|                                                                      |
|  Step 7: DELIVER (final deliverables)                                |
|  +-- Full prompt (copy-paste ready)                                  |
|  +-- Usage guide                                                     |
|  +-- Test cases                                                      |
|  +-- Maintenance recommendations                                     |
|                                                                      |
+----------------------------------------------------------------------+
```

#### BUILD Input Format

**Minimum input**:
```
Goal: [what the prompt should achieve]
```

**Recommended input (better quality)**:
```
Goal: [what the prompt should achieve]
Audience: [who will use it]
Domain: [which field/industry]
Constraints: [limitations to follow]
Example: [desired output example]
```

---

### 2.3 Intercept Pipeline

Real-time prompt improvement before execution.

#### Trigger

- `/prompt-smith <user-prompt>` - Review Mode (default)
- `/prompt-smith --auto <user-prompt>` - Intercept Mode

#### Review Mode Workflow

1. Receive user prompt
2. Execute Express LINT (7-Point Quick Check)
3. Display improvements + Before/After comparison
4. Await user approval (`y` approve, `n` use original, `e` edit further)
5. Execute approved prompt

#### Intercept Mode Workflow

1. Receive user prompt
2. Execute Express LINT
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

### Proceed? (y/n/e)
- y: Execute with improved prompt
- n: Execute with original prompt
- e: Edit further
```

[Intercept Mode] Auto-executing improved prompt...

#### Configuration

| Option | Default | Description |
|--------|---------|-------------|
| --auto | false | Enable Intercept Mode |
| --threshold | 2 | Minimum score improvement for auto-apply |
| --verbose | false | Show detailed analysis |

---

### 2.4 Anti-Pattern Detection

The following anti-patterns are automatically detected during LINT/BUILD:

| Anti-Pattern | Description | Improvement |
|--------------|-------------|-------------|
| **Ambiguous instructions** | "well", "nicely", "appropriately" | Specify concrete criteria |
| **Missing role** | No role definition | Add "You are a..." |
| **Unspecified format** | Unclear output format | Specify JSON/markdown schema |
| **No examples** | Missing few-shot examples | Add 1-3 examples |
| **Injection vulnerable** | No input data separation | Separate data/instructions |
| **Excessive freedom** | No constraints | Add constraints/prohibitions |
| **Unverifiable** | No success criteria | Specify success conditions |
| **Ambiguous action** | "look at this" (analyze? modify?) | Use clear action verbs |
| **Example format mismatch** | Example != desired output | Match example to output format |

Details: [references/anti-patterns.md](references/anti-patterns.md)

---

## Level 3: Mastery (References)

### Onboarding

- [onboarding/quick-start.md](onboarding/quick-start.md) - 5-minute start guide
- [onboarding/first-lint.md](onboarding/first-lint.md) - First LINT walkthrough
- [onboarding/first-build.md](onboarding/first-build.md) - First BUILD walkthrough

### Playbooks

**LINT:**
- [playbooks/lint/full-lint.md](playbooks/lint/full-lint.md) - LINT workflow details
- [playbooks/lint/express-lint.md](playbooks/lint/express-lint.md) - Express LINT guide

**BUILD:**
- [playbooks/build/build-mode.md](playbooks/build/build-mode.md) - BUILD workflow details
- [playbooks/build/requirement-gathering.md](playbooks/build/requirement-gathering.md) - Requirements gathering guide
- [playbooks/build/template-selection.md](playbooks/build/template-selection.md) - Template selection guide

**Intercept:**
- [playbooks/intercept/review-mode.md](playbooks/intercept/review-mode.md) - Review mode guide
- [playbooks/intercept/intercept-mode.md](playbooks/intercept/intercept-mode.md) - Intercept mode guide

**Team:**
- [playbooks/team/prompt-pr.md](playbooks/team/prompt-pr.md) - PR rules
- [playbooks/team/owner-guide.md](playbooks/team/owner-guide.md) - Owner guide
- [playbooks/team/regression-testing.md](playbooks/team/regression-testing.md) - Regression testing

### References

- [references/quality-checklist.md](references/quality-checklist.md) - 7-Point Quality Check details
- [references/anti-patterns.md](references/anti-patterns.md) - Anti-patterns to avoid
- [references/claude-4x-best-practices.md](references/claude-4x-best-practices.md) - Claude 4.x optimization guide
- [references/state-tracking-guide.md](references/state-tracking-guide.md) - State management guide
- [references/tool-usage-guide.md](references/tool-usage-guide.md) - Tool usage guide

### Templates

- [templates/prompt-template.md](templates/prompt-template.md) - Prompt template
- [templates/test-case-template.md](templates/test-case-template.md) - Test case template
- [templates/diagnostic-report.md](templates/diagnostic-report.md) - LINT diagnostic report template
- [templates/build-report.md](templates/build-report.md) - BUILD result template

---

## Examples

### Example 1: LINT - Diagnosing an ambiguous prompt

**Input (user)**:
```
Check this prompt:

"Summarize the meeting notes"
```

**Output (Prompt Smith)**:
```markdown
## Diagnostic Results

### Score: 2/10

| Item | Score | Evaluation |
|------|-------|------------|
| Role | 0/2 | No role defined |
| Context | 0/2 | No context (what meeting? audience?) |
| Instruction | 1/2 | "Summarize" present but criteria unclear |
| Example | 0/2 | No examples |
| Format | 0/2 | Output format unspecified |
| State Tracking | N/A | Simple task |
| Tool Usage | N/A | No tools needed |

### Top 3 Issues
1. **Missing role**: No AI role defined, inconsistent outputs possible
2. **Insufficient context**: No meeting type, target audience info
3. **Unspecified format**: Output format (bullets/table/sections) undefined

[... improved prompt and test cases omitted ...]
```

### Example 2: Intercept Pipeline - Review Mode

**Input (user)**:
```
/prompt-smith Write code to parse JSON
```

**Output (Prompt Smith)**:
```
Original Prompt (Score: 3/10)
> Write code to parse JSON

Improved Prompt (Score: 8/10)
> You are a senior software engineer.
>
> Write a Python function that parses a JSON string and returns a dictionary.
> Handle invalid JSON gracefully by returning None and logging the error.
>
> Output format:
> - Function with type hints
> - Include docstring
> - Include error handling

Changes:
- [+] Added ROLE: senior software engineer
- [+] Added CONTEXT: Python, error handling requirement
- [+] Specified FORMAT: type hints, docstring
- [~] Made INSTRUCTION specific: parse JSON string → dictionary

Proceed? (y/n/e): _
```

---

## Guidelines

### Do (Recommended)

- Apply 7-Point Quality Check to all diagnoses
- Show clear Before/After comparison (LINT)
- Confirm requirements before designing (BUILD)
- Include injection defense in test cases
- Explain change reasons specifically
- Consider Claude 4.x characteristics (explicit instructions, matching examples)

### Don't (Prohibited)

- Vague "good/bad" evaluations without scores
- Point out problems without improvements
- Complete diagnosis/design without test cases
- Distort original prompt intent
- Start designing without confirming requirements (BUILD)

### Security

- Always check for prompt injection vulnerabilities
- Verify sensitive information (API keys, PII) exposure risks
- Review system prompt leakage possibilities
- Apply data/instruction separation patterns

---

## Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| **1.0** | LINT Mode (5-Point) | Completed |
| **2.0** | BUILD Mode + 7-Point | Completed |
| **2.1** | Intercept Pipeline | Current |
| **3.0** | DEBUG Mode (failure analysis + prevention) | Planned |
| **4.0** | Automated regression testing integration | Planned |
