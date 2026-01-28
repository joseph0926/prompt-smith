# PromptShield

> **Prompt Quality Gate + PromptOps 표준 패키지**
> Claude Code + MCP 생태계의 프롬프트 품질 관리 표준

## 포지셔닝

이 프로젝트는 **"Prompt improver"가 아닙니다.**

우리의 목표:
- **훅(작성 시점 강제)** + **레지스트리(자산화)** + **테스트(회귀)** + **CI(게이트)**
- 개발 조직이 원하는 "프롬프트 품질 표준"을 제공
- Eval/Red-team은 promptfoo와 **연동**으로 해결

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
├─────────────────────────────────────────────────────────────┤
│  [작성] ──→ [Hook: lint] ──→ [Commit] ──→ [CI: Gate] ──→ [Merge]
│                                              ↓
│                                    [Registry: Save]
│                                              ↓
│                                    [Eval: Regression]
└─────────────────────────────────────────────────────────────┘

핵심 모듈:
├── lint-engine/     # 단일 규칙 엔진 (Hook/CI 공유)
├── registry/        # MCP 서버 (버전/롤백/디프)
├── eval/            # 회귀 테스트 러너
├── pack/            # PromptPack 패키징
└── adapters/        # promptfoo 연동
```

## 개발 원칙

### 1. 결정적 제어 (Deterministic Control)
- Hook과 CI는 **같은 규칙 엔진**을 사용해야 함
- "환경마다 점수가 다름"은 신뢰를 깨뜨림
- 결과는 항상 예측 가능해야 함

### 2. Gate > Report
- "리포트만 남김"은 Gate가 아님
- 품질 기준 미달 시 **빌드 실패** (exit 1)
- 경고만 남기는 기능은 Gate로 인정하지 않음

### 3. 로컬 우선
- 모든 기능은 로컬에서 먼저 동작해야 함
- Claude CLI 기반 실행 지원
- 외부 서비스 의존성 최소화

### 4. 연동 > 구현
- 이미 강력한 도구가 있으면 **연동**
- promptfoo: eval/red-team
- Claude Code: hooks
- 중복 구현 금지

## 코드 컨벤션

### 파일 구조
```
skills/prompt-shield/
├── playbooks/           # 스킬 실행 플레이북
├── scripts/             # CI/실행 스크립트
├── plugins/             # MCP 서버 플러그인
│   └── prompt-registry/ # Registry MCP 서버
└── docs/                # 문서
```

### 스크립트 작성
- CI 스크립트는 **exit code 정책** 명확히
- threshold는 config 파일로 (하드코딩 금지)
- 실패 메시지에 **원인 포함** (파일/점수/기준)

### MCP 서버
- MCP spec 준수: tools/resources/prompts capability
- 에러 메시지 표준화 (isError=true로 self-correct 유도)
- 버전 히스토리 유지 (rollback/diff 지원)

### 테스트
- 결정적 assertion 우선 (contains/regex/json schema)
- LLM judge는 보조적 (나중에)
- 캐시 지원 (동일 입력 재실행 비용 절감)

## 스프린트 참조

현재 로드맵 (8개 스프린트):

| Sprint | 목표 | 핵심 산출물 |
|--------|------|-------------|
| 0 | Foundations | ADR, ROADMAP, ARCHITECTURE |
| 1 | CI Gate v1 | 머지 차단, threshold config |
| 2 | Unified Rule Engine | 단일 lint-engine |
| 3 | Registry v2 | 버전 히스토리/롤백/디프 |
| 4 | PromptPack v0.1 | pack/install |
| 5 | Eval Runner v2 | Claude CLI 실행 |
| 6 | Regression Gate | baseline 비교 |
| 7 | promptfoo Adapter | export/run/ingest |
| 8 | MCP Resources | prompt/eval URI |

상세 계획: `.temp.docs/1_todo.md`

## PR/커밋 가이드

### 커밋 메시지
```
<type>(<area>): <summary>

type: feat/fix/docs/refactor/test/chore
area: ci/lint/registry/eval/pack/mcp/dx
```

### PR 체크리스트
- [ ] lint-engine 변경 시: Hook/CI 양쪽 테스트
- [ ] Registry 변경 시: 마이그레이션 고려
- [ ] config 변경 시: 기본값 동작 확인
- [ ] 문서 업데이트 포함

## 주의사항

### 네이밍 충돌
- "PromptSmith"는 타 제품과 충돌 리스크 있음
- Sprint 0에서 ADR로 결정 예정
- 리브랜딩 범위: repo/npm/cli/mcp server

### 보안 경계
- 로컬 우선: 외부 전송 최소화
- 파일 접근 범위 명시
- 시크릿은 config에 포함 금지

### Exit Code 정책
| Code | 의미 |
|------|------|
| 0 | 품질 기준 충족 (PASS) |
| 1 | 품질 기준 미달 (FAIL) |
| 2 | 설정/실행 오류 |
