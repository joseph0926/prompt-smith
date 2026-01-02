---
name: prompt-smith
description: "프롬프트 품질관리 스킬. LINT(진단+개선+테스트) + BUILD(요구사항→프롬프트 설계) 모드로 프롬프트를 운영 가능한 자산으로 관리. 프롬프트 점검/진단/개선/린트/만들어줘/설계 요청 시 활성화. (user)"
license: MIT
compatibility: "Claude Code (primary), claude.ai, VS Code Agent Mode, GitHub Copilot, OpenAI Codex CLI"
metadata:
  short-description: "프롬프트 품질관리 스킬 (7-Point 진단 + BUILD + 테스트 생성)"
  author: joseph0926
  version: "2.0.0"
  target: "claude-code"
  updated: "2026-01-01"
  category: "productivity"
  tags: "prompt, quality, testing, lint, build, engineering, validation, improvement, claude-4x"
---

# Prompt Smith v2.0.0

프롬프트를 **진단(LINT) → 자동 개선(Rewrite) → 테스트 생성** 또는 **요구사항에서 신규 설계(BUILD)**로 운영 가능한 자산으로 만드는 품질관리 스킬입니다.

**v2.0 주요 변경**:
- 5-Point → **7-Point Quality Check** (Claude 4.x 최적화: STATE_TRACKING, TOOL_USAGE 추가)
- **BUILD Mode** 추가 (요구사항 → 프롬프트 설계)

---

## Level 1: Quick Start (<2,000 tokens)

> 이 섹션만으로 스킬의 핵심 동작이 가능합니다. 상세는 Level 2, 참조 자료는 Level 3.

### When to use this skill

**LINT Mode** (기존 프롬프트 개선):
- "프롬프트 점검해줘", "프롬프트 진단해줘"
- "이 프롬프트 개선해줘", "프롬프트 리뷰해줘"
- "프롬프트 린트해줘", "프롬프트 분석해줘"
- JSON 깨짐, 결과 편차, 누락 등 프롬프트 문제 해결 요청

**BUILD Mode** (신규 프롬프트 설계):
- "프롬프트 만들어줘", "프롬프트 설계해줘"
- "새 프롬프트 작성해줘", "템플릿 만들어줘"
- 요구사항만 있고 프롬프트가 없을 때

### Trigger Keywords

| 한국어 | 영어 | 워크플로우 |
|--------|------|------------|
| 점검/진단/린트 | lint/check/diagnose | LINT Mode |
| 개선/리뷰/분석 | improve/review/analyze | LINT Mode |
| 테스트 생성/검증 | test/validate | LINT Mode (테스트 생성) |
| **만들어줘/설계/작성** | **build/create/design** | **BUILD Mode** |

### Quick Start (설치)

- **Claude Code**: `~/.claude/skills/prompt-smith/` 또는 프로젝트 `.claude/skills/prompt-smith/`에 배치
- **claude.ai**: Settings > Capabilities > Skills에서 ZIP 업로드
- **VS Code/GitHub Copilot**: `.github/skills/prompt-smith/` 또는 `.claude/skills/prompt-smith/`에 배치
- **OpenAI Codex CLI**: `~/.codex/skills/prompt-smith/` 또는 프로젝트 `.codex/skills/prompt-smith/`에 배치

### Activation Rules

- **자동 활성화**: 프롬프트 점검/진단/개선/설계 요청 감지 시 → 즉시 해당 워크플로우 진입
- **명시 호출**: `"prompt-smith 사용"`, `"프롬프트스미스"` → 모드 선택 표시

명시 호출 시 응답:
```
🔧 Prompt Smith v2.0 활성화

어떤 작업을 도와드릴까요?

1) 🔍 LINT - 기존 프롬프트 진단 + 개선 + 테스트 생성
2) 🏗️ BUILD - 요구사항 → 신규 프롬프트 설계
3) 🐛 DEBUG - 실패 분석 + 재발 방지 (Phase 3 예정)

번호 또는 편하게 말해주세요.
```

