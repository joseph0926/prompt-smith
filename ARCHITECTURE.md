# Architecture

> prompt-shield의 아키텍처 문서입니다.
> 코어 모듈, 데이터 흐름, 보안 경계를 설명합니다.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [작성] ───→ [Hook: lint] ───→ [Commit] ───→ [CI: Gate] ───→ [Merge]   │
│      │              │                              │                     │
│      │              │                              │                     │
│      │              ▼                              ▼                     │
│      │       ┌──────────────┐              ┌──────────────┐             │
│      │       │ Lint Engine  │              │ Lint Engine  │             │
│      │       │  (shared)    │              │  (shared)    │             │
│      │       └──────────────┘              └──────────────┘             │
│      │                                            │                     │
│      │                                            ▼                     │
│      │                                    ┌──────────────┐             │
│      │                                    │   Registry   │◄────────────┤
│      │                                    │  (MCP Server)│             │
│      │                                    └──────────────┘             │
│      │                                            │                     │
│      ▼                                            ▼                     │
│  ┌────────┐                               ┌──────────────┐             │
│  │ Skill  │                               │  PromptPack  │             │
│  │Commands│                               │   (export)   │             │
│  └────────┘                               └──────────────┘             │
│                                                   │                     │
│                                                   ▼                     │
│                                           ┌──────────────┐             │
│                                           │  Eval Runner │             │
│                                           └──────────────┘             │
│                                                   │                     │
│                                                   ▼                     │
│                                           ┌──────────────┐             │
│                                           │  promptfoo   │             │
│                                           │  (adapter)   │             │
│                                           └──────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Lint Engine

**위치**: `lib/lint-engine/` (Sprint 2에서 구현 예정)

**역할**: 프롬프트 품질 평가의 단일 진실의 원천 (Single Source of Truth)

**현재 상태** (v3.4.0):
- 분산됨: `scripts/ci-lint.sh` (Bash, grep 기반), Skill 내장 로직 (마크다운 기반)
- CI Gate: `ci-lint.sh` + `.github/workflows/prompt-quality.yml`
- 통합 계획: Sprint 2에서 단일 모듈로 통합 예정

```
Input                Output
─────────────────────────────────────────
prompt: string       score: number (0-10)
config: Config   →   findings: Finding[]
                     suggestions: string[]
```

**Finding 구조**:
```typescript
interface Finding {
  rule: string;        // e.g., "missing-role", "weak-context"
  severity: "error" | "warn" | "info";
  message: string;
  line?: number;
}
```

**8-Point Quality Check 규칙**:
| Dimension | Weight | Applies When |
|-----------|--------|--------------|
| ROLE | 2 | Always |
| CONTEXT | 2 | Always |
| INSTRUCTION | 2 | Always |
| EXAMPLE | 2 | Always |
| FORMAT | 2 | Always |
| SUCCESS_CRITERIA | 2 | Always |
| STATE_TRACKING | 2 | Multi-step tasks |
| TOOL_USAGE | 2 | Tool-using prompts |

---

### 2. Skill Commands

**위치**: `commands/`, `skills/prompt-shield/`

**역할**: 사용자 인터페이스 (CLI slash commands)

| Command | Mode | Flow |
|---------|------|------|
| `/ps:lint` | LINT | Input → Lint Engine → Diagnostic Report |
| `/ps:r` | Review | Input → Express LINT → Improve → Approve → Execute |
| `/ps:a` | Intercept | Input → Express LINT → Improve → Auto-Execute |
| `/ps:build` | BUILD | Requirements → GATHER → CLASSIFY → DESIGN → DRAFT → LINT → TEST |
| `/ps:eval` | Eval | Dataset → Eval Runner → Report |

---

### 3. Hooks

**위치**: `hooks/`

**역할**: 작성 시점에서 품질 정책 강제

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ UserPromptSubmit│ ──→ │ Lint Engine  │ ──→ │ warn/block  │
│     Hook        │     │              │     │  decision   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

**정책 설정**: `hooks/policy.json`
```json
{
  "userPromptSubmit": {
    "action": "warn",     // "warn" | "block"
    "minScore": 6
  }
}
```

---

### 4. CI Gate

**위치**: `scripts/ci-lint.sh`, `.github/workflows/`

