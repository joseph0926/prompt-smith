# Claude 4.x Best Practices

Claude 4.x 모델(Sonnet 4, Opus 4.5)의 특성에 맞춘 프롬프트 최적화 가이드입니다.

> **적용 모델**: claude-sonnet-4-5-20250929, claude-opus-4-5-20251101

---

## 핵심 원칙

```
┌─────────────────────────────────────────────────────────────┐
│              Claude 4.x 프롬프트 원칙                        │
├─────────────────────────────────────────────────────────────┤
│  1. EXPLICIT    암시보다 명시 - 원하는 것을 직접 요청        │
│  2. MOTIVATED   왜 필요한지 동기 제공                        │
│  3. EXEMPLIFIED 예시 = 기대 출력 형식                        │
│  4. TRACKED     장기 작업은 상태 관리                        │
│  5. PARALLELIZED 독립 작업은 병렬, 의존성은 순차             │
│  6. FORMATTED   XML 태그 또는 JSON 스키마로 구조화           │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. 명시적 지시 (EXPLICIT)

### Claude 4.x 특성
Claude 4.x는 지시를 **문자 그대로** 따릅니다. 암시적 기대는 작동하지 않습니다.

### 패턴

| 의도 | ❌ 암시적 | ✅ 명시적 |
|------|----------|----------|
| 코드 작성 | "이 기능 구현해줘" | "이 기능을 구현하고 tests/ 폴더에 테스트도 작성해줘" |
| 분석 | "분석해줘" | "분석하고 결과를 JSON으로 출력해줘" |
| 제안 | "개선해줘" | "개선 사항 3가지를 제안해줘" (또는 "직접 수정해줘") |
| 리뷰 | "봐줘" | "코드를 검토하고 문제점을 리스트로 정리해줘" |

### 예시

```markdown
# ❌ 암시적 (Claude 4.x에서 불완전한 결과)
API 엔드포인트 만들어줘

# ✅ 명시적 (완전한 결과)
API 엔드포인트를 만들어줘:
1. src/routes/users.ts에 GET /users 엔드포인트 구현
2. src/types/user.ts에 User 타입 정의
3. src/__tests__/users.test.ts에 테스트 작성
4. 완료 후 npm test 실행해서 통과 확인
```

---

## 2. 동기 제공 (MOTIVATED)

### Claude 4.x 특성
Claude 4.x는 "왜"를 이해하면 더 나은 판단을 합니다.

### 패턴

```markdown
## Context
[배경 설명 + 왜 이 작업이 필요한지]

## Goal
[달성하려는 목표]

## Constraints
[제약 조건 + 그 이유]
```

### 예시

```markdown
# ❌ 동기 없음
이 함수 최적화해줘

# ✅ 동기 제공
## Context
이 함수는 실시간 대시보드에서 매 초 호출됩니다.
현재 평균 200ms가 걸려서 UI가 버벅입니다.

## Goal
응답 시간을 50ms 이하로 줄여야 합니다.

## Constraints
- 메모리 사용량은 현재 수준 유지 (이미 한계에 가까움)
- 외부 캐시 시스템 추가 불가 (인프라 제약)
```

---

## 3. 예시 일치 (EXEMPLIFIED)

### Claude 4.x 특성
Claude 4.x는 예시의 형식을 매우 정확하게 따릅니다.

### 원칙
**예시 형식 = 원하는 출력 형식**

### 패턴

```markdown
## Examples

### Example 1
**Input**: [입력 예시]
**Output**:
[정확히 원하는 형식의 출력]

### Example 2
**Input**: [다른 유형의 입력]
**Output**:
[동일한 형식의 출력]
```

### 예시

```markdown
# ❌ 예시와 기대 출력 불일치
예시: "Apple" → 기술 회사
(자연어 설명)

기대 출력: JSON
(형식 불일치)

# ✅ 예시 = 기대 출력
## Examples

**Input**: "Apple announced new iPhone today"
**Output**:
```json
{
  "entities": [
    {"name": "Apple", "type": "company"},
    {"name": "iPhone", "type": "product"}
  ],
  "topic": "technology",
  "date_mentioned": true
}
```

**Input**: "The weather is nice"
**Output**:
```json
{
  "entities": [],
  "topic": "general",
  "date_mentioned": false
}
```
```

---

## 4. 상태 관리 (TRACKED)

### Claude 4.x 특성
Claude 4.x는 장기 작업에서 상태를 체계적으로 관리할 수 있습니다.

### 적용 조건
- 3단계 이상 멀티스텝 태스크
- 세션 중단 가능성 있는 작업
- 10개 이상 파일/항목 처리

### 패턴

```markdown
## State Tracking

