# PromptShield

> Prompt quality management for Claude Code

> **[한국어 문서 (Korean)](README.ko.md)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.6.0-blue.svg)](https://github.com/joseph0926/prompt-shield/releases)

![ps_demo_02](https://github.com/user-attachments/assets/82cf7bf6-433a-4f3b-be3d-7389e341afaf)

**Core Features**:

- 8-Point Quality Check (LINT / BUILD / Review / Intercept)
- Eval Mode: A/B testing with test datasets
- Long Context: 200K token optimization
- Token Management: Cost estimation & context validation
- Structured Outputs: 100% JSON validity

## When to Use Which Mode?

| Situation                     | Recommended | Command                                                          |
| ----------------------------- | ----------- | ---------------------------------------------------------------- |
| "Is this prompt good enough?" | LINT        | `/ps:lint <prompt>`                                              |
| "Make this prompt better"     | Review      | `/ps:r <prompt>`                                                 |
| "Just fix it and run"         | Intercept   | `/ps:a <prompt>`                                                 |
| "Design a new prompt"         | BUILD       | `/ps:build <goal>`                                               |
| "Compare prompt variants"     | Eval        | See [Eval Mode](skills/prompt-shield/playbooks/eval/eval-mode.md) |

## Quick Start

### Commands at a Glance

| Command             | Description                                               | Best For          |
| ------------------- | --------------------------------------------------------- | ----------------- |
| `/ps:r <prompt>`    | **Review Mode** - Show improvements, await approval       | Daily use (safe)  |
| `/ps:lint <prompt>` | **LINT Mode** - Full diagnosis with test cases            | Debugging prompts |
| `/ps:a <prompt>`    | **Intercept Mode** - Auto-improve and execute immediately | Quick tasks       |
| `/ps:build <goal>`  | **BUILD Mode** - Design from requirements                 | New prompts       |
| `/ps:help [topic]`  | **Help** - Show usage guide and command reference         | Getting started   |

**Quick Example**:

```
/ps:r Write a function to parse JSON
```

Shows score (3/10 → 8/10), changes, asks "Proceed? (y/n/e)"

---

### Option 1: Plugin Install (slash commands enabled)

1. In VS Code, type `/plugin` to open plugin terminal
2. Press `Tab` to navigate to "Add Marketplace"
3. Enter: `joseph0926/prompt-shield`
4. Press `Tab` to navigate to "Install Plugin"
5. Select `ps@prompt-shield`

![Install Guide](assets/install_g_01.png)

### Option 2: Local Plugin (development)

```bash
git clone https://github.com/joseph0926/prompt-shield
claude --plugin-dir ./prompt-shield
```

### Option 3: Skill Only (natural language triggers)

```bash
git clone https://github.com/joseph0926/prompt-shield
cp -r prompt-shield/skills/prompt-shield ~/.claude/skills/
```

> **Note**: This method only enables natural language triggers (`use prompt-shield -r`), not slash commands.

### Usage

**Slash Commands (recommended)**:

```
/ps:r your prompt here            # Review Mode (single line)
/ps:r your prompt here
with multiple lines               # Review Mode (multiline)
/ps:a your prompt here            # Intercept Mode
/ps:lint your prompt              # LINT Mode
/ps:build requirements            # BUILD Mode
```

> **Note**: Triple backticks (```) are optional. Plain text and multiline input are fully supported.

**Natural Language (alternative)**:

```
use prompt-shield -r Your prompt here
```

## Real Examples

### LINT Mode (Diagnose)

```
/ps:lint Analyze user feedback
```

**Output**: Score 3/10 → Top 3 issues → Improved prompt → 5 test cases

### Review Mode (Safe Improvement)

```
/ps:r Write a function to parse JSON
```

**Output**:

```
+----------------------------------------------------------+
| Score: 3/10 -> 8/10 (+5)                                 |
+----------------------------------------------------------+
Changes:
- [+] Added: Software engineer role
- [+] Added: Error handling examples
- [~] Modified: Specified return format

Proceed? (y/n/e)
```

### Intercept Mode (Auto-fix)

```
/ps:a Summarize this document
```

**Output**: Auto-improved if +2 points possible → Executes immediately

## What's New in v3.x

### v3.3.1 (Latest)

| Feature                   | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| **Examples & TOCs**       | Expanded examples and added TOCs to long references                 |
| **Structured Outputs**    | Stronger guidance for schema mismatch and JSON mode caution         |

### v3.3.0

| Feature                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| **ps:a Token Efficiency** | Minimal output: `[PromptShield] 활성화됨 (X→Y점)`       |
| **ps:r Intent Capture**   | AskUserQuestion for format/detail/constraints/goals  |

### v3.2.0

| Feature                | Description                                   |
| ---------------------- | --------------------------------------------- |
| **Eval Mode**          | A/B prompt comparison with test datasets      |
| **Long Context**       | 200K token optimization (chunking, placement) |
| **Token Management**   | Cost estimation, context window validation    |
| **Structured Outputs** | 100% JSON validity techniques                 |

### v3.0.0 - v3.1.0

| Feature                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| **Progressive Loading** | Skills load on-demand                              |
| **Hooks**               | Auto-LINT on prompt submit (optional)              |
| **Agents**              | 3 specialized: optimizer, reviewer, test-generator |
| **GitHub Actions**      | CI/CD integration                                  |

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

## Modes

| Mode      | Slash Command       | Natural Language        | Description                       |
| --------- | ------------------- | ----------------------- | --------------------------------- |
| Review    | `/ps:r <prompt>`    | `use prompt-shield -r`   | Show improvements, await approval |
| Intercept | `/ps:a <prompt>`    | `use prompt-shield -a`   | Auto-improve and execute          |
| LINT      | `/ps:lint <prompt>` | `lint this prompt`      | Diagnose existing prompts         |
| BUILD     | `/ps:build <goal>`  | `build a prompt for...` | Design from requirements          |

## 8-Point Quality Check

| #   | Dimension        | Score | Note         |
| --- | ---------------- | ----- | ------------ |
| 1   | ROLE             | 0-2   | Base         |
| 2   | CONTEXT          | 0-2   | Base         |
| 3   | INSTRUCTION      | 0-2   | Base         |
| 4   | EXAMPLE          | 0-2   | Base         |
| 5   | FORMAT           | 0-2   | Base         |
| 6   | SUCCESS_CRITERIA | 0-2   | Base (v2.7+) |
| 7   | STATE_TRACKING   | 0-2   | Extended     |
| 8   | TOOL_USAGE       | 0-2   | Extended     |

**Base Score**: Dimensions 1-6 (max 12 → normalized to 10)
**Extended Score**: All 8 dimensions (normalized)

## Documentation

### Getting Started

- [Quick Start](skills/prompt-shield/onboarding/quick-start.md)
- [First LINT](skills/prompt-shield/onboarding/first-lint.md)
- [First BUILD](skills/prompt-shield/onboarding/first-build.md)

### Mode Guides

- [LINT Mode](skills/prompt-shield/playbooks/lint/full-lint.md)
- [BUILD Mode](skills/prompt-shield/playbooks/build/build-mode.md)
- [Review Mode](skills/prompt-shield/playbooks/intercept/review-mode.md)
- [Intercept Mode](skills/prompt-shield/playbooks/intercept/intercept-mode.md)
- [Eval Mode](skills/prompt-shield/playbooks/eval/eval-mode.md)

### Advanced (v3.2.0)

- [Long Context Optimization](skills/prompt-shield/references/long-context-optimization.md)
- [Token Management](skills/prompt-shield/references/token-management.md)
- [Structured Outputs](skills/prompt-shield/references/structured-outputs.md)
- [Prompt Chaining](skills/prompt-shield/playbooks/prompt-chaining.md)

### Reference

- [8-Point Quality Checklist](skills/prompt-shield/references/quality-checklist.md)
- [Anti-Patterns](skills/prompt-shield/references/anti-patterns.md)
- [Technique Priority](skills/prompt-shield/references/technique-priority.md) (Anthropic recommended)
- [Claude 4.x Best Practices](skills/prompt-shield/references/claude-4x-best-practices.md)

## Troubleshooting

### Slash commands not working

1. Verify plugin: In VS Code, type `/plugin` → check installed list
2. Restart VS Code or reload Claude Code extension
3. Try reinstalling: Remove plugin, then reinstall

### Score seems wrong

- Extended items (STATE_TRACKING, TOOL_USAGE) only apply to multi-step or tool-using prompts
- If N/A, they're excluded from score calculation

## Platform

- **Claude Code** (CLI / VS Code extension)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- [Report a bug](https://github.com/joseph0926/prompt-shield/issues)
- [Security issues](SECURITY.md)

## License

MIT License - see [LICENSE](LICENSE)
