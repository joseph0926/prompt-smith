#!/bin/bash
# PromptShield - UserPromptSubmit quality gate
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
    local v val_type
    # Check value type first
    val_type="$(printf '%s' "$POLICY_JSON" | jq -r "${jq_expr} | type // \"null\"" 2>/dev/null || echo "null")"
    if [[ "$val_type" == "array" || "$val_type" == "object" ]]; then
      # Return as compact JSON for arrays/objects
      v="$(printf '%s' "$POLICY_JSON" | jq -c "${jq_expr} // empty" 2>/dev/null || true)"
    else
      # Return raw value for scalars
      v="$(printf '%s' "$POLICY_JSON" | jq -r "${jq_expr} // empty" 2>/dev/null || true)"
    fi
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

# -------- array utilities --------

# Convert JSON array to grep-compatible regex: ["a","b"] → (a|b)
# - Escapes regex metacharacters in each item
# - Returns "DISABLED" for empty array (explicit disable)
# - Returns default if null/invalid
array_to_regex() {
  local json_array="$1"
  local default="$2"

  # Null or missing → use default
  if [[ -z "$json_array" || "$json_array" == "null" ]]; then
    echo "$default"
    return 0
  fi

  # Empty array → explicit disable (return pattern that never matches)
  if [[ "$json_array" == "[]" ]]; then
    echo "DISABLED"
    return 0
  fi

  if command -v jq >/dev/null 2>&1; then
    local items
    # Escape regex metacharacters using bracket class for most, backslash for [ ]
    # Order matters: escape \ first, then [ ], then others with bracket class
    items="$(echo "$json_array" | jq -r '
      .[] |
      gsub("\\\\"; "\\\\") |
      gsub("\\["; "\\[") |
      gsub("\\]"; "\\]") |
      gsub("\\."; "[.]") |
      gsub("\\*"; "[*]") |
      gsub("\\+"; "[+]") |
      gsub("\\?"; "[?]") |
      gsub("\\^"; "\\^") |
      gsub("\\$"; "[$]") |
      gsub("\\{"; "[{]") |
      gsub("\\}"; "[}]") |
      gsub("\\("; "[(]") |
      gsub("\\)"; "[)]") |
      gsub("\\|"; "[|]")
    ' 2>/dev/null | tr '\n' '|' | sed 's/|$//')"
    if [[ -z "$items" ]]; then
      echo "$default"
    else
      echo "($items)"
    fi
    return 0
  fi

  if command -v node >/dev/null 2>&1; then
    local result
    result="$(node -e "
      try {
        const a = JSON.parse(process.argv[1]);
        if (!Array.isArray(a) || a.length === 0) {
          console.log(process.argv[2] || '');
        } else {
          // Escape regex metacharacters using bracket class (safer for shell)
          // Note: ^ must use backslash escape, not bracket class (ERE limitation)
          const escaped = a.map(s => {
            return s
              .replace(/\\\\/g, '\\\\\\\\')
              .replace(/\\[/g, '\\\\[')
              .replace(/\\]/g, '\\\\]')
              .replace(/\\./g, '[.]')
              .replace(/\\*/g, '[*]')
              .replace(/\\+/g, '[+]')
              .replace(/\\?/g, '[?]')
              .replace(/\\^/g, '\\\\^')
              .replace(/\\$/g, '[$]')
              .replace(/\\{/g, '[{]')
              .replace(/\\}/g, '[}]')
              .replace(/\\(/g, '[(]')
              .replace(/\\)/g, '[)]')
              .replace(/\\|/g, '[|]');
          });
          console.log('(' + escaped.join('|') + ')');
        }
      } catch { console.log(process.argv[2] || ''); }
    " "$json_array" "$default" 2>/dev/null)"
    echo "$result"
    return 0
  fi

  echo "$default"
}

# Strip code blocks from text to avoid false positives
# Removes: ```...``` (fenced) and `...` (inline)
strip_code_blocks() {
  local text="$1"
  # Remove fenced code blocks (```...```)
  text="$(printf '%s' "$text" | sed '/^```/,/^```/d')"
  # Remove inline code (`...`)
  text="$(printf '%s' "$text" | sed 's/`[^`]*`//g')"
  printf '%s' "$text"
}

# -------- main config --------
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

