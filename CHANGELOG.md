# Changelog

All notable changes to the Prompt Smith skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.1] - 2026-01-03

### Summary
Prompt Smith v2.1.1 improves input parsing for Review/Intercept modes.

### Fixed

#### Multiline Prompt Support
- `/ps:r` and `/ps:a` now accept multiline prompts without requiring triple backticks
- Both formats now work:
  - `/ps:r Write a function` (single line)
  - `/ps:r Write a function\nthat parses JSON` (multiline)
  - `/ps:r ```prompt```` (code block - legacy)

#### Strict Prompt Treatment
- Added CRITICAL rule: Input to `/ps:r` and `/ps:a` is ALWAYS treated as a prompt to improve
- Prevents semantic interpretation (e.g., "fix this bug" → improves the prompt, doesn't fix bugs)
- Ensures consistent LINT → Improve → Execute workflow

### Changed
- `commands/r.md`: Updated parsing logic + added CRITICAL rule
- `commands/a.md`: Updated parsing logic + added CRITICAL rule
- `argument-hint` changed from ` ```<prompt>``` ` to `<prompt text>`

---

## [2.1.0] - 2026-01-02

### Summary
Prompt Smith v2.1.0 adds Intercept Pipeline for real-time prompt improvement and transitions to English Primary with i18n support.

### Added

#### Intercept Pipeline (New)
- **Review Mode**: `/prompt-smith <prompt>` - Show improvements, await user approval, then execute
- **Intercept Mode**: `/prompt-smith --auto <prompt>` - Auto-improve and execute immediately
- Options: `--threshold N` (minimum score improvement), `--verbose` (detailed analysis)

#### i18n Support
- English Primary documentation
- Korean translations in `i18n/ko/`
- Frontmatter i18n metadata

#### New Playbooks
- `playbooks/intercept/review-mode.md`: Review Mode detailed guide
- `playbooks/intercept/intercept-mode.md`: Intercept Mode detailed guide

### Changed
- All documentation translated to English Primary
- Korean versions moved to `i18n/ko/`
- README.md updated with bilingual sections
- SKILL.md frontmatter includes i18n metadata

### Repository Structure
- Migrated from `refs/prompt-smith/` to root
- Added `.github/workflows/lint.yml` for CI validation
- Added `CONTRIBUTING.md`
- Repository renamed to `prompt-smith`

---

## [2.0.0] - 2026-01-01

### Summary
Prompt Smith v2.0.0 메이저 업데이트. 7-Point Quality Check로 확장하고 BUILD Mode 추가.

### Breaking Changes
- 5-Point → 7-Point Quality Check 확장
  - 기존 5개 항목 유지
  - STATE_TRACKING, TOOL_USAGE 2개 항목 추가 (해당 시에만 평가)
- 점수 계산 방식 변경: `(원점수/적용항목×2) × 10`

### Added

#### 7-Point Quality Check
- **STATE_TRACKING**: 장기 태스크 상태 관리 평가
  - 적용 조건: 멀티스텝, 장기 작업, 다수 파일 처리
  - 체크포인트, 재개 방법, 진행률 표시 검증
- **TOOL_USAGE**: 도구 사용 지시 명확성 평가
  - 적용 조건: 파일/명령/API 사용 필요 시
  - 병렬/순차 전략, 에러 처리 검증

#### BUILD Mode (New)
- **7단계 워크플로우**: GATHER → CLASSIFY → DESIGN → DRAFT → SELF-LINT → TEST → DELIVER
- 요구사항 수집부터 프롬프트 설계까지 가이드
- 자체 LINT 검증으로 8점 이상 보장
- 테스트 케이스 5개 자동 생성

#### References
- `claude-4x-best-practices.md`: Claude 4.x 모델 최적화 가이드
  - 명시적 지시, 동기 제공, 예시 일치
  - 상태 관리, 병렬/순차 실행, 구조화된 출력
- `state-tracking-guide.md`: 상태 관리 상세 가이드 (Phase 4)
- `tool-usage-guide.md`: 도구 사용 상세 가이드 (Phase 4)

#### Onboarding (Phase 4)
- `quick-start.md`: 5분 시작 가이드
- `first-lint.md`: 첫 LINT 튜토리얼
- `first-build.md`: 첫 BUILD 튜토리얼

#### Playbooks 구조 개편 (Phase 3)
- `playbooks/lint/`: LINT 관련 파일 분리
- `playbooks/build/`: BUILD 관련 파일
- `playbooks/team/`: 팀 협업 관련 파일

### Changed
- `quality-checklist.md`: 5-Point → 7-Point 확장
- `prompt-template.md`: State Tracking, Tool Usage 섹션 추가
- `diagnostic-report.md`: 7-Point 점수표 반영
- `SKILL.md`: 7-Point + BUILD Mode 전체 업데이트

### Migration Notes
#### From v1.0.0 to v2.0.0
1. **점수 해석**: 기존 5-Point 프롬프트는 동일하게 평가됨 (N/A 항목 제외)
2. **새 항목 적용**: 멀티스텝/도구 사용 프롬프트만 STATE_TRACKING, TOOL_USAGE 평가
3. **BUILD Mode**: 새 프롬프트 작성 시 BUILD 트리거 사용 가능

---

## [1.0.0] - 2026-01-01

### Summary
Prompt Smith v1.0.0 출시. 프롬프트 품질관리를 위한 LINT 모드 제공.

### Added

#### LINT Mode (Core Feature)
- **5-Point Quality Check**: Role/Context/Instruction/Example/Format 기반 프롬프트 평가
- **진단 리포트**: 점수 + Top 3 이슈 + 개선안 + 테스트 케이스 포함
- **안티패턴 탐지**: 10가지 주요 안티패턴 자동 탐지
- **Express Mode**: 빠른 피드백을 위한 간소화된 진단

#### Playbooks
- `lint-mode.md`: LINT 워크플로우 상세 가이드

#### References
- `quality-checklist.md`: 5-Point Quality Check 상세 기준
- `anti-patterns.md`: 10가지 프롬프트 안티패턴 및 개선 방법
- `team-workflow.md`: Prompt PR 룰, 오너 제도, 버전 관리 가이드

#### Templates
- `prompt-template.md`: 5가지 유형별 프롬프트 작성 템플릿
- `test-case-template.md`: 테스트 케이스 작성 템플릿
- `diagnostic-report.md`: 진단 리포트 출력 템플릿

### Security
- 프롬프트 인젝션 방어 패턴 포함
- 인젝션 방어 테스트 케이스 필수화

### Documentation
- Level 1/2/3 Progressive Disclosure 구조
- Trigger Keywords 테이블
- 상세 예시 포함

---

## Roadmap

### [3.0.0] - Planned
- **DEBUG Mode**: Failure analysis + prevention rules
  - Failure classification system
  - Automatic defense rule generation
  - Regression test set enhancement

### [4.0.0] - Planned
- **Multi-platform Support**: Extended platform versions
- **Team Features**: Enhanced team collaboration
- **Prompt Registry**: Centralized prompt asset management

---

## Version Numbering

- **MAJOR**: 새로운 모드 추가 또는 호환성 변경
- **MINOR**: 기능 개선, 템플릿 추가
- **PATCH**: 버그 수정, 문구 개선

---

## Migration Notes

### From v0.x to v1.0.0
해당 없음 (초기 릴리즈)

---

## Contributors
- joseph0926 (maintainer)