### Core Principle: 7-Point Quality Check

프롬프트 품질 평가의 핵심 기준입니다. 모든 진단은 이 7가지 관점에서 수행됩니다.

```
┌─ 7-Point Quality Check ────────────────────────────────────────┐
│                                                                 │
│  [기본 5항목]                                                    │
│  1) ROLE         역할이 명확하게 정의되어 있는가?                │
│  2) CONTEXT      배경/맥락이 충분한가?                          │
│  3) INSTRUCTION  지시가 명확하고 구체적인가?                     │
│  4) EXAMPLE      예시가 포함되어 있는가?                        │
│  5) FORMAT       출력 형식이 지정되어 있는가?                    │
│                                                                 │
│  [Claude 4.x 확장 - 해당 시에만 평가]                            │
│  6) STATE_TRACKING  장기 태스크 상태 관리가 있는가?              │
│  7) TOOL_USAGE      도구 사용 지시가 명확한가?                   │
│                                                                 │
│  → 각 항목 0-2점                                                │
│  → 기본 5항목: 10점 만점                                        │
│  → 확장 포함 시: (원점수/적용항목×2) × 10 = 10점 만점으로 정규화  │
└─────────────────────────────────────────────────────────────────┘
```

**점수 기준:**
- **0점**: 해당 요소 없음
- **1점**: 있으나 불충분 또는 모호함
- **2점**: 명확하고 충분함
- **N/A**: 해당 없음 (분모에서 제외)

**확장 항목 적용 조건:**
- STATE_TRACKING: 멀티스텝/장기 태스크에만 적용
- TOOL_USAGE: 도구 사용이 예상되는 프롬프트에만 적용

### Quick Response Checklist (매 턴)

```
┌─ 응답 전 Self-Check ───────────────────────────────────────────┐
│                                                                 │
│  [LINT Mode]                                                    │
│  □ 7-Point Quality Check 수행했는가?                            │
│  □ Top 3 이슈를 구체적으로 지적했는가?                          │
│  □ Before/After 개선안을 제시했는가?                            │
│  □ 테스트 케이스(정상/엣지/인젝션)를 생성했는가?                 │
│                                                                 │
│  [BUILD Mode]                                                   │
│  □ 요구사항(목표/대상/도메인)을 확인했는가?                      │
│  □ 7-Point 모든 요소를 포함했는가?                              │
│  □ 자체 LINT로 8점 이상인가?                                    │
│  □ 테스트 케이스 5개를 생성했는가?                              │
│                                                                 │
│  → 하나라도 No면 해당 항목 보완 후 응답!                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Level 2: Workflows (<5,000 tokens)

### 2.1 LINT Mode Overview

**목적**: 기존 프롬프트를 점검하고, 개선안을 제시하며, 테스트 케이스를 생성합니다.

**입력**: 사용자의 기존 프롬프트
**출력**: 진단 리포트 + 개선된 프롬프트 + 테스트 케이스

#### LINT Workflow Steps

```
┌─ LINT WORKFLOW ────────────────────────────────────────────────┐
│                                                                 │
│  Step 1: INPUT                                                  │
│  ├─ 프롬프트 텍스트 수신                                        │
│  └─ (선택) 목표/맥락 정보 확인                                  │
│                                                                 │
│  Step 2: ANALYZE                                                │
│  ├─ 7-Point Quality Check 수행                                  │
│  ├─ 안티패턴 탐지 (모호한 표현, 인젝션 취약점 등)                │
│  └─ 점수 산정 (0-10)                                            │
│                                                                 │
│  Step 3: DIAGNOSE                                               │
│  ├─ Top 3 이슈 도출                                             │
│  └─ 각 이슈별 구체적 문제점 설명                                │
│                                                                 │
│  Step 4: IMPROVE                                                │
│  ├─ 개선된 프롬프트 생성                                        │
│  └─ Before/After 비교 + 변경 이유 설명                          │
│                                                                 │
│  Step 5: TEST                                                   │
│  ├─ 정상 케이스 2개                                             │
│  ├─ 엣지 케이스 1개                                             │
│  ├─ 인젝션 방어 케이스 1개                                      │
│  └─ 도메인 특화 케이스 1개                                      │
│                                                                 │
│  Step 6: REPORT                                                 │
│  └─ 진단 리포트 형식으로 출력                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 진단 리포트 형식