# -------- scoring weights --------
SCORE_ROLE="$(get_policy "userPromptSubmit.scoring.rolePresent" "2")"
SCORE_GOAL="$(get_policy "userPromptSubmit.scoring.goalPresent" "2")"
SCORE_CONTEXT="$(get_policy "userPromptSubmit.scoring.contextPresent" "2")"
SCORE_FORMAT="$(get_policy "userPromptSubmit.scoring.formatPresent" "2")"
SCORE_CONSTRAINT="$(get_policy "userPromptSubmit.scoring.constraintPresent" "2")"
SCORE_ANTI_VAGUE="$(get_policy "userPromptSubmit.scoring.antiPatternVague" "-2")"
SCORE_ANTI_AMBIGUOUS="$(get_policy "userPromptSubmit.scoring.antiPatternAmbiguous" "-1")"
SCORE_ANTI_OVERCONFIDENT="$(get_policy "userPromptSubmit.scoring.antiPatternOverConfident" "-1")"

# -------- custom keywords --------
CUSTOM_ROLE="$(get_policy "userPromptSubmit.customKeywords.role" "")"
CUSTOM_GOAL="$(get_policy "userPromptSubmit.customKeywords.goal" "")"
CUSTOM_CONTEXT="$(get_policy "userPromptSubmit.customKeywords.context" "")"
CUSTOM_FORMAT="$(get_policy "userPromptSubmit.customKeywords.format" "")"
CUSTOM_CONSTRAINT="$(get_policy "userPromptSubmit.customKeywords.constraint" "")"

# Build patterns with custom keywords
# If custom_json is empty array (DISABLED), use only base pattern
build_pattern() {
  local base="$1"
  local custom_json="$2"
  local custom_regex
  custom_regex="$(array_to_regex "$custom_json" "")"
  # Skip if empty, empty group, or explicitly disabled
  if [[ -n "$custom_regex" && "$custom_regex" != "()" && "$custom_regex" != "DISABLED" ]]; then
    echo "${base}|${custom_regex}"
  else
    echo "$base"
  fi
}

