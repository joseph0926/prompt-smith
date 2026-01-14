#!/bin/bash
# Prompt Smith - UserPromptSubmit quality gate
# Notes:
# - For UserPromptSubmit hooks, stdout (exit code 0) is injected into Claude's context.
# - Prefer structured JSON output with hookSpecificOutput.additionalContext to avoid transcript noise.

set -euo pipefail

INPUT="$(cat)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLICY_FILE="${PROMPT_SMITH_HOOK_POLICY:-$SCRIPT_DIR/policy.json}"
POLICY_JSON=""
if [[ -f "$POLICY_FILE" ]]; then
  POLICY_JSON="$(cat "$POLICY_FILE")"
fi

# Extract a string field from the hook JSON input.
# Tries jq first; falls back to node (plugin already depends on node for MCP).
get_field() {
  local path="$1" # e.g. "prompt" or "tool_input.file_path"
  if command -v jq >/dev/null 2>&1; then
    # jq path: convert dotted path into jq expression
    local jq_expr=".$(echo "$path" | sed 's/\./\./g')"
    echo "$INPUT" | jq -r "${jq_expr} // \"\"" 2>/dev/null || echo ""
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

# Emit hook JSON without requiring jq.
emit_hook_json() {
  local additional_context="$1"
  local system_message="$2"
  local decision="$3"   # "block" or "" (allow)
  local reason="$4"     # shown to user when decision=block

  if command -v jq >/dev/null 2>&1; then
    jq -n \
      --arg ac "$additional_context" \
      --arg sm "$system_message" \
      --arg d "$decision" \
      --arg r "$reason" \
      '(
        {
          suppressOutput: true,
          hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            additionalContext: $ac
          }
        }
        + (if $sm == "" then {} else { systemMessage: $sm } end)
        + (if $d == "" then {} else { decision: $d, reason: $r } end)
      )'
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    node - <<'NODE'
const ac = process.env.ADDITIONAL_CONTEXT || "";
const sm = process.env.SYSTEM_MESSAGE || "";
const decision = process.env.DECISION || "";
const reason = process.env.REASON || "";
const out = {
  suppressOutput: true,
  hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: ac }
};
if (sm) out.systemMessage = sm;
if (decision) {
  out.decision = decision;
  out.reason = reason || "";
}
process.stdout.write(JSON.stringify(out));
NODE
    return 0
  fi

  # If neither jq nor node exists, fail open: no output, don't block.
  echo ""
}

PROMPT="$(get_field "prompt")"

# Skip slash commands: /ps:..., /help, etc.
if [[ "$PROMPT" =~ ^/ ]]; then
  exit 0
fi

# Skip very short prompts (avoid nagging on quick questions)
WORD_COUNT="$(echo "$PROMPT" | wc -w | tr -d ' ')"

# -------- policy --------
get_policy() {
  local path="$1"   # e.g. "userPromptSubmit.mode"
  local default="$2"

  if [[ -z "${POLICY_JSON:-}" ]]; then
    echo "$default"
    return 0
  fi

  if command -v jq >/dev/null 2>&1; then
    local jq_expr
    jq_expr=".$(echo "$path" | sed 's/\./\./g')"
    local v
    v="$(printf '%s' "$POLICY_JSON" | jq -r "${jq_expr} // empty" 2>/dev/null || true)"
    if [[ -z "$v" || "$v" == "null" ]]; then
      echo "$default"
    else
      echo "$v"
    fi
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    POLICY_JSON="$POLICY_JSON" node - "$path" "$default" <<'NODE'
const pathStr = process.argv[2] || '';
const def = process.argv[3] || '';
let obj = {};
try { obj = JSON.parse(process.env.POLICY_JSON || '{}'); } catch { process.stdout.write(def); process.exit(0); }
let cur = obj;
for (const k of pathStr.split('.')) {
  if (cur && typeof cur === 'object' && k in cur) cur = cur[k];
  else { cur = undefined; break; }
}
if (cur === undefined || cur === null || cur === '') process.stdout.write(def);
else if (typeof cur === 'object') process.stdout.write(JSON.stringify(cur));
else process.stdout.write(String(cur));
NODE
    return 0
  fi

  echo "$default"
}

MODE="$(get_policy "userPromptSubmit.mode" "warn")"
MIN_WORD_COUNT="$(get_policy "userPromptSubmit.minWordCount" "5")"
MIN_QUALITY_PERCENT="$(get_policy "userPromptSubmit.minQualityPercent" "60")"
BLOCK_REASON_BASE="$(get_policy "userPromptSubmit.blockReason" "Prompt is missing key structure (ROLE/GOAL/CONTEXT/FORMAT/CONSTRAINTS). Please expand it and try again.")"

# Normalize mode
if [[ "$MODE" != "block" && "$MODE" != "warn" ]]; then
  MODE="warn"
fi

if [[ "${WORD_COUNT:-0}" -lt "${MIN_WORD_COUNT:-5}" ]]; then
  exit 0
fi

score=0
missing=()

# Heuristics (lightweight, language-agnostic-ish)
if echo "$PROMPT" | grep -qiE "(you are|act as|role:|당신은|역할)"; then
  score=$((score + 2))
else
  missing+=("ROLE")
fi

if echo "$PROMPT" | grep -qiE "(goal|objective|task:|목표|요구사항|해야 할 일)"; then
  score=$((score + 2))
else
  missing+=("GOAL")
fi

if echo "$PROMPT" | grep -qiE "(context|background|given|scenario|전제|배경|상황)"; then
  score=$((score + 2))
else
  missing+=("CONTEXT")
fi

if echo "$PROMPT" | grep -qiE "(format|output|return|respond with|json|yaml|markdown|형식|출력)"; then
  score=$((score + 2))
else
  missing+=("FORMAT")
fi

if echo "$PROMPT" | grep -qiE "(constraint|must|should not|don't|금지|반드시|하지 마)"; then
  score=$((score + 2))
else
  missing+=("CONSTRAINTS")
fi

quality_percent=$((score * 10))

# Only inject context when clearly low-quality.
if [[ "$quality_percent" -lt "${MIN_QUALITY_PERCENT:-60}" ]]; then
  missing_list="$(IFS=, ; echo "${missing[*]}")"

  additional_context=$(
    cat <<EOF
[Prompt Smith Lint]
- Quality: ${quality_percent}/100
- Missing: ${missing_list}

Suggested minimal scaffold:
1) ROLE: "You are a ..."
2) GOAL: "Your task is to ..."
3) CONTEXT: "Given/Assume ..."
4) CONSTRAINTS: "Must / Must not ..."
5) FORMAT: "Return as ..."

Tip: If the user asks for review/rewrites, recommend running /ps:r (review) or /ps:lint.
EOF
  )

  system_message="Prompt Smith: prompt structure seems incomplete (${quality_percent}/100). Consider adding ROLE/GOAL/CONTEXT/FORMAT, or run /ps:r."

  decision=""
  reason=""
  if [[ "${MODE:-warn}" == "block" ]]; then
    decision="block"
    reason="${BLOCK_REASON_BASE} (quality ${quality_percent}/100; missing: ${missing_list})"
    system_message="Prompt Smith blocked this prompt (quality ${quality_percent}/100)."
  fi

  export ADDITIONAL_CONTEXT="$additional_context"
  export SYSTEM_MESSAGE="$system_message"
  export DECISION="$decision"
  export REASON="$reason"

  emit_hook_json "$additional_context" "$system_message" "$decision" "$reason"
fi

exit 0