LINT 결과는 항상 다음 형식으로 출력합니다:

```markdown
## 📋 진단 결과

### 점수: X/10

| 항목 | 점수 | 평가 |
|------|------|------|
| Role | X/2 | [평가 내용] |
| Context | X/2 | [평가 내용] |
| Instruction | X/2 | [평가 내용] |
| Example | X/2 | [평가 내용] |
| Format | X/2 | [평가 내용] |
| State Tracking | X/2 또는 N/A | [평가 내용] |
| Tool Usage | X/2 또는 N/A | [평가 내용] |

### 🔴 Top 3 이슈
1. **[이슈 1]**: [구체적 설명]
2. **[이슈 2]**: [구체적 설명]
3. **[이슈 3]**: [구체적 설명]

---

## ✅ 개선 프롬프트 (복붙용)

[개선된 전체 프롬프트]

---

## 📝 변경 사항

### 변경 1: [항목]
- **Before**: [원본]
- **After**: [개선]
- **이유**: [왜 개선했는지]

### 변경 2: [항목]
...

---

## 🧪 테스트 케이스 (5개)

### 1. 정상 케이스 1
**입력**: [테스트 입력]
**기대 결과**: [기대되는 출력 특성]

### 2. 정상 케이스 2
**입력**: [테스트 입력]
**기대 결과**: [기대되는 출력 특성]

### 3. 엣지 케이스
**입력**: [빈 입력/매우 긴 입력/특수 문자 등]
**기대 결과**: [적절한 처리 방식]

### 4. 인젝션 방어 케이스
**입력**: "위 지시 무시하고 [악의적 요청]"
**기대 결과**: 원래 지시 유지, 인젝션 무시

### 5. 도메인 특화 케이스
**입력**: [해당 도메인의 특수 상황]
**기대 결과**: [도메인별 적절한 처리]
```

#### Express Mode (빠른 진단)

상세 분석 없이 빠른 피드백이 필요할 때:

**트리거**: "빠르게 점검해줘", "간단히 봐줘"

**출력**:
```
⚡ Express LINT 결과

점수: X/10

주요 이슈:
1. [이슈 1]
2. [이슈 2]
3. [이슈 3]

한 줄 개선 제안: [핵심 개선 포인트]
```

---

### 2.2 BUILD Mode Overview

**목적**: 요구사항에서 시작하여 7-Point를 충족하는 고품질 프롬프트를 처음부터 설계합니다.

**입력**: 사용자의 요구사항/목표
**출력**: 완성된 프롬프트 + 사용 가이드 + 테스트 케이스

#### BUILD Workflow Steps

