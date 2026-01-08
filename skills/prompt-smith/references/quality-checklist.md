# 7-Point Quality Check 상세 가이드

프롬프트 품질 평가의 핵심 프레임워크입니다. 모든 LINT 진단은 이 7가지 관점에서 수행됩니다.

> **v2.0.0 변경**: 5-Point → 7-Point로 확장 (Claude 4.x 최적화)

---

## 개요

```
┌─────────────────────────────────────────────────────────────┐
│                 7-Point Quality Check                       │
├─────────────────────────────────────────────────────────────┤
│  [기본 5항목 - 항상 평가]                                    │
│  1. ROLE        AI의 정체성과 관점 정의                      │
│  2. CONTEXT     배경, 맥락, 제약 조건                        │
│  3. INSTRUCTION 구체적이고 명확한 지시                       │
│  4. EXAMPLE     입력-출력 예시 (Few-shot)                    │
│  5. FORMAT      출력 형식과 구조                             │
├─────────────────────────────────────────────────────────────┤
│  [Claude 4.x 확장 - 해당 시에만 평가]                        │
│  6. STATE_TRACKING  장기 태스크 상태 관리                    │
│  7. TOOL_USAGE      도구 사용 지시 명확성                    │
├─────────────────────────────────────────────────────────────┤
│  점수: (원점수/적용항목×2) × 10 = 10점 만점                  │
│  N/A 항목은 분모에서 제외                                    │
└─────────────────────────────────────────────────────────────┘
```

### 점수 계산 예시

| 시나리오 | 적용 항목 | 원점수 | 계산 | 최종 점수 |
|----------|----------|--------|------|----------|
| 단순 프롬프트 | 5개 | 8점 | (8/10)×10 | 8.0점 |
| 도구 사용 | 6개 | 10점 | (10/12)×10 | 8.3점 |
| 장기 태스크+도구 | 7개 | 12점 | (12/14)×10 | 8.6점 |

---

## 1. ROLE (역할)

### 정의
AI가 어떤 관점과 전문성으로 응답해야 하는지 정의합니다.

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 역할 정의 없음 | "요약해줘" |
| **1점** | 역할 있으나 모호함 | "전문가처럼 답해줘" |
| **2점** | 구체적 역할 정의 | "You are a senior Python developer with 10 years of experience in financial systems" |

### 체크리스트

- [ ] "You are a..." 또는 동등한 역할 정의 존재
- [ ] 전문 분야 명시
- [ ] 경험 수준 명시 (필요시)
- [ ] 역할과 태스크의 일관성

### 좋은 예시

```markdown
You are a senior technical writer who specializes in API documentation.
You have experience writing docs for REST APIs used by external developers.
Your documentation style is concise, example-driven, and developer-friendly.
```

### 나쁜 예시

```markdown
# 역할 없음
API 문서 써줘

# 모호한 역할
전문가처럼 문서 써줘
```

### 개선 패턴

```markdown
# Before
문서 작성해줘

# After
You are a technical writer who creates clear, developer-friendly documentation.
Your goal is to help developers quickly understand and use the API.
```

---

## 2. CONTEXT (맥락)

### 정의
프롬프트가 사용되는 배경, 도메인, 제약 조건을 제공합니다.

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 맥락 정보 없음 | "코드 리뷰해줘" |
| **1점** | 부분적 맥락 | "Python 코드 리뷰해줘" |
| **2점** | 충분한 맥락 | "Python 3.11 기반 금융 서비스 백엔드 코드입니다. PCI-DSS 준수가 필요합니다." |

### 체크리스트

- [ ] 도메인/산업 명시
- [ ] 대상 사용자 정의
- [ ] 기술 스택/환경 명시 (기술 관련)
- [ ] 규제/정책 제약 (해당시)
- [ ] 전제 조건 명시

### 좋은 예시

