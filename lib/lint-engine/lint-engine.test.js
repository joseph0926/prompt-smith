/**
 * PromptShield Lint Engine Tests
 *
 * Run with: node --test lib/lint-engine/lint-engine.test.js
 * Or: npx vitest run lib/lint-engine/ (if vitest is installed)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { lint, DEFAULT_CONFIG } = require('./index');
const rules = require('./rules');

describe('lint-engine', () => {
  describe('lint()', () => {
    it('returns score 0 for empty content', () => {
      const result = lint('');
      assert.strictEqual(result.score, 0);
      assert.strictEqual(result.missing.length, 6);
    });

    it('returns score 0 for non-string input', () => {
      const result = lint(null);
      assert.strictEqual(result.score, 0);
      assert.strictEqual(result.findings[0].rule, 'invalid-input');
    });

    it('detects strong ROLE pattern', () => {
      const prompt = 'You are a senior software engineer with 10 years of experience.';
      const result = lint(prompt);
      assert.strictEqual(result.breakdown.ROLE.score, 2);
    });

    it('detects weak ROLE pattern', () => {
      const prompt = 'You are an assistant.';
      const result = lint(prompt);
      assert.strictEqual(result.breakdown.ROLE.score, 1);
    });

    it('calculates correct score for full prompt', () => {
      const fullPrompt = `
You are a senior software engineer with expertise in TypeScript.

## Context
This is a code review task for a React application.
Tech stack: TypeScript, React 18, Vite

## Instructions
1. Review the provided code
2. Identify potential issues
3. Suggest improvements

## Examples
<example>
Input: function foo() { return 1 }
Output: Consider adding type annotations
</example>

## Output Format
{
  "issues": "array",
  "suggestions": "array"
}

## Success Criteria
- Must identify at least 3 issues
- Must provide actionable suggestions
`;
      const result = lint(fullPrompt);
      assert.ok(result.score >= 8, `Expected score >= 8, got ${result.score}`);
      assert.strictEqual(result.missing.length, 0);
    });

    it('handles extended dimensions correctly', () => {
      const multiStepPrompt = `
You are a senior developer.

## Context
Processing multiple files in batch.

## Instructions
1. Read all files
2. Process each file
3. Save results

## Output Format
JSON with results

## Success Criteria
Must process all files
`;
      const result = lint(multiStepPrompt, { includeExtended: true });
      // STATE_TRACKING should be applicable for multi-step task
      assert.ok(result.breakdown.STATE_TRACKING.applicable, 'STATE_TRACKING should be applicable');
      assert.ok(result.applicableItems >= 7, `Expected >= 7 applicable items, got ${result.applicableItems}`);
    });

    it('skips extended dimensions when disabled', () => {
      const prompt = 'Process all files in batch.';
      const result = lint(prompt, { includeExtended: false });
      assert.strictEqual(result.applicableItems, 6);
      assert.strictEqual(result.breakdown.STATE_TRACKING, undefined);
      assert.strictEqual(result.breakdown.TOOL_USAGE, undefined);
    });
  });

  describe('rules', () => {
    describe('ROLE', () => {
      it('matches strong patterns', () => {
        const tests = [
          'You are a senior software engineer',
          'Act as an expert data analyst',
          'Role: Backend Developer',
          'Persona: Technical Writer'
        ];
        for (const text of tests) {
          const result = rules.ROLE.check(text, text.toLowerCase());
          assert.strictEqual(result.score, 2, `Failed for: ${text}`);
        }
      });

      it('matches weak patterns', () => {
        const tests = [
          'You are an assistant',
          'Act as a helper'
        ];
        for (const text of tests) {
          const result = rules.ROLE.check(text, text.toLowerCase());
          assert.strictEqual(result.score, 1, `Failed for: ${text}`);
        }
      });
    });

    describe('CONTEXT', () => {
      it('matches strong patterns', () => {
        const tests = [
          '## Context\nThis is background',
          'Context:\nSome information',
          'Domain: Healthcare'
        ];
        for (const text of tests) {
          const result = rules.CONTEXT.check(text, text.toLowerCase());
          assert.strictEqual(result.score, 2, `Failed for: ${text}`);
        }
      });
    });

    describe('INSTRUCTION', () => {
      it('matches numbered steps', () => {
        const text = '1. First step\n2. Second step\n3. Third step';
        const result = rules.INSTRUCTION.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });

      it('matches section headers', () => {
        const text = '## Instructions\nDo this task';
        const result = rules.INSTRUCTION.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });
    });

    describe('EXAMPLE', () => {
      it('detects example tags', () => {
        const text = '<example>Input: x\nOutput: y</example>';
        const result = rules.EXAMPLE.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });

      it('detects input-output pairs', () => {
        const text = 'Input: foo\nOutput: bar\nInput: baz\nOutput: qux\nInput: a\nOutput: b';
        const result = rules.EXAMPLE.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });
    });

    describe('FORMAT', () => {
      it('detects JSON schema', () => {
        const text = '{"result": "string", "count": "number"}';
        const result = rules.FORMAT.check(text, text.toLowerCase());
        assert.ok(result.score >= 1, `Expected score >= 1, got ${result.score}`);
      });

      it('detects format section', () => {
        const text = '## Output Format\nReturn a JSON object';
        const result = rules.FORMAT.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });
    });

    describe('SUCCESS_CRITERIA', () => {
      it('detects checkbox pattern', () => {
        const text = '- [ ] Must be valid\n- [ ] Must be complete\n- [ ] Must pass tests';
        const result = rules.SUCCESS_CRITERIA.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 2);
      });

      it('detects measurable criteria', () => {
        const text = 'Response must be under 100 words';
        const result = rules.SUCCESS_CRITERIA.check(text, text.toLowerCase());
        assert.strictEqual(result.score, 1);
      });
    });

    describe('STATE_TRACKING', () => {
      it('is applicable for multi-step tasks', () => {
        const text = 'Process multiple files in batch';
        const result = rules.STATE_TRACKING.isApplicable(text, text.toLowerCase());
        assert.strictEqual(result.applicable, true);
      });

      it('is not applicable for single-step tasks', () => {
        const text = 'Review this code';
        const result = rules.STATE_TRACKING.isApplicable(text, text.toLowerCase());
        assert.strictEqual(result.applicable, false);
      });
    });

    describe('TOOL_USAGE', () => {
      it('is applicable for file operations', () => {
        const text = 'Read the file and extract data';
        const result = rules.TOOL_USAGE.isApplicable(text, text.toLowerCase());
        assert.strictEqual(result.applicable, true);
      });

      it('is not applicable for pure generation', () => {
        const text = 'Write a poem about nature';
        const result = rules.TOOL_USAGE.isApplicable(text, text.toLowerCase());
        assert.strictEqual(result.applicable, false);
      });
    });
  });
});

// Run tests when executed directly
if (require.main === module) {
  console.log('Running lint-engine tests...');
  console.log('Use: node --test lib/lint-engine/lint-engine.test.js');
}