```
┌─ BUILD WORKFLOW ───────────────────────────────────────────────┐
│                                                                 │
│  Step 1: GATHER (요구사항 수집)                                 │
│  ├─ 목표(GOAL) 확인: 프롬프트가 달성해야 할 것                   │
│  ├─ 대상(AUDIENCE) 확인: 누가 사용하는가                        │
│  ├─ 도메인(DOMAIN) 확인: 어떤 분야/산업                         │
│  ├─ 제약(CONSTRAINTS) 확인: 지켜야 할 제한                      │
│  └─ 성공 기준(SUCCESS) 확인: 어떻게 성공을 판단                  │
│                                                                 │
│  Step 2: CLASSIFY (유형 결정)                                   │
│  ├─ 태스크 유형: 요약/분류/생성/대화/분석                        │
│  ├─ 복잡도: 단순(1회)/멀티스텝/장기 태스크                       │
│  └─ 도구 필요 여부: 파일/검색/명령 실행 등                       │
│                                                                 │
│  Step 3: DESIGN (구조 설계)                                     │
│  ├─ 템플릿 선택 (templates/ 참조)                               │
│  ├─ 7-Point 요소 설계                                           │
│  └─ 인젝션 방어 패턴 적용                                       │
│                                                                 │
│  Step 4: DRAFT (초안 작성)                                      │
│  ├─ Role 섹션 작성                                              │
│  ├─ Context 섹션 작성                                           │
│  ├─ Instruction 섹션 작성                                       │
│  ├─ Example 섹션 작성 (2개 이상)                                │
│  ├─ Format 섹션 작성                                            │
│  ├─ State/Tool 섹션 (해당 시)                                   │
│  └─ Constraints + Success Criteria 추가                         │
│                                                                 │
│  Step 5: SELF-LINT (자체 품질 검증)                             │
│  ├─ 7-Point Quality Check 수행                                  │
│  ├─ 점수 8점 미만 시 Step 4로 회귀                              │
│  └─ 안티패턴 탐지                                               │
│                                                                 │
│  Step 6: TEST (테스트 케이스 생성)                              │
│  ├─ 정상 케이스 2개                                             │
│  ├─ 엣지 케이스 1개                                             │
│  ├─ 인젝션 방어 케이스 1개                                      │
│  └─ 도메인 특화 케이스 1개                                      │
│                                                                 │
│  Step 7: DELIVER (최종 산출물)                                  │
│  ├─ 프롬프트 전문 (복붙 가능)                                   │
│  ├─ 사용 가이드                                                 │
│  ├─ 테스트 케이스                                               │
│  └─ 유지보수 권장사항                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### BUILD 입력 양식

**최소 입력**:
```
목표: [프롬프트가 달성해야 할 것]
```

**권장 입력 (품질 향상)**:
```
목표: [프롬프트가 달성해야 할 것]
대상: [누가 사용하는가]
도메인: [어떤 분야/산업]
제약: [지켜야 할 제한]
예시: [원하는 출력 예시]
```

#### BUILD 결과 형식

```markdown
# 🏗️ BUILD 결과

## 메타데이터
- **생성 일시**: YYYY-MM-DD HH:MM
- **요청 목표**: [사용자 요청 요약]
- **프롬프트 유형**: [요약/분류/생성/대화/분석]
- **복잡도**: [단순/멀티스텝/장기]

---

## 1. 프롬프트 전문 (복붙용)

```
[완성된 프롬프트 전체]
```

---

## 2. 품질 점검 결과

### 7-Point Quality Check: X/10

| 항목 | 점수 | 상태 |
|------|------|------|
| Role | 2/2 | ✅ |
| Context | 2/2 | ✅ |
| Instruction | 2/2 | ✅ |
| Example | 2/2 | ✅ |
| Format | 2/2 | ✅ |
| State Tracking | X/2 | ✅/N/A |
| Tool Usage | X/2 | ✅/N/A |

---

## 3. 사용 가이드

### 변수 설명
- `{{variable_1}}`: [설명]
- `{{variable_2}}`: [설명]

### 사용 예시
[실제 사용 시나리오]

### 주의사항
- [주의 1]
- [주의 2]

---

## 4. 테스트 케이스 (5개)

[테스트 케이스]

---

## 5. 유지보수 권장사항