```markdown
## Context
- **Domain**: E-commerce payment processing
- **Tech Stack**: Python 3.11, FastAPI, PostgreSQL
- **Users**: Internal developers and external partners
- **Compliance**: PCI-DSS Level 1
- **Scale**: 10K+ transactions per second
```

### 나쁜 예시

```markdown
# 맥락 없음
코드 리뷰해줘

# 불충분한 맥락
Python 코드야. 봐줘.
```

### 개선 패턴

```markdown
# Before
이 함수 개선해줘

# After
## Context
이 함수는 주문 처리 시스템의 일부입니다.
- 평균 1000 TPS를 처리해야 합니다
- 데이터베이스 연결 풀이 제한적입니다
- 실패 시 재시도 로직이 필요합니다
```

---

## 3. INSTRUCTION (지시)

### 정의
AI가 수행해야 할 구체적이고 명확한 동작을 정의합니다.

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 지시 없음/매우 모호 | "잘 해줘" |
| **1점** | 있으나 모호함 | "깔끔하게 요약해줘" |
| **2점** | 구체적이고 명확함 | "3문장으로 요약하고, 각 문장에 핵심 키워드 1개를 대괄호로 표시해줘" |

### 체크리스트

- [ ] 구체적인 동작 지시
- [ ] 모호한 표현 없음 ("잘", "적당히", "깔끔하게" 등)
- [ ] 단계별 프로세스 (복잡한 태스크)
- [ ] 명확한 기준/조건

### 모호한 표현 사전

| 모호한 표현 | 문제점 | 개선 예시 |
|-------------|--------|----------|
| "잘" | 기준 불명확 | "에러 없이", "3초 이내", "정확도 95% 이상" |
| "깔끔하게" | 주관적 | "불필요한 공백 제거", "일관된 들여쓰기" |
| "적당히" | 범위 불명확 | "300-500자", "3-5개 항목" |
| "자연스럽게" | 기준 없음 | "구어체로", "격식체 없이" |
| "좋은" | 정의 없음 | 구체적 품질 기준 나열 |

### 좋은 예시

```markdown
## Instructions
1. Read the input text carefully
2. Identify the main topic and 3 key points
3. Write a summary following this structure:
   - First sentence: Main topic
   - Second sentence: Most important point
   - Third sentence: Implications or next steps
4. Keep each sentence under 25 words
5. Do not add information not present in the original
```

### 나쁜 예시

```markdown
# 모호함
잘 요약해줘

# 불충분함
요약해. 짧게.
```

---

## 4. EXAMPLE (예시)

### 정의
입력과 기대 출력의 예시를 제공하여 AI가 패턴을 학습하도록 합니다.

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 예시 없음 | 지시만 있음 |
| **1점** | 1개 예시 또는 불완전한 예시 | 입력만 있고 출력 없음 |
| **2점** | 2개 이상의 완전한 예시 | 입력-출력 쌍 2-3개 |

### 체크리스트

- [ ] 입력-출력 쌍으로 구성
- [ ] 다양한 케이스 커버
- [ ] 원하는 스타일/형식 반영
- [ ] 엣지 케이스 포함 (필요시)

### Few-shot 예시 패턴

```markdown
## Examples

### Example 1
**Input**: "The meeting was productive. We decided to launch next month."
**Output**:
{
  "sentiment": "positive",
  "key_decision": "launch next month",
  "action_items": []
}

### Example 2
**Input**: "We need to fix the bug before release. John will handle it by Friday."
**Output**:
{
  "sentiment": "neutral",
  "key_decision": "fix bug before release",
  "action_items": ["John: fix bug by Friday"]
}

### Example 3 (Edge Case)
**Input**: ""
**Output**:
{
  "error": "Empty input provided",
  "sentiment": null,
  "key_decision": null,
  "action_items": []
}
```

### 좋은 예시

```markdown
## Examples

Input: "Apple announced new iPhone"
Output: {"category": "technology", "entities": ["Apple", "iPhone"]}

Input: "Stock market crashed today"
Output: {"category": "finance", "entities": ["stock market"]}
```

