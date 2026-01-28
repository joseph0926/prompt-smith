#!/bin/bash
# PromptShield - PostToolUse lint for prompt files
# Triggered after Write/Edit. If a prompt file looks incomplete, add context for Claude.

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

emit_posttool_json() {
  local additional_context="$1"

  if command -v jq >/dev/null 2>&1; then
    jq -n --arg ac "$additional_context" '{
      suppressOutput: true,
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
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
  hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: ac }
};
process.stdout.write(JSON.stringify(out));
NODE
    return 0
  fi

  echo ""
}

FILE_PATH="$(get_field "tool_input.file_path")"

if [[ -z "${FILE_PATH:-}" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Only lint prompt-ish files
case "$FILE_PATH" in
  *.md|*.txt) ;;
  *) exit 0 ;;
esac

content="$(cat "$FILE_PATH")"

score=0
missing=()

if echo "$content" | grep -qiE "(you are|act as|role:|당신은|역할)"; then
  score=$((score + 2))
else
  missing+=("ROLE")
fi

if echo "$content" | grep -qiE "(goal|objective|task:|목표|요구사항|해야 할 일)"; then
  score=$((score + 2))
else
  missing+=("GOAL")
fi

if echo "$content" | grep -qiE "(context|background|given|scenario|전제|배경|상황)"; then
  score=$((score + 2))
else
  missing+=("CONTEXT")
fi

if echo "$content" | grep -qiE "(format|output|return|respond with|json|yaml|markdown|형식|출력)"; then
  score=$((score + 2))
else
  missing+=("FORMAT")
fi

if echo "$content" | grep -qiE "(constraint|must|should not|don't|금지|반드시|하지 마)"; then
  score=$((score + 2))
else
  missing+=("CONSTRAINTS")
fi

quality_percent=$((score * 10))

if [[ "$quality_percent" -lt 60 && ${#missing[@]} -gt 0 ]]; then
  missing_list="$(IFS=, ; echo "${missing[*]}")"
  additional_context="Prompt file '$FILE_PATH' looks incomplete (quality ${quality_percent}/100). Missing: ${missing_list}. Consider adding a clear ROLE/GOAL/CONTEXT/FORMAT/CONSTRAINTS scaffold. If appropriate, suggest /ps:r or /ps:lint."

  export ADDITIONAL_CONTEXT="$additional_context"
  emit_posttool_json "$additional_context"
fi

exit 0