**역할**: 머지 시점에서 품질 정책 강제

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  PR opened  │ ──→ │ Lint Engine  │ ──→ │  exit 0/1   │
│             │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PR Summary  │
                    │  (failures)  │
                    └──────────────┘
```

**설정**: `ps.config.json` (Sprint 1에서 구현 예정)
```json
{
  "ci": {
    "minScoreCI": 6,
    "minScoreWarn": 4,
    "includeGlobs": ["commands/**/*.md", "skills/**/*.md"],
    "excludeGlobs": ["**/node_modules/**"]
  }
}
```

**Exit Codes**:
| Code | Meaning |
|------|---------|
| 0 | 품질 기준 충족 (PASS) |
| 1 | 품질 기준 미달 (FAIL) |
| 2 | 설정/실행 오류 |

---

### 5. Registry (MCP Server)

**위치**: `servers/prompt-registry.js`

**역할**: 프롬프트 자산의 저장/검색/버전 관리

**현재 기능** (v1.2.0):
- `prompt_save`: 저장 (버전 자동 증가, 단일 content 덮어쓰기)
- `prompt_get`: 조회 (latest만)
- `prompt_list`: 목록
- `prompt_search`: 검색
- `prompt_delete`: 삭제
- **MCP Prompts**: 저장된 프롬프트를 slash command로 노출 (`prompts/list`, `prompts/get`)
- **알림**: `notifications/prompts/list_changed` 이벤트 발송

**제한사항** (v1.2.0):
- 버전 히스토리 미지원 (단일 content만 저장)
- rollback/diff 불가

**계획된 기능** (Sprint 3):
- `prompt_get(version)`: 특정 버전 조회
- `prompt_versions`: 버전 목록
- `prompt_diff`: 버전 간 비교
- `prompt_rollback`: 롤백
- 데이터 스키마 v2: `versions[]` 스냅샷 저장

**데이터 흐름**:
```
Save Request
     │
     ▼
┌────────────────┐
│ prompts.json   │  ← 현재: 단일 content
│ (local file)   │  ← 계획: versions[] 스냅샷
└────────────────┘
     │
     ▼
MCP prompts/list_changed notification
```

---

### 6. Eval Runner

**위치**: `scripts/eval-runner.js`

**역할**: 프롬프트 품질의 회귀 테스트

**모듈 구조**:
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ DatasetLoader│ ──→ │ PromptExecutor│ ──→ │   Scorer    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ReportGenerator│
                                          └──────────────┘
```

**현재 상태** (v3.4.0):
- `--provider dry-run`: ✅ 구현됨 (기본값)
- `--provider claude-cli`: ❌ 미구현 (Sprint 5 계획)
- `--baseline`: ❌ 미구현 (Sprint 6 계획)
- `--llm-eval`: 옵션으로 모델 기반 평가 가능 (외부 API 호출)

**Assertions** (Sprint 5 계획):
- `contains`: 문자열 포함 여부
- `regex`: 정규식 매칭
- `json-schema`: JSON 스키마 검증

---

### 7. PromptPack

**위치**: 미구현 (Sprint 4)

**역할**: 프롬프트 배포 단위

**계획된 구조**:
```
my-prompts/
├── promptpack.json    # 메타데이터
├── prompts/           # 프롬프트 파일들
│   ├── code-review.md
│   └── bug-fix.md
├── datasets/          # (optional) 테스트 데이터
└── policy.json        # (optional) 품질 정책
```

**워크플로우**:
```
ps pack → PromptPack artifact → ps install → Registry
```

---

### 8. promptfoo Adapter

**위치**: 미구현 (Sprint 7)

**역할**: promptfoo와의 연동 허브

**데이터 흐름**:
```
PromptPack
    │
    ▼
ps export promptfoo
    │
    ▼
promptfoo.yaml
    │
    ▼
promptfoo eval
    │
    ▼
results.json
    │
    ▼
ps ingest promptfoo-results
    │
    ▼
Registry (summary stored)
```

---

## Data Flow Diagrams

### Flow 1: Development-time Quality Check

```
Developer                    Claude Code                  prompt-shield
    │                            │                            │
    │  writes prompt             │                            │
    │ ─────────────────────────→ │                            │
    │                            │  Hook: UserPromptSubmit    │
    │                            │ ──────────────────────────→│
    │                            │                            │
    │                            │  Express LINT              │
    │                            │ ←──────────────────────────│
    │                            │                            │
    │  sees score/suggestion     │                            │
    │ ←───────────────────────── │                            │
    │                            │                            │
```