### 나쁜 예시

```markdown
# 예시 없음
카테고리 분류해줘

# 불완전한 예시
예를 들어 "Apple announced..."는 technology야
(출력 형식 미표시)
```

---

## 5. FORMAT (출력 형식)

### 정의
AI의 응답이 따라야 할 구조와 형식을 정의합니다.

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 형식 미지정 | 자유 형식 |
| **1점** | 부분적 지정 | "JSON으로 줘" (스키마 없음) |
| **2점** | 완전한 형식 정의 | JSON 스키마 + 필드 설명 |

### 체크리스트

- [ ] 출력 형식 명시 (JSON, 마크다운, 표 등)
- [ ] 구조/필드 정의
- [ ] 필수/선택 필드 구분
- [ ] 타입 정의 (string, number, array 등)
- [ ] 길이/분량 제약

### 형식별 템플릿

#### JSON 형식
```markdown
## Output Format
Return a valid JSON object with the following structure:

{
  "summary": "string (max 100 characters)",
  "confidence": "number (0.0 to 1.0)",
  "categories": ["string", ...],  // 1-3 items
  "metadata": {
    "processed_at": "ISO 8601 timestamp",
    "model_version": "string"
  }
}

Required fields: summary, confidence
Optional fields: categories, metadata
```

#### 마크다운 형식
```markdown
## Output Format
Use the following markdown structure:

# Title
[One-line title]

## Summary
[2-3 sentences]

## Key Points
- Point 1
- Point 2
- Point 3

## Conclusion
[1 sentence]

Constraints:
- Total length: 200-300 words
- Use bullet points, not numbered lists
```

#### 표 형식
```markdown
## Output Format
Return a markdown table with these columns:

| ID | Name | Status | Notes |
|----|------|--------|-------|
| number | string | enum(active,inactive,pending) | string (optional) |

- Sort by ID ascending
- Max 10 rows
- Leave Notes empty if not applicable
```

### 좋은 예시

```markdown
## Output Format
Respond with valid JSON:

{
  "answer": "string (direct answer to the question)",
  "confidence": 0.0-1.0,
  "sources": ["string", ...],
  "follow_up_questions": ["string", "string"]
}

- answer: Required. Max 200 characters.
- confidence: Required. Your certainty level.
- sources: Optional. References used.
- follow_up_questions: Required. Exactly 2 questions.
```

### 나쁜 예시

```markdown
# 형식 없음
답변해줘

# 불충분한 형식
JSON으로 줘 (스키마 없음)
```

---

## 6. STATE_TRACKING (상태 관리) - Claude 4.x 확장

### 정의
장기 실행 태스크나 멀티스텝 작업에서 진행 상태를 추적하고 관리하는 방법을 정의합니다.

### 적용 조건
- [ ] 3단계 이상의 멀티스텝 태스크
- [ ] 세션이 끊어질 수 있는 장기 작업
- [ ] 체크포인트/롤백이 필요한 작업
- [ ] 여러 파일/리소스를 순차 처리

**위 조건 중 하나라도 해당되면 평가 (해당 없으면 N/A)**

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 상태 관리 없음 (필요한데) | "10개 파일 처리해줘" (진행 추적 없음) |
| **1점** | 부분적 상태 관리 | "진행 상황 알려줘" (구조화 없음) |
| **2점** | 체계적 상태 관리 | JSON 상태 + 체크포인트 + 재개 지원 |

### 체크리스트

- [ ] 상태 저장 형식 정의 (JSON 권장)
- [ ] 체크포인트 시점 명시
- [ ] 실패 시 재개 방법 정의
- [ ] 진행률 표시 방법 명시
- [ ] 완료 조건 명확

### 좋은 예시

