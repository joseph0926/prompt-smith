# Roadmap

> prompt-shield의 개발 로드맵입니다.
> 이 문서는 프로젝트의 방향과 우선순위를 보여주며, 상황에 따라 조정될 수 있습니다.

## Vision

**"Claude Code + MCP 생태계의 Prompt Quality Gate 표준"**

- Hook(작성 시점) + CI(머지 시점)에서 프롬프트 품질 정책을 **결정적으로 강제**
- MCP 서버로 **프롬프트 자산을 저장/검색/배포**
- Eval/Red-team은 promptfoo 등과 **연동 우선**

## Non-Goals

다음은 prompt-shield의 목표가 **아닙니다**:

- 올인원 LLMOps 플랫폼
- Observability/모니터링 솔루션
- 다중 모델 지원 (Claude Code 생태계 집중)
- SaaS/호스팅 서비스

## Sprint Overview

| Sprint | Goal | Key Deliverable | Status |
|--------|------|-----------------|--------|
| 0 | Foundations | ADR, ROADMAP, ARCHITECTURE | **Done** |
| 1 | CI Gate v1 | 품질 미달 PR 머지 차단 | **In Progress** |
| 2 | Unified Rule Engine | Hook/CI 단일 규칙 엔진 | Planned |
| 3 | Registry v2 | 버전 히스토리/롤백/디프 | Planned |
| 4 | PromptPack v0.1 | pack/install 배포 단위 | Planned |
| 5 | Eval Runner v2 | Claude CLI 실행 기반 평가 | Planned |
| 6 | Regression Gate | baseline 비교 + PR 차단 | Planned |
| 7 | promptfoo Adapter | export/run/ingest 연동 | Planned |
| 8 | MCP Resources | prompt/eval/policy URI 제공 | Planned |

---

## Sprint Details

### Sprint 0 — Foundations

**Goal**: 표준 도구로 확장하기 전, 브랜딩/문서/버전 싱크를 고정

**Deliverables**:
- [x] ADR-001: Naming/Brand Decision
- [x] ROADMAP.md (this document)
- [x] ARCHITECTURE.md
- [x] Version sync 범위 확장 (README 포함)
- [ ] GitHub Issue Templates (optional)

**Acceptance Criteria**:
- 버전 파일/플러그인 메타/README가 1개 커맨드로 동기화됨
- 신규 기여자가 ROADMAP/ARCHITECTURE만 읽고 방향을 이해함

---

### Sprint 1 — CI Gate v1

**Goal**: 품질 미달이면 CI가 실패해서 PR 머지가 막히게 함

**Deliverables**:
- [x] `ps.config.json` (threshold/paths 설정)
- [x] `ci-lint.sh` exit code 정책 (threshold 미달 → exit 1)
- [x] GitHub Actions 요약 개선 (실패 원인 표시)
- [x] 로컬 재현 문서 (`docs/ci-gate-guide.md`)

**Acceptance Criteria**:
- 의도적으로 품질 낮은 prompt를 커밋하면 PR job이 FAIL
- threshold는 설정 파일로 조정 가능
- 실패 원인이 PR 요약에 표시됨

---

### Sprint 2 — Unified Rule Engine

**Goal**: Hook과 CI가 같은 룰/점수 엔진을 사용

**Deliverables**:
- `lint-engine` 모듈 (단일 진실의 원천)
- CI/Hook 래퍼화
- 룰 authoring 문서

**Acceptance Criteria**:
- 동일 입력에 대해 Hook/CI 결과가 일치
- 룰 변경이 한 곳에서만 필요

---

### Sprint 3 — Registry v2

**Goal**: Registry가 버전 히스토리/롤백/디프를 지원

**Deliverables**:
- 데이터 스키마 v2 + 마이그레이션
- MCP tools: `prompt_get(version)`, `prompt_versions`
- MCP tools: `prompt_diff`, `prompt_rollback`

**Acceptance Criteria**:
- 저장을 반복하면 버전 스냅샷이 남음
- 특정 버전 조회/롤백/디프가 가능

---

### Sprint 4 — PromptPack v0.1

**Goal**: 프롬프트를 패키지로 배포/설치 가능하게 함

**Deliverables**:
- PromptPack spec v0.1 + JSON Schema
- `ps pack` (폴더 → artifact)
- `ps install` (artifact → registry)
- 샘플 pack + 문서

**Acceptance Criteria**:
- 샘플 폴더를 pack하면 PromptPack 산출물 생성
- install 후 registry에서 prompt 조회 가능

---

### Sprint 5 — Eval Runner v2

**Goal**: dry-run 스텁이 아닌 실제 모델 출력 기반 평가

**Deliverables**:
- Executor interface + `provider=claude-cli`
- Minimal assertions (contains/regex/json schema)
- Result caching (hash 기반)
- Report UX 개선

**Acceptance Criteria**:
- 최소 1개 테스트가 실제 실행으로 결과를 남김
- 동일 케이스 재실행 시 캐시 히트 확인

---

### Sprint 6 — Regression Gate

**Goal**: baseline 대비 회귀 시 PR 차단

**Deliverables**:
- eval 결과 저장 포맷 (artifact)
- baseline comparator
- GitHub Actions: changed prompts만 eval + 요약
- regression policy 문서

**Acceptance Criteria**:
- baseline보다 나빠지면 FAIL (exit 1)
- 변경 없는 PR은 eval 스킵

---

### Sprint 7 — promptfoo Adapter

**Goal**: 고급 eval/레드팀은 promptfoo로, prompt-shield는 연동 허브

**Deliverables**:
- `ps export promptfoo` (PromptPack → promptfoo config)
- `ps run promptfoo` (optional wrapper)
- `ps ingest promptfoo-results`
- redteam starter templates

**Acceptance Criteria**:
- export된 설정으로 promptfoo 실행 가능
- ingest 후 registry에서 결과 요약 조회 가능

---

### Sprint 8 — MCP Resources

**Goal**: MCP server가 resources로 프롬프트/리포트/정책을 URI로 제공

**Deliverables**:
- `resources/list`, `resources/read` 구현
- `resource://prompt/<name>@<version>`
- `resource://eval/<evalId>`
- 클라이언트 사용 문서

**Acceptance Criteria**:
- MCP 클라이언트에서 list/read 정상 동작
- 다른 에이전트가 프롬프트를 컨텍스트로 참조 가능

---

## Release Policy

- **Versioning**: [Semantic Versioning](https://semver.org/)
  - MAJOR: 새로운 모드 추가 또는 호환성 변경
  - MINOR: 기능 개선, 템플릿 추가
  - PATCH: 버그 수정, 문구 개선

- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

- **Tags**: GitHub releases와 동기화

## Contributing

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

Sprint 작업에 참여하고 싶다면:
1. 해당 Sprint의 이슈를 확인
2. 작업할 이슈에 코멘트 남기기
3. PR 제출 시 관련 이슈 번호 참조
