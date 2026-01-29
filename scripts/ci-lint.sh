#!/bin/bash
# PromptShield - CI LINT Script
# Checks prompt quality for all prompt files in the repository
# Uses lib/lint-engine for unified scoring (Sprint 2)
#
# Exit codes:
#   0 = All prompts pass quality threshold
#   1 = One or more prompts below threshold (Gate FAIL)
#   2 = Configuration or execution error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$REPO_ROOT/ps.config.json"
LINT_ENGINE="$REPO_ROOT/lib/lint-engine/index.js"

# Default values (used if config file not found)
MIN_SCORE_CI=6
MIN_SCORE_WARN=4
MAX_SCORE=10
MAX_FAILURES_SHOWN=5
FAIL_ON_THRESHOLD_BREACH=true
INCLUDE_GLOBS=("commands/**/*.md" "skills/**/*.md" "agents/**/*.md" "prompts/**/*.md")
EXCLUDE_GLOBS=("**/node_modules/**" "**/.git/**" "**/README.md" "**/CHANGELOG.md")
STATUS_FILE="/tmp/lint-status.txt"

# Error handler for exit code 2
error_exit() {
  echo "ERROR: $1" >&2
  echo "Exit code: 2 (Configuration or execution error)"
  exit 2
}

# Check required dependencies
check_dependencies() {
  if ! command -v node &> /dev/null; then
    error_exit "Node.js is required but not found. Install Node.js to use lint-engine."
  fi

  if ! command -v jq &> /dev/null; then
    error_exit "jq is required but not found. Install jq for JSON parsing."
  fi

  if [ ! -f "$LINT_ENGINE" ]; then
    error_exit "Lint engine not found at $LINT_ENGINE"
  fi
}

# Load config if exists
load_config() {
  if [ ! -f "$CONFIG_FILE" ]; then
    echo "Info: No ps.config.json found, using defaults"
    return 0
  fi

  # jq is already verified in check_dependencies

  # Validate JSON
  if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    error_exit "Invalid JSON in $CONFIG_FILE"
  fi

  MIN_SCORE_CI=$(jq -r '.lint.minScoreCI // 6' "$CONFIG_FILE")
  MIN_SCORE_WARN=$(jq -r '.lint.minScoreWarn // 4' "$CONFIG_FILE")
  MAX_SCORE=$(jq -r '.lint.maxScore // 10' "$CONFIG_FILE")
  MAX_FAILURES_SHOWN=$(jq -r '.ci.maxFailuresShown // 5' "$CONFIG_FILE")
  FAIL_ON_THRESHOLD_BREACH=$(jq -r '.ci.failOnThresholdBreach // true' "$CONFIG_FILE")

  # Load includeGlobs as array (POSIX compatible)
  if jq -e '.lint.includeGlobs' "$CONFIG_FILE" > /dev/null 2>&1; then
    INCLUDE_GLOBS=()
    while IFS= read -r line; do
      INCLUDE_GLOBS+=("$line")
    done < <(jq -r '.lint.includeGlobs[]' "$CONFIG_FILE")
  fi

  # Load excludeGlobs as array (POSIX compatible)
  if jq -e '.lint.excludeGlobs' "$CONFIG_FILE" > /dev/null 2>&1; then
    EXCLUDE_GLOBS=()
    while IFS= read -r line; do
      EXCLUDE_GLOBS+=("$line")
    done < <(jq -r '.lint.excludeGlobs[]' "$CONFIG_FILE")
  fi
}

# Convert glob to regex (supports ** as 0+ directories)
glob_to_regex() {
  local pattern="$1"
  local regex="$pattern"

  regex="${regex//\*\*\//__GLOBSTAR_DIR__}"
  regex="${regex//\*\*/__GLOBSTAR__}"
  regex="${regex//\[!/\[^}"
  regex="${regex//\\/\\\\}"
  regex="${regex//./\\.}"
  regex="${regex//+/\\+}"
  regex="${regex//^/\\^}"
  regex="${regex//\$/\\$}"
  regex="${regex//\(/\\(}"
  regex="${regex//\)/\\)}"
  regex="${regex//|/\\|}"

  regex="${regex//\*/[^/]*}"
  regex="${regex//\?/[^/]}"
  regex="${regex//__GLOBSTAR_DIR__/(.*/)?}"
  regex="${regex//__GLOBSTAR__/.*/}"

  echo "^${regex}$"
}

