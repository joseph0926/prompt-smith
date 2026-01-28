#!/bin/bash
# PromptShield - CI LINT Script
# Checks prompt quality for all prompt files in the repository

set -e

RESULTS_FILE="/tmp/lint-results.txt"
FAILED=0
CHECKED=0

echo "| File | Score | Status |" > "$RESULTS_FILE"
echo "|------|-------|--------|" >> "$RESULTS_FILE"

check_prompt_quality() {
  local file="$1"
  local score=0
  local max_score=10

  if [ ! -f "$file" ]; then
    return 1
  fi

  local content
  content=$(cat "$file")

  if echo "$content" | grep -qiE '(you are|act as|role:|persona:)'; then
    score=$((score + 2))
  fi

  if echo "$content" | grep -qiE '(context:|background:|given:|##)'; then
    score=$((score + 2))
  fi

  if echo "$content" | grep -qiE '(instruction:|task:|step[s]?:|##)'; then
    score=$((score + 2))
  fi

  if echo "$content" | grep -qiE '(example:|for instance:|e\.g\.|```)'; then
    score=$((score + 2))
  fi

  if echo "$content" | grep -qiE '(format:|output:|response:|##)'; then
    score=$((score + 2))
  fi

  local status="Pass"
  if [ "$score" -lt 6 ]; then
    status="Warn"
    echo "1" >> /tmp/lint-failed.txt
  fi

  echo "1" >> /tmp/lint-checked.txt
  echo "| \`$file\` | $score/$max_score | $status |" >> "$RESULTS_FILE"
}

rm -f /tmp/lint-checked.txt /tmp/lint-failed.txt

for file in $(find commands -name "*.md" -type f 2>/dev/null); do
  check_prompt_quality "$file"
done

for file in $(find skills -name "*.md" -type f 2>/dev/null); do
  check_prompt_quality "$file"
done

for file in $(find agents -name "*.md" -type f 2>/dev/null); do
  check_prompt_quality "$file"
done

if [ -f /tmp/lint-checked.txt ]; then
  CHECKED=$(wc -l < /tmp/lint-checked.txt | tr -d ' ')
fi

if [ -f /tmp/lint-failed.txt ]; then
  FAILED=$(wc -l < /tmp/lint-failed.txt | tr -d ' ')
fi

echo ""
echo "Prompt Quality Check Complete"
echo "Checked: $CHECKED files"
echo "Warnings: $FAILED files"

if [ "$FAILED" -gt 0 ]; then
  echo "Some prompts may need improvement. Run /ps:lint for details."
fi

rm -f /tmp/lint-checked.txt /tmp/lint-failed.txt

exit 0