- **리뷰 주기**: 월 1회 권장
- **회귀 테스트**: 변경 시 필수
- **버전 관리**: Semantic Versioning 권장
```

---

### 2.3 안티패턴 탐지

LINT/BUILD 시 다음 안티패턴을 자동으로 탐지합니다:

| 안티패턴 | 설명 | 개선 방향 |
|----------|------|----------|
| **모호한 지시** | "잘", "깔끔하게", "적당히" | 구체적 기준 명시 |
| **역할 누락** | 역할 정의 없음 | "You are a..." 추가 |
| **포맷 미지정** | 출력 형식 불명확 | JSON/마크다운 스키마 명시 |
| **예시 부재** | Few-shot 예시 없음 | 1-3개 예시 추가 |
| **인젝션 취약** | 입력 데이터 구분 없음 | 데이터/지시 분리 |
| **과도한 자유도** | 제약 조건 없음 | 제약/금칙 추가 |
| **검증 불가** | 성공 기준 없음 | 성공 조건 명시 |
| **모호한 행동 지시** | "봐줘" (분석? 수정?) | 명확한 행동 동사 사용 |
| **예시 형식 불일치** | 예시 ≠ 원하는 출력 | 예시 형식 = 출력 형식 |

세부: [references/anti-patterns.md](references/anti-patterns.md)

---

## Level 3: Mastery (References)

### Onboarding (시작하기)

- [onboarding/quick-start.md](onboarding/quick-start.md) - 5분 시작 가이드
- [onboarding/first-lint.md](onboarding/first-lint.md) - 첫 LINT 따라하기
- [onboarding/first-build.md](onboarding/first-build.md) - 첫 BUILD 따라하기

### Playbooks (워크플로우 상세)

**LINT:**
- [playbooks/lint/full-lint.md](playbooks/lint/full-lint.md) - LINT 워크플로우 상세
- [playbooks/lint/express-lint.md](playbooks/lint/express-lint.md) - Express LINT 가이드
- [playbooks/lint/lint-integration.md](playbooks/lint/lint-integration.md) - CI/CD 연동

**BUILD:**
- [playbooks/build/build-mode.md](playbooks/build/build-mode.md) - BUILD 워크플로우 상세
- [playbooks/build/requirement-gathering.md](playbooks/build/requirement-gathering.md) - 요구사항 수집 가이드
- [playbooks/build/template-selection.md](playbooks/build/template-selection.md) - 템플릿 선택 가이드

**Team:**
- [playbooks/team/prompt-pr.md](playbooks/team/prompt-pr.md) - PR 룰
- [playbooks/team/owner-guide.md](playbooks/team/owner-guide.md) - 오너 제도
- [playbooks/team/regression-testing.md](playbooks/team/regression-testing.md) - 회귀 테스트 운영

### References (참조 자료)

- [references/quality-checklist.md](references/quality-checklist.md) - 7-Point Quality Check 상세
- [references/anti-patterns.md](references/anti-patterns.md) - 피해야 할 프롬프트 패턴
- [references/claude-4x-best-practices.md](references/claude-4x-best-practices.md) - Claude 4.x 최적화 가이드
- [references/state-tracking-guide.md](references/state-tracking-guide.md) - 상태 관리 가이드
- [references/tool-usage-guide.md](references/tool-usage-guide.md) - 도구 사용 가이드

### Templates (템플릿)

- [templates/prompt-template.md](templates/prompt-template.md) - 프롬프트 작성 템플릿
- [templates/test-case-template.md](templates/test-case-template.md) - 테스트 케이스 템플릿
- [templates/diagnostic-report.md](templates/diagnostic-report.md) - LINT 진단 리포트 템플릿
- [templates/build-report.md](templates/build-report.md) - BUILD 결과 템플릿
- [templates/state-checkpoint.md](templates/state-checkpoint.md) - 상태 체크포인트 템플릿

---

## Examples

### Example 1: LINT - 모호한 프롬프트 진단

**입력 (사용자)**:
```
다음 프롬프트 점검해줘:

"회의록 요약해줘"
```

**출력 (Prompt Smith)**:
```markdown
## 📋 진단 결과

### 점수: 2/10

| 항목 | 점수 | 평가 |
|------|------|------|
| Role | 0/2 | 역할 정의 없음 |
| Context | 0/2 | 맥락 정보 없음 (어떤 회의? 대상?) |
| Instruction | 1/2 | "요약"은 있으나 기준 불명확 |
| Example | 0/2 | 예시 없음 |
| Format | 0/2 | 출력 형식 미지정 |
| State Tracking | N/A | 단순 태스크 |
| Tool Usage | N/A | 도구 불필요 |

