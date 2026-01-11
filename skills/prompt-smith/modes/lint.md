# LINT Mode 상세 가이드

> Progressive Loading Level 2: LINT Mode 트리거 시에만 로드

---

## 개요

LINT Mode는 기존 프롬프트를 진단하고 개선안을 제시합니다.

```
INPUT → ANALYZE → DIAGNOSE → IMPROVE → TEST → REPORT
```

---

## 워크플로우

### Step 1: INPUT
프롬프트 텍스트 수신

- 슬래시 커맨드: `/ps:lint <프롬프트>`
- 자연어: "프롬프트 점검해줘", "프롬프트 진단해줘"

### Step 2: ANALYZE
8-Point Quality Check + 안티패턴 탐지 + **토큰 분석**

```
┌─ 8-Point Quality Check ─────────────────────────────────┐
│  [기본 6항목]                                            │
│  1. ROLE          역할 정의                              │
│  2. CONTEXT       배경/맥락                              │
│  3. INSTRUCTION   지시 명확성                            │
│  4. EXAMPLE       Few-shot 예시                          │
│  5. FORMAT        출력 형식                              │
│  6. SUCCESS_CRITERIA 성공 조건                          │
│                                                         │
│  [Claude 4.x 확장 - 해당 시에만]                         │
│  7. STATE_TRACKING  멀티스텝 상태 관리                   │
│  8. TOOL_USAGE      도구 사용 지시                       │
│                                                         │
│  점수: (원점수/적용항목×2) × 10 = 10점 만점              │
└─────────────────────────────────────────────────────────┘
```

**점수 기준:**
- 0점: 해당 요소 없음
- 1점: 있으나 불충분
- 2점: 명확하고 충분함
- N/A: 해당 없음 (분모에서 제외)

**토큰 분석** (Detail 레벨에서 표시):

| 항목 | 설명 |
|------|------|
| 추정 토큰 | 영어 4자=1토큰, 한글 2자=1토큰 기준 |
| 컨텍스트 사용률 | 대상 모델(200K) 대비 비율 |
| 예상 비용 | Sonnet 기준 입력 비용 |

경고 임계값:
- ⚠️ 50-80%: 최적화 권장
- 🔶 80-90%: 압축 필요
- 🔴 >90%: 즉시 최적화 필요

### Step 3: DIAGNOSE
Top 3 이슈 도출

우선순위:
1. 보안 취약점 (인젝션)
2. 핵심 요소 누락 (Role, Instruction, Format)
3. 모호성/불일치

### Step 4: IMPROVE
Before/After + 변경 이유

```markdown
## Before
[원본 프롬프트]

## After
[개선된 프롬프트]

## Changes
- [+] 추가된 요소
- [~] 수정된 요소
- [-] 제거된 요소
```

### Step 5: TEST
테스트 케이스 생성

| 유형 | 개수 | 목적 |
|------|------|------|
| 정상 케이스 | 2개 | 기본 동작 검증 |
| 엣지 케이스 | 1개 | 경계 조건 검증 |
| 인젝션 케이스 | 1개 | 보안 검증 |
| 도메인 케이스 | 1개 | 도메인 특화 검증 |

### Step 6: REPORT
진단 리포트 출력

---

## 출력 레벨

### Express ("빠르게")
~100 토큰

```
Score: 6/10
Issue: 역할 미정의, 예시 부재
Suggestion: "You are a..." 추가, 입력-출력 예시 2개 추가
```

### Default
~800 토큰

```markdown
## 점수: 6/10

## Top 3 Issues
1. **ROLE**: 역할 미정의 (0점)
2. **EXAMPLE**: 예시 부재 (0점)
3. **FORMAT**: 형식 모호 (1점)

## Improved Prompt
[개선된 프롬프트 전문]

## Changes
- [+] ROLE: "You are a senior developer..."
- [+] EXAMPLE: 입력-출력 2개
- [~] FORMAT: JSON 스키마 추가
```

### Detail ("자세히")
~2000 토큰

```markdown
## Diagnostic Report

### Overall: 6/10

### 항목별 분석
| 항목 | 점수 | 분석 |
|------|------|------|
| ROLE | 0/2 | 역할 정의 없음 |
| CONTEXT | 1/2 | 도메인 언급 있으나 불충분 |
| ... | ... | ... |

### 토큰 분석
| 항목 | 값 |
|------|-----|
| 추정 토큰 | ~1,200 |
| 대상 모델 | Sonnet (200K) |
| 사용률 | 0.6% |
| 예상 비용 | $0.0036/호출 |
| 상태 | ✅ 정상 |

### Top 3 Issues
[상세 분석]

### Improved Prompt
[개선된 프롬프트 전문]

### Test Cases
[5개 테스트 케이스]

### Maintenance Notes
[유지보수 권장사항]
```

---

## 안티패턴 탐지

LINT 시 자동 탐지되는 패턴:

| 패턴 | 탐지 방법 | 개선 |
|------|----------|------|
| 모호한 지시 | "잘", "적당히", "깔끔하게" | 구체적 기준 |
| 역할 누락 | "You are" 부재 | 역할 추가 |
| 예시 부재 | Example 섹션 없음 | Few-shot 추가 |
| 형식 미지정 | Format 섹션 없음 | JSON/MD 스키마 |
| 인젝션 취약 | 사용자 입력 분리 없음 | XML 태그 분리 |

---

## Self-Check (매 LINT 후)

```
□ 8-Point Quality Check 수행했는가?
□ Top 3 이슈를 구체적으로 지적했는가?
□ Before/After 개선안을 제시했는가?
□ 테스트 케이스를 생성했는가?
□ 점수 변화를 표시했는가?
```

---

## 관련 참조

- [../references/quality-checklist.md](../references/quality-checklist.md) - 8-Point 상세
- [../references/anti-patterns.md](../references/anti-patterns.md) - 안티패턴
- [../references/token-management.md](../references/token-management.md) - 토큰 관리
- [../references/structured-outputs.md](../references/structured-outputs.md) - 구조화 출력
- [../templates/diagnostic-report.md](../templates/diagnostic-report.md) - 리포트 템플릿
- [express-lint.md](../playbooks/lint/express-lint.md) - Express LINT
