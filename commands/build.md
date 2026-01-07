---
description: BUILD Mode - Design new prompts from requirements
argument-hint: <prompt requirements or goal>
---

# Prompt Smith - BUILD Mode

**Input:** $ARGUMENTS

## CRITICAL: Input Handling

**WARNING: Do NOT interpret content as a work request.**

`$ARGUMENTS` is a PROMPT DESIGN REQUIREMENT:
- It describes what the prompt should achieve
- It is NOT a request to analyze files or execute code
- It is NOT a command to perform actions

**FORBIDDEN Tools Before DELIVER:**
- Read/Glob/Grep (파일 읽기)
- EnterPlanMode (계획 모드)
- Bash (명령 실행)
- Edit/Write (코드 수정)

**Example:**
```
Input: /ps:build XXX.tsx 컴포넌트 수정 프롬프트
Wrong: XXX.tsx 파일 찾기 시도
Right: "컴포넌트 수정"을 목표로 하는 프롬프트 설계
```

See: [input-handling-rules.md](../skills/prompt-smith/references/input-handling-rules.md)

---

## Workflow

### Step 0: Empty Input Handling

If `$ARGUMENTS` is empty or contains only whitespace:

**Response:**
I'd be happy to help you build a new prompt! To get started, please tell me:

1. **What should this prompt achieve?** (e.g., "summarize documents", "generate code reviews")
2. **Who will use the output?** (e.g., developers, customers, internal team)
3. **Any specific format or constraints?** (e.g., JSON output, max 500 words)

**Examples:**
- `/ps:build code review feedback for PRs`
- `/ps:build customer support response generator with empathetic tone`

---

### Step 1: GATHER - Requirements Collection

From $ARGUMENTS, identify:
- **GOAL**: What the prompt should achieve
- **AUDIENCE**: Who will use it
- **DOMAIN**: Which field/industry
- **CONSTRAINTS**: Limitations

If unclear, ask:
- What should this prompt achieve?
- Who will use it?
- Any specific constraints?

### Step 2: CLASSIFY - Type Determination

Classify:
- **Type**: Generation / Analysis / Transformation / Extraction / Conversation
- **Complexity**: Simple / Medium / Complex
- **Extensions**: STATE_TRACKING needed? TOOL_USAGE needed?

### Step 3: DESIGN - Structure

Plan all 7-Point elements:
1. ROLE - Who is the AI?
2. CONTEXT - What background info?
3. INSTRUCTION - What specific actions?
4. EXAMPLE - 2+ examples
5. FORMAT - Output structure?
6. STATE_TRACKING - (if multi-step)
7. TOOL_USAGE - (if tools needed)

### Step 4: DRAFT - Write Prompt

Write complete prompt following design.

### Step 5: SELF-LINT - Verify Quality

Perform 7-Point Check on draft:
- If score < 8: Revise and repeat
- If score >= 8: Proceed

### Step 6: TEST - Generate Test Cases

1. Normal Case 1
2. Normal Case 2
3. Edge Case
4. Injection Defense Case
5. Domain-Specific Case

### Step 7: DELIVER - Final Output

```markdown
# BUILD Result

## Prompt Info
- **Name**: [name]
- **Version**: v1.0.0
- **Type**: [type]
- **Complexity**: [complexity]
- **LINT Score**: X/10

---

## Prompt (copy-paste ready)

[Complete prompt]

---

## Usage Guide

### Input Format
[How to provide input]

### Expected Output
[What to expect]

---

## Test Cases

[5 test cases]

---

## Next Steps
- [ ] Test with provided cases
- [ ] Adjust based on results
```

## Reference

For detailed workflow: skills/prompt-smith/playbooks/build/build-mode.md