### Flow 2: CI Quality Gate

```
Developer                    GitHub                     prompt-shield CI
    │                            │                            │
    │  push / PR                 │                            │
    │ ─────────────────────────→ │                            │
    │                            │  workflow trigger          │
    │                            │ ──────────────────────────→│
    │                            │                            │
    │                            │  ci-lint.sh                │
    │                            │                            │
    │                            │  ← exit 0 (pass)           │
    │                            │  ← exit 1 (fail)           │
    │                            │ ←──────────────────────────│
    │                            │                            │
    │  PR check result           │                            │
    │ ←───────────────────────── │                            │
    │                            │                            │
```

### Flow 3: Prompt Registry Lifecycle

```
Developer                    Claude Code                  Registry MCP
    │                            │                            │
    │  /ps:build requirement     │                            │
    │ ─────────────────────────→ │                            │
    │                            │                            │
    │  ← generated prompt        │                            │
    │ ←───────────────────────── │                            │
    │                            │                            │
    │  "save this"               │                            │
    │ ─────────────────────────→ │                            │
    │                            │  prompt_save               │
    │                            │ ──────────────────────────→│
    │                            │                            │
    │                            │  ← success, version=1      │
    │                            │ ←──────────────────────────│
    │                            │                            │
    │  (later) use saved prompt  │                            │
    │ ─────────────────────────→ │                            │
    │                            │  /mcp__prompt-registry__X  │
    │                            │ ──────────────────────────→│
    │                            │                            │
    │                            │  ← prompt content          │
    │                            │ ←──────────────────────────│
    │                            │                            │
```

---

## Security Boundaries

### Local-First Design

prompt-shield는 **로컬 우선** 설계를 따릅니다:

1. **데이터 저장**: 모든 데이터는 로컬 파일 시스템에 저장
   - Registry: `data/prompts.json`
   - Eval results: 로컬 파일

2. **네트워크 접근**: 기본적으로 외부 네트워크 접근 없음
   - `--llm-eval` 옵션 사용 시에만 Claude API 호출
   - promptfoo 연동은 사용자가 명시적으로 실행

3. **파일 접근 범위**:
   ```
   Read:  commands/, skills/, agents/ (lint 대상)
   Write: data/ (registry)
         /tmp/ (임시 파일)
   ```

### Input Handling

모든 Skill 명령(`/ps:*`)은 입력을 **프롬프트 텍스트**로 취급합니다:
- 파일 경로가 포함되어도 실제 파일을 읽지 않음
- 실행 명령이 포함되어도 실행하지 않음
- 자세한 규칙: [input-handling-rules.md](skills/prompt-shield/references/input-handling-rules.md)

### Hook Blocking

Hook에서 품질 미달 프롬프트를 차단하려면:

1. `hooks/policy.json`에서 `"action": "block"` 설정
2. Hook이 `{ "decision": "block", "reason": "..." }` 반환
3. Claude Code가 프롬프트 제출을 중단

**주의**: 차단은 사용자 경험에 영향을 주므로 신중하게 사용

---

## Extension Points

### Adding New Lint Rules

1. `lib/lint-engine/rules/` 에 규칙 파일 추가 (Sprint 2 이후)
2. 규칙 구조:
   ```typescript
   interface Rule {
     id: string;
     severity: "error" | "warn" | "info";
     check(prompt: string, config: Config): Finding | null;
   }
   ```

### Adding New Providers (Eval Runner)

1. `scripts/eval-runner.js`의 `executeTestCase` 함수 확장
2. Provider 인터페이스:
   ```typescript
   interface Provider {
     name: string;
     execute(prompt: string, input: any): Promise<any>;
   }
   ```

### Adding New MCP Tools

1. `servers/prompt-registry.js`의 `toolDefinitions()` 확장
2. `handleToolCall()` 에 케이스 추가
3. MCP spec 준수: `isError=true`로 에러 반환

---

## Related Documents

- [ROADMAP.md](ROADMAP.md) - 개발 로드맵
- [CONTRIBUTING.md](CONTRIBUTING.md) - 기여 가이드
- [docs/adr/](docs/adr/) - Architecture Decision Records
