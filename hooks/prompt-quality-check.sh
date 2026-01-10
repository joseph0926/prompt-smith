#!/bin/bash
# Prompt Smith - Express Quality Check Hook
# Triggered on UserPromptSubmit to provide quick quality feedback
#
# This hook performs a lightweight quality assessment and returns
# a score indicator for prompts that may benefit from improvement.

set -e

# Read input from stdin (JSON format from Claude Code)
INPUT=$(cat)

# Extract the prompt content from the input
PROMPT=$(echo "$INPUT" | jq -r '.prompt // .content // .message // empty' 2>/dev/null)

# Skip if no prompt content or if it's a slash command
if [ -z "$PROMPT" ] || [[ "$PROMPT" == /* ]]; then
  exit 0
fi

# Skip short prompts (less than 20 characters)
if [ ${#PROMPT} -lt 20 ]; then
  exit 0
fi

# Quick quality indicators check
SCORE=0
MAX_SCORE=8

# Check 1: Has clear action verb (implement, create, fix, analyze, etc.)
if echo "$PROMPT" | grep -qiE '\b(implement|create|build|add|fix|update|refactor|analyze|review|test|debug|optimize|write|generate|design)\b'; then
  SCORE=$((SCORE + 2))
fi

# Check 2: Has context markers (file paths, code blocks, references)
if echo "$PROMPT" | grep -qE '(\.[a-z]{2,4}|```|@|#|/[a-z])'; then
  SCORE=$((SCORE + 2))
fi

# Check 3: Has specificity indicators (numbers, names, specific terms)
if echo "$PROMPT" | grep -qE '([0-9]+|"[^"]+"|`[^`]+`)'; then
  SCORE=$((SCORE + 2))
fi

# Check 4: Reasonable length (not too short, not too long)
WORD_COUNT=$(echo "$PROMPT" | wc -w | tr -d ' ')
if [ "$WORD_COUNT" -ge 5 ] && [ "$WORD_COUNT" -le 200 ]; then
  SCORE=$((SCORE + 2))
fi

# Calculate percentage
PERCENTAGE=$((SCORE * 100 / MAX_SCORE))

# Only show feedback for low-quality prompts (below 50%)
if [ $PERCENTAGE -lt 50 ]; then
  echo "---"
  echo "[Prompt Smith] Quality: ${PERCENTAGE}% - Consider using /ps:r for review"
  echo "---"
fi

exit 0