### State Schema
```json
{
  "task_id": "string",
  "status": "pending | in_progress | completed | failed",
  "progress": {
    "total": "number",
    "completed": "number",
    "current": "string"
  },
  "checkpoint": "ISO timestamp",
  "errors": ["string"]
}
```

### Checkpoint Rules
- [체크포인트 시점]
- [저장 위치]

### Resume Protocol
1. [재개 방법]
2. [검증 방법]
```

### 예시

```markdown
## State Tracking

100개 파일을 마이그레이션하는 작업입니다.

### State File: migration-state.json
```json
{
  "task_id": "jest-to-vitest",
  "status": "in_progress",
  "progress": {
    "total": 100,
    "completed": 45,
    "current": "src/utils/date.test.ts"
  },
  "checkpoint": "2024-01-15T10:30:00Z",
  "errors": [
    "src/legacy/old.test.ts: Cannot convert dynamic import"
  ]
}
```

### Checkpoint Rules
- 매 10개 파일 완료 후 state 저장
- 에러 발생 시 즉시 state 저장
- 각 체크포인트에서 git commit

### Resume Protocol
1. state.json 읽기
2. progress.completed 다음 파일부터 계속
3. 이전 체크포인트 커밋 확인
```

---

## 5. 병렬/순차 실행 (PARALLELIZED)

### Claude 4.x 특성
Claude 4.x는 독립적인 도구 호출을 병렬로 실행할 수 있습니다.

### 판단 기준

```
┌─────────────────────────────────────────────────────────────┐
│  병렬 실행 조건                                              │
│  ─────────────                                              │
│  • 작업 간 데이터 의존성 없음                                │
│  • 결과가 서로 영향 주지 않음                                │
│  • 순서가 결과에 영향 없음                                   │
├─────────────────────────────────────────────────────────────┤
│  순차 실행 조건                                              │
│  ─────────────                                              │
│  • 이전 결과가 다음 입력에 필요                              │
│  • 파일 생성 후 내용 작성                                    │
│  • 검색 후 결과 기반 추가 작업                               │
└─────────────────────────────────────────────────────────────┘
```

### 패턴

```markdown
## Tool Usage Strategy

### Parallel (독립적)
[작업 A, B, C를 동시에 실행]

### Sequential (의존적)
[작업 D] → [작업 E (D 결과 사용)] → [작업 F (E 결과 사용)]
```

### 예시

```markdown
## Tool Usage Strategy

### Step 1: 정보 수집 (병렬)
동시 실행:
- Glob: `**/*.ts` 파일 목록
- Glob: `**/*.tsx` 파일 목록
- Read: `package.json` 읽기
→ 세 작업은 서로 독립적

### Step 2: 분석 (순차)
Step 1 완료 후:
- Step 1의 파일 목록으로 대상 확정
- 각 파일 Read → 분석
→ Step 1 결과에 의존

### Step 3: 수정 (순차)
각 파일에 대해:
- Read → 분석 → Edit
→ 파일별 순차 처리 (동일 파일 동시 수정 방지)

### Step 4: 검증 (순차)
모든 수정 완료 후:
- Bash: `npm run build`
- Bash: `npm test`
→ 빌드 성공 후 테스트
```

---

## 6. 구조화된 출력 (FORMATTED)

### Claude 4.x 특성
Claude 4.x는 XML 태그와 JSON 스키마를 정확하게 따릅니다.

### 패턴 선택

| 용도 | 권장 형식 | 이유 |
|------|----------|------|
| 데이터 교환 | JSON | 파싱 용이 |
| 긴 텍스트 구분 | XML 태그 | 구조 명확 |
| 복합 출력 | JSON + 마크다운 | 유연성 |

### XML 태그 패턴

```markdown
## Output Format

응답은 다음 XML 구조를 따라주세요:

<response>
  <analysis>
    [분석 내용]
  </analysis>
  <recommendation>
    [권장 사항]
  </recommendation>
  <code>
    [코드가 있다면]
  </code>
</response>
```

### JSON 스키마 패턴

```markdown
## Output Format

```json
{
  "analysis": {
    "summary": "string (100자 이내)",
    "issues": [
      {
        "severity": "critical | major | minor",
        "location": "string",
        "description": "string"
      }
    ],
    "metrics": {
      "complexity": "number (1-10)",
      "maintainability": "number (1-10)"
    }
  },
  "recommendations": ["string"],
  "estimated_effort": "string"
}
```

