# prompt-smith

> Real-time prompt quality management for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![ps_demo_01](https://github.com/user-attachments/assets/133323b9-878e-43aa-bfed-633d493c4dc7)

**Features**: 7-Point Quality Check | LINT Mode | BUILD Mode | Intercept Pipeline

## Quick Start

### Option 1: Global Skill (all projects)

```bash
git clone https://github.com/kyh/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

### Option 2: Project Local Skill (this project only)

```bash
cp -r skills/prompt-smith .claude/skills/
```

### Usage

````
use prompt-smith -r ```
<Your prompt here.
Can include "quotes", newlines, and special characters.>
```
````

> **Note**: The prompt MUST be enclosed in triple backticks (```) after the flag.

## Modes

| Mode      | Trigger                                 | Description                       |
| --------- | --------------------------------------- | --------------------------------- |
| Review    | ` use prompt-smith -r ```<prompt>```  ` | Show improvements, await approval |
| Intercept | ` use prompt-smith -a ```<prompt>```  ` | Auto-improve and execute          |
| LINT      | `lint this prompt`                      | Diagnose existing prompts         |
| BUILD     | `build a prompt for...`                 | Design from requirements          |

## 7-Point Quality Check

| #   | Dimension      | Score |
| --- | -------------- | ----- |
| 1   | ROLE           | 0-2   |
| 2   | CONTEXT        | 0-2   |
| 3   | INSTRUCTION    | 0-2   |
| 4   | EXAMPLE        | 0-2   |
| 5   | FORMAT         | 0-2   |
| 6   | STATE_TRACKING | 0-2   |
| 7   | TOOL_USAGE     | 0-2   |

**Base Score**: Dimensions 1-5 (max 10)
**Extended Score**: All 7 dimensions (normalized)

## Platform

- **Claude Code** (CLI / VS Code extension)

## Documentation

- [Quick Start](skills/prompt-smith/onboarding/quick-start.md)
- [LINT Mode](skills/prompt-smith/playbooks/lint/full-lint.md)
- [BUILD Mode](skills/prompt-smith/playbooks/build/build-mode.md)
- [Intercept Pipeline](skills/prompt-smith/playbooks/intercept/review-mode.md)
- [Quality Checklist](skills/prompt-smith/references/quality-checklist.md)

## License

MIT License - see [LICENSE](LICENSE)

---

## 한국어

[한국어 문서 바로가기](skills/prompt-smith/i18n/ko/SKILL.md)

### 빠른 시작

```bash
git clone https://github.com/kyh/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

````
prompt-smith 사용 -r ```
프롬프트 내용을 여기에 작성합니다.
"따옴표", 줄바꿈, 특수문자도 사용 가능합니다.
```
````

> **참고**: 프롬프트는 플래그 뒤에 반드시 트리플 백틱(```)으로 감싸야 합니다.

### 모드

| 모드      | 트리거                                     | 설명                       |
| --------- | ------------------------------------------ | -------------------------- |
| Review    | ` prompt-smith 사용 -r ```<프롬프트>```  ` | 개선안 표시 후 승인 대기   |
| Intercept | ` prompt-smith 사용 -a ```<프롬프트>```  ` | 자동 개선 후 즉시 실행     |
| LINT      | `이 프롬프트 점검해줘`                     | 기존 프롬프트 진단         |
| BUILD     | `~하는 프롬프트 만들어줘`                  | 요구사항에서 프롬프트 설계 |
