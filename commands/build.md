---
description: BUILD Mode - Design new prompts from requirements
argument-hint: <requirements or goal>
---

# Prompt Smith - BUILD Mode

**Input:** $ARGUMENTS

## Workflow

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