Required: analysis.summary, analysis.issues
Optional: analysis.metrics, recommendations, estimated_effort
```

---

## 7. Extended Thinking 활용 (Anthropic 권장)

### Claude 4.x 특성
Claude 4.x는 복잡한 작업에서 "확장 사고(Extended Thinking)" 모드로 더 깊이 생각할 수 있습니다.

### 기술적 고려사항 (Anthropic 공식 가이드)

| 항목 | 권장값 | 설명 |
|------|--------|------|
| **최소 예산** | 1024 토큰 | 시작점으로 권장 |
| **대규모 작업** | 32K+ 토큰 | 배치 처리 권장 (네트워크 타임아웃 방지) |
| **언어** | 영어 | 사고 과정은 영어에서 최적 (다국어 출력은 가능) |

### 효과적인 프롬프팅

```markdown
# ❌ 과도한 단계 지시 (권장하지 않음)
Think through this math problem step by step:
1. First, identify the variables
2. Then, set up the equation
3. Next, solve for x
→ Claude의 사고 방식을 과도하게 제약

# ✅ 고수준 지시 (권장)
Please think about this math problem thoroughly and in great detail.
Consider multiple approaches and show your complete reasoning.
Try different methods if your first approach doesn't work.
→ Claude에게 사고 방식의 자유도 부여
```

### 핵심 원칙

1. **고수준 지시 우선**: Claude가 스스로 최적의 사고 방식 선택하도록 허용
2. **사고 출력 재사용 금지**: 이전 사고를 user 블록에 전달하면 성능 저하
3. **프리필 금지**: Extended Thinking + Prefill 조합 불가

### 최적 사용 사례

- **Complex STEM**: 수학, 물리, 복잡한 알고리즘
- **Constraint Optimization**: 다중 제약 최적화 문제
- **Strategic Analysis**: Blue Ocean, Porter's Five Forces 등 프레임워크 적용
- **Multi-step Reasoning**: 여러 단계의 논리적 추론

### 예시

```markdown
## Decision Process

데이터베이스 마이그레이션 전략을 결정해야 합니다.

### Options to Evaluate
1. Big Bang: 한 번에 전체 마이그레이션
2. Gradual: 점진적 마이그레이션 (듀얼 라이트)
3. Blue-Green: 새 DB 병렬 운영 후 전환

### Evaluation Criteria (우선순위 순)
1. 다운타임 최소화 (비즈니스 연속성)
2. 데이터 일관성 (무결성)
3. 롤백 용이성 (위험 관리)
4. 구현 복잡도 (리소스)

Think deeply about each option. Consider edge cases and potential failures.
Recommend the best approach with detailed reasoning.
```

---

## 8. Prefill (응답 사전 입력) - Anthropic 권장

### 개념
Assistant 턴에 초기 텍스트를 입력하여 응답 시작점을 강제합니다. Claude가 특정 형식이나 역할로 응답을 시작하도록 유도할 수 있습니다.

### 핵심 규칙

| 규칙 | 설명 | 예시 |
|------|------|------|
| **후행 공백 금지** | 프리필 끝에 공백 불가 | `"As an AI assistant, I "` → ❌ 에러 |
| **Extended Thinking 비호환** | 확장 사고 모드에서 프리필 불가 | Extended Thinking + Prefill → ❌ |
| **JSON 강제** | `{`로 시작하면 JSON 출력 강제 | 프리앰블 없이 바로 JSON |

### 패턴

| 용도 | Prefill 예시 | 효과 |
|------|-------------|------|
| JSON 강제 | `{` | 프리앰블 생략, 직접 JSON 시작 |
| 역할 유지 | `[Sherlock Holmes]` | 캐릭터 일탈 방지 |
| 리스트 시작 | `1.` | 번호 목록 강제 |
| XML 구조 | `<analysis>` | 특정 태그로 시작 강제 |
| 긍정 응답 | `Yes,` | 거부 방지 (주의 필요) |

### 예시: JSON 강제

```python
response = client.messages.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {"role": "user", "content": "Extract product info as JSON: {{description}}"},
        {"role": "assistant", "content": "{"}  # Prefill
    ]
)
# 결과: Claude가 `{`부터 이어서 JSON 출력
# {"name": "iPhone 15", "price": 999, ...}
```

### 예시: 역할 유지

```python
# 역할극에서 캐릭터 일탈 방지
messages = [
    {"role": "user", "content": "You are Sherlock Holmes. What do you think of this case?"},
    {"role": "assistant", "content": "[Sherlock Holmes]"}  # Prefill
]
# Claude가 항상 셜록 홈즈로 응답 시작
```

### 예시: XML 구조 강제

```python
messages = [
    {"role": "user", "content": "Analyze this code and provide recommendations."},
    {"role": "assistant", "content": "<analysis>"}  # Prefill
]
# Claude가 <analysis> 태그 내에서 분석 시작
```

### 주의사항

```markdown
# ❌ Anti-Pattern: 후행 공백
{"role": "assistant", "content": "Here is my response: "}
→ 끝에 공백 있으면 API 에러

