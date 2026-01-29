#!/usr/bin/env node
/**
 * PromptShield Lint Engine
 *
 * Single source of truth for prompt quality scoring.
 * Used by both CI scripts and Hooks for consistent results.
 *
 * @version 1.0.0
 * @see ARCHITECTURE.md for design rationale
 */

const rules = require('./rules');

/**
 * @typedef {Object} LintConfig
 * @property {number} [maxScore=10] - Maximum possible score
 * @property {boolean} [includeExtended=true] - Include STATE_TRACKING and TOOL_USAGE when applicable
 */

/**
 * @typedef {Object} Finding
 * @property {string} rule - Rule ID (e.g., "missing-role", "weak-context")
 * @property {'error'|'warn'|'info'} severity - Finding severity
 * @property {string} message - Human-readable message
 * @property {number} [score] - Points deducted or earned
 * @property {string[]} [suggestions] - Improvement suggestions
 */

/**
 * @typedef {Object} LintResult
 * @property {number} score - Normalized score (0-10)
 * @property {number} rawScore - Raw score before normalization
 * @property {number} maxPossible - Maximum possible score for this prompt
 * @property {number} applicableItems - Number of applicable check items
 * @property {Finding[]} findings - List of findings
 * @property {string[]} missing - List of missing dimensions
 * @property {Object} breakdown - Score breakdown by dimension
 */

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  maxScore: 10,
  includeExtended: true
};

/**
 * Lint a prompt and return quality score with findings
 *
 * @param {string} content - Prompt content to lint
 * @param {LintConfig} [config] - Optional configuration
 * @returns {LintResult} Lint result
 */
function lint(content, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (typeof content !== 'string') {
    return {
      score: 0,
      rawScore: 0,
      maxPossible: cfg.maxScore,
      applicableItems: 0,
      findings: [{
        rule: 'invalid-input',
        severity: 'error',
        message: 'Content must be a string'
      }],
      missing: [],
      breakdown: {}
    };
  }

  const normalizedContent = content.toLowerCase();
  const findings = [];
  const missing = [];
  const breakdown = {};

  // Check base 6 dimensions (always applicable)
  const baseDimensions = ['ROLE', 'CONTEXT', 'INSTRUCTION', 'EXAMPLE', 'FORMAT', 'SUCCESS_CRITERIA'];

  for (const dim of baseDimensions) {
    const rule = rules[dim];
    const result = rule.check(content, normalizedContent);
    breakdown[dim] = result;

    if (result.score === 0) {
      missing.push(dim);
      findings.push({
        rule: `missing-${dim.toLowerCase()}`,
        severity: 'error',
        message: result.message || `Missing ${dim} definition`,
        score: 0,
        suggestions: rule.suggestions || []
      });
    } else if (result.score === 1) {
      findings.push({
        rule: `weak-${dim.toLowerCase()}`,
        severity: 'warn',
        message: result.message || `${dim} is present but weak`,
        score: 1,
        suggestions: rule.suggestions || []
      });
    }
  }

  // Check extended dimensions (only if applicable)
  let applicableItems = 6; // Base dimensions

  if (cfg.includeExtended) {
    const extendedDimensions = ['STATE_TRACKING', 'TOOL_USAGE'];

    for (const dim of extendedDimensions) {
      const rule = rules[dim];
      const applicability = rule.isApplicable(content, normalizedContent);

      if (applicability.applicable) {
        applicableItems++;
        const result = rule.check(content, normalizedContent);
        breakdown[dim] = { ...result, applicable: true, reason: applicability.reason };

        if (result.score === 0) {
          missing.push(dim);
          findings.push({
            rule: `missing-${dim.toLowerCase().replace('_', '-')}`,
            severity: 'error',
            message: result.message || `Missing ${dim} for applicable task`,
            score: 0,
            suggestions: rule.suggestions || []
          });
        } else if (result.score === 1) {
          findings.push({
            rule: `weak-${dim.toLowerCase().replace('_', '-')}`,
            severity: 'warn',
            message: result.message || `${dim} is present but incomplete`,
            score: 1,
            suggestions: rule.suggestions || []
          });
        }
      } else {
        breakdown[dim] = { score: 'N/A', applicable: false, reason: applicability.reason };
      }
    }
  }

  // Calculate scores
  const maxPossibleRaw = applicableItems * 2;
  let rawScore = 0;

  for (const dim of Object.keys(breakdown)) {
    const result = breakdown[dim];
    if (typeof result.score === 'number') {
      rawScore += result.score;
    }
  }

  // Normalize to 10-point scale
  const score = maxPossibleRaw > 0
    ? Math.round((rawScore / maxPossibleRaw) * cfg.maxScore * 10) / 10
    : 0;

  return {
    score,
    rawScore,
    maxPossible: cfg.maxScore,
    applicableItems,
    findings,
    missing,
    breakdown
  };
}

/**
 * CLI interface for lint-engine
 * Usage: node lint-engine/index.js <file-path>
 */
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');

  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
PromptShield Lint Engine

Usage: node index.js <file-path> [options]

Options:
  --json              Output as JSON
  --no-extended       Skip extended dimensions (STATE_TRACKING, TOOL_USAGE)
  --max-score=N       Maximum score scale (default: 10)
  --threshold=N       Pass/fail threshold (default: 6)
  -h, --help          Show this help

Exit codes:
  0 = Score >= threshold (PASS)
  1 = Score < threshold (FAIL)
  2 = Error (invalid input, file not found)
`);
    process.exit(0);
  }

  const filePath = args.find(a => !a.startsWith('-') && !a.startsWith('--'));
  const jsonOutput = args.includes('--json');
  const includeExtended = !args.includes('--no-extended');

  // Parse --max-score=N
  const maxScoreArg = args.find(a => a.startsWith('--max-score='));
  const maxScore = maxScoreArg ? parseInt(maxScoreArg.split('=')[1], 10) : 10;

  // Parse --threshold=N
  const thresholdArg = args.find(a => a.startsWith('--threshold='));
  const threshold = thresholdArg ? parseInt(thresholdArg.split('=')[1], 10) : 6;

  if (!filePath) {
    console.error('Error: File path required');
    process.exit(2);
  }

  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(`Error: File not found: ${absPath}`);
    process.exit(2);
  }

  try {
    const content = fs.readFileSync(absPath, 'utf8');
    const result = lint(content, { includeExtended, maxScore });

    if (jsonOutput) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\nPromptShield Lint Report`);
      console.log(`========================`);
      console.log(`File: ${filePath}`);
      console.log(`Score: ${result.score}/${result.maxPossible}`);
      console.log(`Raw: ${result.rawScore}/${result.applicableItems * 2}`);
      console.log(`Applicable items: ${result.applicableItems}`);
      console.log(`Threshold: ${threshold}`);

      if (result.missing.length > 0) {
        console.log(`\nMissing: ${result.missing.join(', ')}`);
      }

      if (result.findings.length > 0) {
        console.log(`\nFindings:`);
        for (const f of result.findings) {
          const icon = f.severity === 'error' ? '❌' : f.severity === 'warn' ? '⚠️' : 'ℹ️';
          console.log(`  ${icon} [${f.rule}] ${f.message}`);
        }
      }

      console.log(`\nBreakdown:`);
      for (const [dim, data] of Object.entries(result.breakdown)) {
        const scoreStr = data.score === 'N/A' ? 'N/A' : `${data.score}/2`;
        console.log(`  ${dim}: ${scoreStr}`);
      }
    }

    // Exit code based on threshold
    process.exit(result.score >= threshold ? 0 : 1);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

module.exports = { lint, DEFAULT_CONFIG };