matches_any() {
  local path="$1"
  shift
  local pattern
  for pattern in "$@"; do
    local regex
    regex="$(glob_to_regex "$pattern")"
    if [[ "$path" =~ $regex ]]; then
      return 0
    fi
  done
  return 1
}

RESULTS_FILE="/tmp/lint-results.txt"
FAILURES_FILE="/tmp/lint-failures.txt"
FAILED=0
CHECKED=0

# Check prompt quality using lint-engine (unified scoring)
check_prompt_quality() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return 1
  fi

  local rel_file="${file#$REPO_ROOT/}"

  # Call lint-engine with JSON output and configured max score
  local lint_result
  lint_result=$(node "$LINT_ENGINE" "$file" --json --max-score="$MAX_SCORE" 2>/dev/null)

  if [ $? -eq 2 ]; then
    echo "Warning: Failed to lint $rel_file" >&2
    return 1
  fi

  # Parse JSON result with jq
  local score missing_str
  score=$(echo "$lint_result" | jq -r '.score')
  missing_str=$(echo "$lint_result" | jq -r '.missing | .[0:3] | join(", ")')

  # Handle non-numeric score (fallback)
  if ! [[ "$score" =~ ^[0-9.]+$ ]]; then
    score=0
  fi

  # Round score to integer for comparison
  local score_int
  score_int=$(printf "%.0f" "$score")

  local status="Pass"
  local status_icon="✅"

  if [ "$score_int" -lt "$MIN_SCORE_CI" ]; then
    status="FAIL"
    status_icon="❌"
    FAILED=$((FAILED + 1))
    echo "$rel_file|$score|$MIN_SCORE_CI|$missing_str" >> "$FAILURES_FILE"
  elif [ "$score_int" -lt "$MIN_SCORE_WARN" ]; then
    status="Warn"
    status_icon="⚠️"
  fi

  CHECKED=$((CHECKED + 1))
  echo "| \`$rel_file\` | $score/$MAX_SCORE | $status_icon $status |" >> "$RESULTS_FILE"
}

# Initialize
check_dependencies
load_config

echo "| File | Score | Status |" > "$RESULTS_FILE"
echo "|------|-------|--------|" >> "$RESULTS_FILE"
> "$FAILURES_FILE"

# Find files based on includeGlobs/excludeGlobs
while IFS= read -r -d '' file; do
  rel_file="${file#$REPO_ROOT/}"
  if matches_any "$rel_file" "${INCLUDE_GLOBS[@]}"; then
    if ! matches_any "$rel_file" "${EXCLUDE_GLOBS[@]}"; then
      check_prompt_quality "$file"
    fi
  fi
done < <(find "$REPO_ROOT" -type f -name "*.md" -print0 2>/dev/null)

# Output summary
echo ""
echo "========================================"
echo "  PromptShield Quality Gate Report"
echo "========================================"
echo ""
echo "Threshold: $MIN_SCORE_CI/$MAX_SCORE (CI Gate)"
echo "Checked:   $CHECKED files"
echo "Failed:    $FAILED files"
echo "Gate Mode: $([ "$FAIL_ON_THRESHOLD_BREACH" = "true" ] && echo "Blocking" || echo "Report Only")"
echo ""

# Show failures if any
if [ "$FAILED" -gt 0 ]; then
  echo "----------------------------------------"
  echo "  Failed Prompts (top $MAX_FAILURES_SHOWN)"
  echo "----------------------------------------"
  head -n "$MAX_FAILURES_SHOWN" "$FAILURES_FILE" | while IFS='|' read -r file score threshold missing; do
    echo "  ❌ $file"
    echo "     Score: $score/$MAX_SCORE (required: $threshold)"
    if [ -n "$missing" ]; then
      echo "     Missing: $missing"
    fi
  done
  echo ""
  echo "Run '/ps:lint' locally for detailed analysis."
  echo ""
fi

# Cleanup
rm -f "$FAILURES_FILE"

# Exit with appropriate code
if [ "$FAILED" -gt 0 ]; then
  if [ "$FAIL_ON_THRESHOLD_BREACH" = "true" ]; then
    echo "❌ GATE FAILED: $FAILED prompt(s) below threshold ($MIN_SCORE_CI/$MAX_SCORE)"
    echo "FAIL" > "$STATUS_FILE"
    exit 1
  else
    echo "⚠️ GATE WARNING: $FAILED prompt(s) below threshold (report only mode)"
    echo "WARN" > "$STATUS_FILE"
    exit 0
  fi
else
  echo "✅ GATE PASSED: All prompts meet quality threshold"
  echo "PASS" > "$STATUS_FILE"
  exit 0
fi