# ❌ Anti-Pattern: Extended Thinking과 조합
thinking={"type": "enabled", ...}
+ assistant prefill
→ 호환 불가

# ✅ Correct: 공백 없이 종료
{"role": "assistant", "content": "Here is my response:"}
{"role": "assistant", "content": "{"}
{"role": "assistant", "content": "[Character]"}
```

---

## 9. API 파라미터 최적화 (API_PARAMETERS)

### Claude 4.x 특성
Claude API 호출 시 적절한 파라미터 설정이 품질과 일관성에 영향을 줍니다.

### 권장 파라미터

| 파라미터 | 권장값 | 용도 |
|----------|--------|------|
| **temperature** | 0-0.3 | 정확성 중심 (코드, 추출, 분류) |
| **temperature** | 0.7-1.0 | 창의성 중심 (브레인스토밍, 글쓰기) |
| **max_tokens** | 응답 예상 길이 × 1.5 | 안전 마진 확보 |
| **top_p** | 0.9 (기본) | 대부분 기본값 사용 |
| **stop_sequences** | 작업별 지정 | 체이닝 시 응답 구분 |

### 상황별 설정

```markdown
## 코드 생성
temperature: 0.1-0.3
max_tokens: 2048+
stop_sequences: ["```\n\n", "---"]

## 분석/요약
temperature: 0.3-0.5
max_tokens: 1024

## 창의적 작업
temperature: 0.8-1.0
max_tokens: 작업별 조정
```

### 패턴

```markdown
# ❌ Anti-Pattern
프롬프트만으로 출력 제어 시도
(온도 기본값으로 모든 작업 수행)

# ✅ Correct
API 파라미터 + 프롬프트 조합
- 정확성 필요 시 temperature 낮춤
- Structured Outputs 활용 (출력 형식 보장)
- stop_sequences로 응답 경계 제어
```

### Claude Code 참고
Claude Code 환경에서는 API 파라미터보다 **CLAUDE.md 규칙 파일**이 더 큰 레버리지를 제공합니다.
프롬프트 포맷에 집중하기보다 프로젝트 규칙 파일을 잘 관리하세요.

---

## 10. "Above and Beyond" 명시적 요청 (v2.7 신규)

> **출처**: Anthropic 공식 가이드 - "Customers who desire the 'above and beyond' behavior from previous Claude models might need to more explicitly request these behaviors with newer models."

### Claude 4.x 특성

Claude 4.x는 이전 모델들과 달리 **요청한 것만 정확히 수행**합니다. 과거 Claude 3.x에서 기대했던 "자발적인 추가 제안", "예상치 못한 개선", "능동적인 문제 발견" 같은 행동은 **명시적으로 요청해야** 발생합니다.

### 왜 이런 변화가 생겼나?

| 이유 | 설명 |
|------|------|
| **정밀한 지시 따르기** | 사용자가 원하지 않는 추가 작업 방지 |
| **예측 가능한 동작** | 요청 범위 내에서만 응답 |
| **과도한 수정 방지** | 코드 리팩토링, 불필요한 개선 감소 |

### 패턴 비교

| 원하는 것 | ❌ 암시적 (동작 안 함) | ✅ 명시적 (동작함) |
|-----------|-------------------|-----------------|
| 개선 제안 | "코드 작성해줘" | "코드 작성하고 더 좋은 방법이 있으면 제안해줘" |
| Edge case | "함수 만들어" | "함수 만들고 edge case도 고려해줘" |
| 테스트 | "구현해줘" | "구현하고 테스트도 작성해줘" |
| 문서화 | "API 만들어" | "API 만들고 JSDoc 주석도 추가해줘" |
| 최적화 | "동작하게 해줘" | "동작하게 하고 성능 개선 여지도 알려줘" |
| 리뷰 | "코드 봐줘" | "코드 보고 문제점, 개선점, 보안 이슈 모두 지적해줘" |

### 활용 패턴

```markdown
## 기본 요청 + Above and Beyond

