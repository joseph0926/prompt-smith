# prompt-smith

> prompt quality management for Claude Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![ps_demo_02](https://github.com/user-attachments/assets/82cf7bf6-433a-4f3b-be3d-7389e341afaf)

**Features**: 7-Point Quality Check | LINT Mode | BUILD Mode | Intercept Pipeline

## Quick Start

### Option 1: Plugin Install (slash commands enabled)

1. In VS Code, type `/plugin` to open plugin terminal
2. Press `Tab` to navigate to "Add Marketplace"
3. Enter: `joseph0926/prompt-smith`
4. Press `Tab` to navigate to "Install Plugin"
5. Select `ps@prompt-smith`

![Install Guide](assets/install_g_01.png)

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
/ps:r your prompt here            # Review Mode (single line)
/ps:r your prompt here
with multiple lines               # Review Mode (multiline)
/ps:a your prompt here            # Intercept Mode
/ps:lint your prompt              # LINT Mode
/ps:build requirements            # BUILD Mode
````

> **Note**: Triple backticks (```) are optional. Plain text and multiline input are fully supported.

**Natural Language (alternative)**:

```
use prompt-smith -r Your prompt here
```

## Modes

| Mode      | Slash Command        | Natural Language        | Description                       |
| --------- | -------------------- | ----------------------- | --------------------------------- |
| Review    | `/ps:r <prompt>`     | `use prompt-smith -r`   | Show improvements, await approval |
| Intercept | `/ps:a <prompt>`     | `use prompt-smith -a`   | Auto-improve and execute          |
| LINT      | `/ps:lint <prompt>`  | `lint this prompt`      | Diagnose existing prompts         |
| BUILD     | `/ps:build <goal>`   | `build a prompt for...` | Design from requirements          |

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
- [Prompt Chaining](skills/prompt-smith/playbooks/prompt-chaining.md)
- [Quality Checklist](skills/prompt-smith/references/quality-checklist.md)

## License

MIT License - see [LICENSE](LICENSE)

---

## 한국어

[한국어 문서 바로가기](skills/prompt-smith/i18n/ko/SKILL.md)

![ps_demo_01](https://github.com/user-attachments/assets/fe3d2a32-9317-4df4-a418-b4d3ac42d920)

### 빠른 시작

**방법 1: 플러그인 설치 (슬래시 커맨드 활성화)**

1. VS Code에서 `/plugin` 입력하여 플러그인 터미널 열기
2. `Tab` 키로 "Add Marketplace" 이동
3. `joseph0926/prompt-smith` 입력
4. `Tab` 키로 "Install Plugin" 이동
5. `ps@prompt-smith` 선택

![설치 가이드](assets/install_g_01.png)

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
/ps:r 프롬프트                     # Review Mode (한 줄)
/ps:r 프롬프트
여러 줄로 작성 가능                # Review Mode (여러 줄)
/ps:a 프롬프트                     # Intercept Mode
/ps:lint 프롬프트                  # LINT Mode
/ps:build 요구사항                 # BUILD Mode
````

> **참고**: 트리플 백틱(```)은 선택사항입니다. 일반 텍스트와 여러 줄 입력을 완전히 지원합니다.

**자연어 (대안)**:

```
prompt-smith 사용 -r 프롬프트 내용
```

### 모드

| 모드      | 슬래시 커맨드          | 자연어                    | 설명                       |
| --------- | ---------------------- | ------------------------- | -------------------------- |
| Review    | `/ps:r <프롬프트>`     | `prompt-smith 사용 -r`    | 개선안 표시 후 승인 대기   |
| Intercept | `/ps:a <프롬프트>`     | `prompt-smith 사용 -a`    | 자동 개선 후 즉시 실행     |
| LINT      | `/ps:lint <프롬프트>`  | `이 프롬프트 점검해줘`    | 기존 프롬프트 진단         |
| BUILD     | `/ps:build <목표>`     | `~하는 프롬프트 만들어줘` | 요구사항에서 프롬프트 설계 |