```markdown
## State Tracking

### 상태 파일 형식
```json
{
  "task_id": "migration-001",
  "total_items": 100,
  "processed": 45,
  "current_item": "users/profile.ts",
  "status": "in_progress",
  "errors": [],
  "checkpoint": "2024-01-15T10:30:00Z"
}
```

### 체크포인트 규칙
- 매 10개 항목 처리 후 상태 저장
- 에러 발생 시 즉시 저장
- `state.json` 파일에 기록

### 재개 방법
1. `state.json` 읽기
2. `processed` 이후 항목부터 계속
3. 완료 시 상태 파일 삭제
```

### 나쁜 예시

```markdown
# 상태 관리 없음
100개 파일 마이그레이션 해줘

# 불충분
진행 상황 알려주면서 해줘
```

### 개선 패턴

```markdown
# Before
모든 테스트 파일을 Jest에서 Vitest로 변환해줘

# After
## State Tracking
- 시작 전: 변환 대상 목록 생성 → `migration-state.json`
- 각 파일 변환 후: 상태 업데이트
- 10개마다: git commit (체크포인트)
- 실패 시: 해당 파일 errors 배열에 추가, 다음 파일 계속
- 재개: state.json의 processed 이후부터 시작
```

---

## 7. TOOL_USAGE (도구 사용) - Claude 4.x 확장

### 정의
AI가 사용해야 할 도구와 그 사용 방법, 조건을 명확히 정의합니다.

### 적용 조건
- [ ] 파일 읽기/쓰기 필요
- [ ] 외부 명령 실행 필요
- [ ] 웹 검색/API 호출 필요
- [ ] 여러 도구 조합 사용

**위 조건 중 하나라도 해당되면 평가 (해당 없으면 N/A)**

### 점수 기준

| 점수 | 기준 | 예시 |
|------|------|------|
| **0점** | 도구 지시 없음 (필요한데) | "파일 찾아서 수정해" |
| **1점** | 부분적 도구 지시 | "grep으로 찾아" (병렬/순차 미명시) |
| **2점** | 명확한 도구 지시 | 도구 선택 기준 + 병렬/순차 + 에러 처리 |

### 체크리스트

- [ ] 사용할 도구 목록 명시
- [ ] 도구 선택 기준 정의
- [ ] 병렬 vs 순차 실행 명시
- [ ] 도구 실패 시 대응 정의
- [ ] 도구 결과 활용 방법 명시

### 도구 사용 패턴

```
┌─────────────────────────────────────────────────────────────┐
│  병렬 실행 (독립적 작업)                                     │
│  ────────────────────                                       │
│  여러 파일 동시 읽기 → Read 병렬 호출                        │
│  독립적 검색 → Grep/Glob 병렬 호출                          │
│  서로 의존성 없는 작업 → 동시 실행                           │
├─────────────────────────────────────────────────────────────┤
│  순차 실행 (의존성 있는 작업)                                │
│  ────────────────────                                       │
│  읽기 → 분석 → 수정 (결과 의존)                             │
│  검색 → 파일 찾기 → 내용 읽기                               │
│  mkdir → 파일 생성 → 내용 작성                              │
└─────────────────────────────────────────────────────────────┘
```

### 좋은 예시

```markdown
## Tool Usage

### 사용 도구
- **Glob**: 파일 패턴 검색 (`*.test.ts`)
- **Read**: 파일 내용 읽기
- **Edit**: 파일 수정
- **Bash**: 테스트 실행

### 실행 전략
1. Glob으로 모든 테스트 파일 찾기 (1회)
2. Read로 파일들 병렬 읽기 (독립적이므로 병렬)
3. 각 파일 분석 후 Edit으로 수정 (순차 - 의존성)
4. 모든 수정 완료 후 Bash로 테스트 실행

### 에러 처리
- Read 실패: 해당 파일 스킵, 에러 로그 기록
- Edit 실패: 롤백 후 사용자에게 알림
- Bash 실패: 테스트 결과 분석 후 수정 제안

### 도구 선택 기준
| 상황 | 도구 | 이유 |
|------|------|------|
| 파일 찾기 | Glob (not find) | 더 빠르고 안전 |
| 내용 검색 | Grep (not grep) | 권한 최적화 |
| 파일 수정 | Edit (not sed) | 안전한 수정 |
```

