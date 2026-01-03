# prompt-smith

> prompt quality management for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![ps_demo_01](https://github.com/user-attachments/assets/133323b9-878e-43aa-bfed-633d493c4dc7)

**Features**: 7-Point Quality Check | LINT Mode | BUILD Mode | Intercept Pipeline

## Quick Start

### Option 1: Plugin Install (slash commands enabled)

```bash
/plugin marketplace add joseph0926/prompt-smith
/plugin install ps@prompt-smith
```

### Option 2: Local Plugin (development)

```bash
git clone https://github.com/joseph0926/prompt-smith
claude --plugin-dir ./prompt-smith
```

### Option 3: Skill Only (natural language triggers)

```bash
git clone https://github.com/joseph0926/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

> **Note**: This method only enables natural language triggers (`use prompt-smith -r`), not slash commands.

### Usage

**Slash Commands (recommended)**:

````
/ps:r ```your prompt here```      # Review Mode
/ps:a ```your prompt here```      # Intercept Mode
/ps:lint your prompt              # LINT Mode
/ps:build requirements            # BUILD Mode
````

**Natural Language (alternative)**:

````
use prompt-smith -r ```
<Your prompt here.>
```
````

> **Note**: The prompt MUST be enclosed in triple backticks (```) after the flag.

## Modes

| Mode      | Slash Command             | Natural Language        | Description                       |
| --------- | ------------------------- | ----------------------- | --------------------------------- |
| Review    | ` /ps:r ```<prompt>```  ` | `use prompt-smith -r`   | Show improvements, await approval |
| Intercept | ` /ps:a ```<prompt>```  ` | `use prompt-smith -a`   | Auto-improve and execute          |
| LINT      | `/ps:lint`                | `lint this prompt`      | Diagnose existing prompts         |
| BUILD     | `/ps:build`               | `build a prompt for...` | Design from requirements          |

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

**방법 1: 플러그인 설치 (슬래시 커맨드 활성화)**

```bash
/plugin marketplace add joseph0926/prompt-smith
/plugin install ps@prompt-smith
```

**방법 2: 로컬 플러그인 (개발용)**

```bash
git clone https://github.com/joseph0926/prompt-smith
claude --plugin-dir ./prompt-smith
```

**방법 3: 스킬만 설치 (자연어 트리거)**

```bash
git clone https://github.com/joseph0926/prompt-smith
cp -r prompt-smith/skills/prompt-smith ~/.claude/skills/
```

> **참고**: 이 방법은 자연어 트리거(`prompt-smith 사용 -r`)만 활성화됩니다. 슬래시 커맨드는 사용 불가.

**슬래시 커맨드 (권장)**:

````
/ps:r ```프롬프트```      # Review Mode
/ps:a ```프롬프트```      # Intercept Mode
/ps:lint 프롬프트         # LINT Mode
/ps:build 요구사항        # BUILD Mode
````

**자연어 (대안)**:

````
prompt-smith 사용 -r ```
프롬프트 내용
```
````

> **참고**: 프롬프트는 플래그 뒤에 반드시 트리플 백틱(```)으로 감싸야 합니다.

### 모드

| 모드      | 슬래시 커맨드               | 자연어                    | 설명                       |
| --------- | --------------------------- | ------------------------- | -------------------------- |
| Review    | ` /ps:r ```<프롬프트>```  ` | `prompt-smith 사용 -r`    | 개선안 표시 후 승인 대기   |
| Intercept | ` /ps:a ```<프롬프트>```  ` | `prompt-smith 사용 -a`    | 자동 개선 후 즉시 실행     |
| LINT      | `/ps:lint`                  | `이 프롬프트 점검해줘`    | 기존 프롬프트 진단         |
| BUILD     | `/ps:build`                 | `~하는 프롬프트 만들어줘` | 요구사항에서 프롬프트 설계 |
