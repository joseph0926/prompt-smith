#!/bin/bash
# Prompt Smith - SessionStart Hook
# Provides quality tips at session startup

set -e

INPUT=$(cat)

SOURCE=$(echo "$INPUT" | jq -r '.source // "startup"' 2>/dev/null)

if [ "$SOURCE" != "startup" ]; then
  exit 0
fi

cat << 'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "[Prompt Smith] Available: /ps:r (review), /ps:a (auto-improve), /ps:lint (diagnose), /ps:build (design)"
  }
}
EOF

exit 0