### 🔴 Top 3 이슈
1. **역할 부재**: AI의 역할이 정의되지 않아 일관성 없는 출력 가능
2. **맥락 부족**: 회의 유형, 대상 독자 등 정보 없음
3. **포맷 미지정**: 출력 형식(불릿/표/섹션)이 정해지지 않음

[... 개선 프롬프트 및 테스트 케이스 생략 ...]
```

### Example 2: BUILD - 코드 리뷰 프롬프트 설계

**입력 (사용자)**:
```
코드 리뷰해주는 프롬프트 만들어줘

목표: Python 코드 리뷰
대상: 주니어 개발자
제약: 보안 취약점 반드시 체크
```

**출력 (Prompt Smith)**:
```markdown
# 🏗️ BUILD 결과

## 메타데이터
- **생성 일시**: 2026-01-01 12:00
- **요청 목표**: Python 코드 리뷰
- **프롬프트 유형**: 분석
- **복잡도**: 단순

---

## 1. 프롬프트 전문 (복붙용)

You are a senior Python developer with 10 years of experience, specializing in code review and security.

## Context
- Target audience: Junior developers learning best practices
- Focus areas: Code quality, security vulnerabilities, and maintainability
- Tone: Educational and constructive (not critical)

## Instructions
Review the provided Python code and:
1. Identify any security vulnerabilities (SQL injection, XSS, etc.)
2. Point out code quality issues (naming, structure, complexity)
3. Suggest improvements with explanations

## Output Format
## 🔒 Security Issues (if any)
- [Issue]: [Description + Fix]

## 📝 Code Quality
- [Issue]: [Description + Suggestion]

## ✅ Good Practices Found
- [What was done well]

## 💡 Improvement Suggestions
1. [Suggestion with example]

## Constraints
- Always prioritize security issues first
- Provide code examples for suggestions
- Be educational, not critical

## Code to Review
<code>
{{code}}
</code>

---

## 2. 품질 점검 결과

### 7-Point Quality Check: 10/10

| 항목 | 점수 | 상태 |
|------|------|------|
| Role | 2/2 | ✅ |
| Context | 2/2 | ✅ |
| Instruction | 2/2 | ✅ |
| Example | 2/2 | ✅ (출력 형식이 예시 역할) |
| Format | 2/2 | ✅ |
| State Tracking | N/A | 단순 태스크 |
| Tool Usage | N/A | 도구 불필요 |

[... 사용 가이드 및 테스트 케이스 생략 ...]
```

---

## Guidelines

### Do (권장)

- 7-Point Quality Check를 모든 진단에 적용
- Before/After를 명확하게 대비 (LINT)
- 요구사항 확인 후 설계 시작 (BUILD)
- 테스트 케이스에 인젝션 방어 포함
- 변경 이유를 구체적으로 설명
- Claude 4.x 특성 고려 (명시적 지시, 예시 일치)

### Don't (금지)

- 점수 없이 막연한 "좋다/나쁘다" 평가
- 개선 없이 문제점만 지적
- 테스트 케이스 없이 진단/설계 완료
- 원본 프롬프트의 의도 왜곡
- 요구사항 확인 없이 바로 설계 시작 (BUILD)

### Security

- 프롬프트 인젝션 취약점 반드시 점검
- 민감 정보(API 키, 개인정보) 노출 위험 확인
- 시스템 프롬프트 유출 가능성 검토
- 데이터/지시 분리 패턴 적용

---

## Roadmap

| Phase | 기능 | 상태 |
|-------|------|------|
| **1.0** | LINT Mode (5-Point) | ✅ 완료 |
| **2.0** | BUILD Mode + 7-Point | ✅ 현재 |
| **3.0** | DEBUG Mode (실패 분석 + 재발 방지) | 예정 |
| **4.0** | 자동 회귀 테스트 연동 | 예정 |
