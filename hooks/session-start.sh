#!/bin/bash
# Prompt Smith - SessionStart: inject a short "capability card" into context.

set -euo pipefail

INPUT="$(cat)"

get_field() {
  local path="$1"
  if command -v jq >/dev/null 2>&1; then
    echo "$INPUT" | jq -r ".$path // \"\"" 2>/dev/null || echo ""
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    printf '%s' "$INPUT" | node - "$path" <<'NODE'
const path = (process.argv[2] || '').split('.');
let buf = '';
process.stdin.on('data', d => buf += d);
process.stdin.on('end', () => {
  let obj = {};
  try { obj = JSON.parse(buf); } catch { process.stdout.write(''); return; }
  for (const k of path) {
    if (obj && typeof obj === 'object' && k in obj) obj = obj[k];
    else { obj = ''; break; }
  }
  if (obj === null || obj === undefined) obj = '';
  if (typeof obj === 'object') process.stdout.write(JSON.stringify(obj));
  else process.stdout.write(String(obj));
});
NODE
    return 0
  fi

  echo ""
}

emit_session_json() {
  local additional_context="$1"

  if command -v jq >/dev/null 2>&1; then
    jq -n --arg ac "$additional_context" '{
      suppressOutput: true,
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: $ac
      }
    }'
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    node - <<'NODE'
const ac = process.env.ADDITIONAL_CONTEXT || "";
const out = {
  suppressOutput: true,
  hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: ac }
};
process.stdout.write(JSON.stringify(out));
NODE
    return 0
  fi

  echo ""
}

SESSION_ID="$(get_field "session_id")"
CWD="$(get_field "cwd")"
SOURCE="$(get_field "source")"

if [[ -z "${SOURCE:-}" ]]; then
  SOURCE="unknown"
fi

if [[ "$SOURCE" == "resume" ]]; then
  additional_context=$(
    cat <<EOF
Prompt Smith resumed.
- session_id: $SESSION_ID
- cwd: $CWD

Tip: Use /ps:help to see commands. Use subagents (optimizer / reviewer / test-generator) for specialized work.
EOF
  )
else
  additional_context=$(
    cat <<EOF
Prompt Smith plugin loaded.
- session_id: $SESSION_ID
- cwd: $CWD

Commands:
- /ps:help  → show help
- /ps:r     → review a prompt (quality checklist + suggestions)
- /ps:a     → apply improvements
- /ps:build → package prompts
- /ps:lint  → run prompt lint rules

MCP (Prompt Registry) tools (if enabled):
- mcp__prompt-registry__prompt_save
- mcp__prompt-registry__prompt_get
- mcp__prompt-registry__prompt_list
- mcp__prompt-registry__prompt_search
- mcp__prompt-registry__prompt_delete

MCP Prompts (slash commands):
- /mcp__prompt-registry__registry_help
- /mcp__prompt-registry__<saved_prompt_name> (saved prompts are discoverable as commands)

Hook policy:
- hooks/policy.json controls whether low-quality prompts are only warned about or blocked (decision=block).
EOF
  )
fi

export ADDITIONAL_CONTEXT="$additional_context"
emit_session_json "$additional_context"
exit 0