ROLE_PATTERN="$(build_pattern "(you are|act as|role:|당신은)" "$CUSTOM_ROLE")"
GOAL_PATTERN="$(build_pattern "(goal|objective|task:|목표)" "$CUSTOM_GOAL")"
CONTEXT_PATTERN="$(build_pattern "(context|background|given|scenario|전제)" "$CUSTOM_CONTEXT")"
FORMAT_PATTERN="$(build_pattern "(format|output|return|respond with|json|yaml|markdown)" "$CUSTOM_FORMAT")"
CONSTRAINT_PATTERN="$(build_pattern "(constraint|must|should not|don't|금지)" "$CUSTOM_CONSTRAINT")"

# -------- anti-pattern regexes --------
ANTI_VAGUE_JSON="$(get_policy "userPromptSubmit.antiPatterns.vague" "")"
ANTI_AMBIGUOUS_JSON="$(get_policy "userPromptSubmit.antiPatterns.ambiguous" "")"
ANTI_OVERCONFIDENT_JSON="$(get_policy "userPromptSubmit.antiPatterns.overConfident" "")"

ANTI_VAGUE_PATTERN="$(array_to_regex "$ANTI_VAGUE_JSON" "(잘|깔끔|적당|자연스럽|좋은|최대한|가능하면)")"
ANTI_AMBIGUOUS_PATTERN="$(array_to_regex "$ANTI_AMBIGUOUS_JSON" "(maybe|somehow|어느정도|약간|조금|많이)")"
ANTI_OVERCONFIDENT_PATTERN="$(array_to_regex "$ANTI_OVERCONFIDENT_JSON" "(확실히|반드시|항상|절대로)")"

# -------- strip code blocks --------
CLEAN_PROMPT="$(strip_code_blocks "$PROMPT")"

# -------- scoring --------
score=0
missing=()
detected_anti=()

# Positive scoring (structure indicators)
if echo "$CLEAN_PROMPT" | grep -qiE "$ROLE_PATTERN"; then
  score=$((score + SCORE_ROLE))
else
  missing+=("ROLE")
fi

if echo "$CLEAN_PROMPT" | grep -qiE "$GOAL_PATTERN"; then
  score=$((score + SCORE_GOAL))
else
  missing+=("GOAL")
fi

if echo "$CLEAN_PROMPT" | grep -qiE "$CONTEXT_PATTERN"; then
  score=$((score + SCORE_CONTEXT))
else
  missing+=("CONTEXT")
fi

if echo "$CLEAN_PROMPT" | grep -qiE "$FORMAT_PATTERN"; then
  score=$((score + SCORE_FORMAT))
else
  missing+=("FORMAT")
fi

if echo "$CLEAN_PROMPT" | grep -qiE "$CONSTRAINT_PATTERN"; then
  score=$((score + SCORE_CONSTRAINT))
else
  missing+=("CONSTRAINTS")
fi

# Negative scoring (anti-patterns)
# Skip if pattern is "DISABLED" (explicit disable via empty array)
if [[ "$ANTI_VAGUE_PATTERN" != "DISABLED" ]] && echo "$CLEAN_PROMPT" | grep -qiE "$ANTI_VAGUE_PATTERN"; then
  score=$((score + SCORE_ANTI_VAGUE))
  detected_anti+=("VAGUE")
fi

if [[ "$ANTI_AMBIGUOUS_PATTERN" != "DISABLED" ]] && echo "$CLEAN_PROMPT" | grep -qiE "$ANTI_AMBIGUOUS_PATTERN"; then
  score=$((score + SCORE_ANTI_AMBIGUOUS))
  detected_anti+=("AMBIGUOUS")
fi

if [[ "$ANTI_OVERCONFIDENT_PATTERN" != "DISABLED" ]] && echo "$CLEAN_PROMPT" | grep -qiE "$ANTI_OVERCONFIDENT_PATTERN"; then
  score=$((score + SCORE_ANTI_OVERCONFIDENT))
  detected_anti+=("OVERCONFIDENT")
fi

# -------- clamp score to 0-10 --------
if [[ "$score" -lt 0 ]]; then
  score=0
fi
if [[ "$score" -gt 10 ]]; then
  score=10
fi

quality_percent=$((score * 10))

# -------- output when low quality --------
if [[ "$quality_percent" -lt "${MIN_QUALITY_PERCENT:-60}" ]]; then
  missing_list="$(IFS=, ; echo "${missing[*]:-}")"
  anti_list="$(IFS=, ; echo "${detected_anti[*]:-}")"

  # Build suggestions
  suggestions=""
  if [[ " ${missing[*]:-} " =~ " ROLE " ]]; then
    suggestions="${suggestions}
- Add ROLE: \"You are a ...\""
  fi
  if [[ " ${missing[*]:-} " =~ " GOAL " ]]; then
    suggestions="${suggestions}
- Add GOAL: \"Your task is to ...\""
  fi
  if [[ " ${detected_anti[*]:-} " =~ " VAGUE " ]]; then
    suggestions="${suggestions}
- Replace vague words (잘/깔끔/적당) with specific criteria"
  fi
  if [[ " ${detected_anti[*]:-} " =~ " AMBIGUOUS " ]]; then
    suggestions="${suggestions}
- Replace ambiguous words (maybe/somehow/약간) with concrete values"
  fi

  additional_context=$(
    cat <<EOF
[PromptShield Lint]
- Quality: ${quality_percent}/100
- Missing: ${missing_list:-none}
$(if [[ ${#detected_anti[@]} -gt 0 ]]; then echo "- Anti-patterns: ${anti_list}"; fi)

Suggestions:${suggestions:-"
- Consider adding ROLE/GOAL/CONTEXT/FORMAT/CONSTRAINTS"}

Tip: Run /ps:r for guided improvement or /ps:lint for detailed analysis.
EOF
  )

  system_message="PromptShield: prompt quality ${quality_percent}/100."
  if [[ ${#detected_anti[@]} -gt 0 ]]; then
    system_message="${system_message} Anti-patterns detected: ${anti_list}."
  fi
  if [[ -n "$missing_list" ]]; then
    system_message="${system_message} Missing: ${missing_list}."
  fi
  system_message="${system_message} Run /ps:r for improvement."

  decision=""
  reason=""
  if [[ "${MODE:-warn}" == "block" ]]; then
    decision="block"
    reason="${BLOCK_REASON_BASE} (quality ${quality_percent}/100; missing: ${missing_list}; anti-patterns: ${anti_list})"
    system_message="PromptShield blocked this prompt (quality ${quality_percent}/100)."
  fi

  export ADDITIONAL_CONTEXT="$additional_context"
  export SYSTEM_MESSAGE="$system_message"
  export DECISION="$decision"
  export REASON="$reason"

  emit_hook_json "$additional_context" "$system_message" "$decision" "$reason"
fi

exit 0
