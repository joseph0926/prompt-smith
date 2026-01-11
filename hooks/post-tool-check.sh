#!/bin/bash
# Prompt Smith - PostToolUse Hook
# Triggered after Write/Edit to check prompt file quality

set -e

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

is_prompt_file() {
  local path="$1"
  case "$path" in
    *prompts*|*prompt*|*SKILL.md|*commands/*.md|*skills/*.md)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

if ! is_prompt_file "$FILE_PATH"; then
  exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

CONTENT=$(cat "$FILE_PATH" 2>/dev/null || echo "")
SCORE=0
MAX_SCORE=10

if echo "$CONTENT" | grep -qiE '(you are|act as|role:|persona:)'; then
  SCORE=$((SCORE + 2))
fi

if echo "$CONTENT" | grep -qiE '(context:|background:|given:)'; then
  SCORE=$((SCORE + 2))
fi

if echo "$CONTENT" | grep -qiE '(instruction:|task:|step[s]?:)'; then
  SCORE=$((SCORE + 2))
fi

if echo "$CONTENT" | grep -qiE '(example:|for instance:|e\.g\.)'; then
  SCORE=$((SCORE + 2))
fi

if echo "$CONTENT" | grep -qiE '(format:|output:|response:)'; then
  SCORE=$((SCORE + 2))
fi

if [ $SCORE -lt 6 ]; then
  cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "[Prompt Smith] Prompt file quality: ${SCORE}/10. Consider running /ps:lint for detailed analysis."
  }
}
EOF
fi

exit 0
