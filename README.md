# prompt-smith

> Real-time prompt quality management for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Features**: 7-Point Quality Check | LINT Mode | BUILD Mode | Auto-Improve Pipeline

## Quick Start

```bash
cp -r prompt-smith ~/.claude/skills/
```

```
/prompt-smith "your prompt here"
```

## Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| Review | `/prompt-smith <prompt>` | Show improvements, await approval |
| Intercept | `/prompt-smith --auto <prompt>` | Auto-improve and execute |
| LINT | `lint this prompt` | Diagnose existing prompts |
| BUILD | `build a prompt for...` | Design from requirements |

## 7-Point Quality Check

| # | Dimension | Score |
|---|-----------|-------|
| 1 | ROLE | 0-2 |
| 2 | CONTEXT | 0-2 |
| 3 | INSTRUCTION | 0-2 |
| 4 | EXAMPLE | 0-2 |
| 5 | FORMAT | 0-2 |
| 6 | STATE_TRACKING | 0-2 |
| 7 | TOOL_USAGE | 0-2 |

**Base Score**: Dimensions 1-5 (max 10)
**Extended Score**: All 7 dimensions (normalized)

## Platforms

- Claude Code (primary)
- claude.ai
- VS Code Agent Mode
- GitHub Copilot
- OpenAI Codex CLI

## Installation

### Claude Code

```bash
cp -r prompt-smith ~/.claude/skills/prompt-smith/
```

### Project-level

```bash
cp -r prompt-smith .claude/skills/prompt-smith/
```

## Documentation

- [Quick Start](onboarding/quick-start.md)
- [LINT Mode](playbooks/lint/full-lint.md)
- [BUILD Mode](playbooks/build/build-mode.md)
- [Intercept Pipeline](playbooks/intercept/review-mode.md)
- [Quality Checklist](references/quality-checklist.md)

## License

MIT License - see [LICENSE](LICENSE)

---

## 한국어

[한국어 문서 바로가기](i18n/ko/SKILL.md)

### 빠른 시작

```bash
cp -r prompt-smith ~/.claude/skills/
```

```
/prompt-smith "프롬프트 내용"
```

### 모드

| 모드 | 트리거 | 설명 |
|------|--------|------|
| Review | `/prompt-smith <프롬프트>` | 개선안 표시 후 승인 대기 |
| Intercept | `/prompt-smith --auto <프롬프트>` | 자동 개선 후 즉시 실행 |
| LINT | `이 프롬프트 점검해줘` | 기존 프롬프트 진단 |
| BUILD | `~하는 프롬프트 만들어줘` | 요구사항에서 프롬프트 설계 |