### 나쁜 예시

```markdown
# 도구 미지정
TypeScript 파일 찾아서 에러 고쳐줘

# 불충분
grep으로 찾아서 수정해
```

### 개선 패턴

```markdown
# Before
프로젝트에서 deprecated API 찾아서 새 API로 바꿔줘

# After
## Tool Usage

### Step 1: 검색 (병렬)
- Glob: `**/*.ts`, `**/*.tsx` 파일 목록
- Grep: `deprecatedFunction` 패턴 검색
→ 두 작업 병렬 실행 가능

### Step 2: 분석 (순차)
- 검색 결과로 대상 파일 확정
- Read로 각 파일 내용 확인
→ Step 1 결과에 의존하므로 순차

### Step 3: 수정 (순차)
- Edit으로 각 파일 수정
- 수정 후 바로 검증
→ 파일별로 순차 처리

### Step 4: 검증
- Bash: `npm run typecheck`
- 실패 시 수정 내용 검토
```

---

## 점수 해석 가이드

| 총점 | 등급 | 해석 | 권장 조치 |
|------|------|------|----------|
| 9-10 | A | 프로덕션 준비 완료 | 테스트 후 배포 |
| 7-8 | B | 양호, 개선 권장 | 마이너 개선 후 사용 |
| 5-6 | C | 개선 필요 | 주요 항목 보완 필요 |
| 3-4 | D | 미흡 | 전면 재작성 권장 |
| 0-2 | F | 부적합 | 처음부터 다시 설계 |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                7-POINT QUALITY CHECK                        │
├─────────────────────────────────────────────────────────────┤
│  [기본 5항목 - 항상 평가]                                    │
│                                                             │
│  ROLE (0-2)                                                 │
│  ✓ "You are a [specific role]..."                          │
│  ✓ 전문 분야 + 경험 수준                                    │
│                                                             │
│  CONTEXT (0-2)                                              │
│  ✓ 도메인/산업                                              │
│  ✓ 사용자/독자                                              │
│  ✓ 제약 조건                                                │
│                                                             │
│  INSTRUCTION (0-2)                                          │
│  ✓ 구체적 동작                                              │
│  ✓ 모호함 없음                                              │
│  ✓ 단계별 (복잡할 때)                                       │
│                                                             │
│  EXAMPLE (0-2)                                              │
│  ✓ 입력-출력 쌍                                             │
│  ✓ 2개 이상                                                 │
│  ✓ 다양한 케이스                                            │
│                                                             │
│  FORMAT (0-2)                                               │
│  ✓ 형식 명시 (JSON/MD/표)                                   │
│  ✓ 스키마/구조                                              │
│  ✓ 길이 제약                                                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Claude 4.x 확장 - 해당 시에만]                            │
│                                                             │
│  STATE_TRACKING (0-2/N/A)                                   │
│  ✓ 상태 저장 형식 (JSON)                                    │
│  ✓ 체크포인트 시점                                          │
│  ✓ 재개 방법                                                │
│  적용: 멀티스텝/장기 태스크                                  │
│                                                             │
│  TOOL_USAGE (0-2/N/A)                                       │
│  ✓ 도구 목록                                                │
│  ✓ 병렬/순차 전략                                           │
│  ✓ 에러 처리                                                │
│  적용: 파일/명령/API 사용 시                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  점수 = (원점수/적용항목×2) × 10                            │
│  9+:A | 7-8:B | 5-6:C | 3-4:D | 0-2:F                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 관련 참조

- [anti-patterns.md](anti-patterns.md) - 피해야 할 패턴
- [../playbooks/lint/full-lint.md](../playbooks/lint/full-lint.md) - LINT 워크플로우
- [../templates/prompt-template.md](../templates/prompt-template.md) - 프롬프트 템플릿