### Task
[기본 요청 내용]

### 추가 요청 (선택)
완료 후 다음 사항도 검토해주세요:
- [ ] 더 나은 접근 방법이 있다면 제안
- [ ] 발견된 잠재적 문제점 지적
- [ ] 관련된 개선 기회 알림
- [ ] 누락된 edge case 식별
```

### 예시

```markdown
# ❌ 이전 Claude에서 기대했던 방식 (4.x에서 동작 안 함)
이 함수 구현해줘
(테스트도 작성해주겠지... 에러 처리도 알아서 하겠지...)

# ✅ Claude 4.x에 맞는 방식
이 함수를 구현해줘:

## Task
- calculateTax(amount, region) 함수 구현
- 지역별 세율 적용

## 추가 요청
구현 완료 후:
1. edge case 고려사항 리스트업
2. 에러 처리 추가 필요 여부 검토
3. 테스트 케이스 3개 작성
4. 성능상 주의할 점 있으면 언급
```

### 도메인별 "Above and Beyond" 템플릿

#### 코드 리뷰
```markdown
코드 리뷰해주세요:
- 버그 및 논리 오류
- 보안 취약점 (OWASP Top 10)
- 성능 문제
- 코드 스타일/가독성
- 테스트 커버리지 갭
- **추가로 발견한 개선 기회도 알려주세요**
```

#### 기능 구현
```markdown
기능 구현해주세요:
- [기본 요구사항]
- **구현 후 더 좋은 설계가 있으면 대안 제시**
- **놓치기 쉬운 edge case 지적**
```

#### 문서 작성
```markdown
API 문서 작성해주세요:
- 기본 사용법
- 파라미터 설명
- **개발자가 자주 하는 실수도 Warning으로 포함**
- **관련 API와의 연동 예시도 추가**
```

---

## Anti-Patterns (Claude 4.x에서 피해야 할 것)

### 1. 암시적 기대

```markdown
# ❌ Anti-Pattern
코드 리뷰해줘
(테스트도 작성해주겠지...)

# ✅ Correct
코드 리뷰하고 발견된 문제에 대한 테스트 케이스도 작성해줘
```

### 2. 모호한 완료 조건

```markdown
# ❌ Anti-Pattern
잘 작동할 때까지 수정해줘

# ✅ Correct
다음 조건을 모두 만족할 때까지 수정해줘:
- npm test 통과
- npm run lint 에러 없음
- TypeScript 타입 에러 없음
```

### 3. 도구 사용 미지정

```markdown
# ❌ Anti-Pattern
에러 찾아서 고쳐줘

# ✅ Correct
## Tool Usage
1. Grep으로 "TODO", "FIXME" 검색
2. 각 파일 Read로 컨텍스트 확인
3. Edit으로 수정
4. Bash로 테스트 실행
```

### 4. 상태 관리 없는 장기 작업

```markdown
# ❌ Anti-Pattern
100개 파일 전부 마이그레이션해줘

# ✅ Correct
100개 파일 마이그레이션:
- 진행 상태: migration-state.json에 기록
- 체크포인트: 10개마다 git commit
- 실패 시: 에러 기록 후 다음 파일 계속
- 재개: state 파일 기반으로 이어서 진행
```

---

## Quick Checklist

```
┌─────────────────────────────────────────────────────────────┐
│           Claude 4.x 프롬프트 체크리스트                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ 원하는 행동을 명시적으로 요청했는가?                      │
│  □ 왜 이 작업이 필요한지 설명했는가?                         │
│  □ 예시 형식이 기대 출력과 일치하는가?                       │
│  □ 장기 작업에 상태 관리를 정의했는가?                       │
│  □ 도구 사용 전략을 명시했는가? (병렬/순차)                  │
│  □ 출력 형식을 구조화했는가? (JSON/XML)                      │
│  □ 완료 조건이 검증 가능한가?                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 관련 참조

- [quality-checklist.md](quality-checklist.md) - 8-Point Quality Check
- [anti-patterns.md](anti-patterns.md) - 피해야 할 패턴
- [../templates/prompt-template.md](../templates/prompt-template.md) - 프롬프트 템플릿
- [state-tracking-guide.md](state-tracking-guide.md) - 상태 관리 상세
- [tool-usage-guide.md](tool-usage-guide.md) - 도구 사용 상세
