# 프롬프트 기법 우선순위 가이드

Anthropic 공식 문서 기반의 프롬프트 엔지니어링 기법 적용 순서입니다.

---

## 기법 우선순위 (Anthropic 권장 순서)

```
┌─────────────────────────────────────────────────────────────┐
│              Prompt Engineering Technique Priority           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Prompt Generator ─────────── 시작점 (Blank page 해결)   │
│         ↓                                                   │
│  2. Be Clear & Direct ────────── 명확하고 직접적인 지시      │
│         ↓                                                   │
│  3. Use Examples (3-5개) ─────── 멀티샷 프롬프팅             │
│         ↓                                                   │
│  4. Let Claude Think (CoT) ───── 사고 과정 유도              │
│         ↓                                                   │
│  5. Use XML Tags ─────────────── 구조화 및 구분              │
│         ↓                                                   │
│  6. Give Role (System) ───────── 역할 및 페르소나            │
│         ↓                                                   │
│  7. Prefill Response ─────────── 응답 시작 강제              │
│         ↓                                                   │
│  8. Chain Prompts ────────────── 복잡한 작업 분할            │
│         ↓                                                   │
│  9. Long Context Tips ────────── 대용량 문서 처리            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Prompt Generator (시작점)

### 목적
Blank page 문제 해결 - 처음부터 시작하기 어려울 때 사용

### 적용 시점
- 새로운 프롬프트를 처음 작성할 때
- 기존 프롬프트를 완전히 재설계할 때

### 방법
1. 작업 목표 정의
2. 입력/출력 형식 정의
3. 자동 생성된 프롬프트를 시작점으로 활용
4. 이후 기법들로 점진적 개선

---

## 2. Be Clear & Direct (명확하고 직접적인 지시)

### 핵심 비유
**"새 직원(기억상실) 비유"**: Claude는 작업 맥락을 모르는 새 직원처럼 취급

### 적용 원칙

| 원칙 | 설명 | 예시 |
|------|------|------|
| **맥락 제공** | 배경 정보 명시 | "이것은 B2B SaaS 제품의 고객 지원 챗봇입니다" |
| **구체적 지시** | 원하는 행동 상세 기술 | "이메일을 3문단으로 요약하세요" |
| **순차적 단계** | 복잡한 작업은 단계별 분리 | "Step 1: 분석, Step 2: 평가, Step 3: 권장" |
| **완료 조건** | 성공의 기준 명시 | "모든 테스트가 통과할 때까지" |

### 동료 테스트
프롬프트를 동료에게 보여주고, 의도대로 이해하는지 확인

### Before vs After

```markdown
# ❌ 모호함
이 코드 봐줘

# ✅ 명확함
이 Python 함수를 검토해주세요:
1. 버그 또는 논리 오류 식별
2. 성능 개선 가능한 부분 제안
3. 각 문제에 대한 수정 코드 제공

함수:
[코드]
```

---

## 3. Use Examples (멀티샷 프롬프팅)

### 권장 개수
**3-5개**의 다양하고 명확한 예시 (Anthropic 권장)

### 좋은 예시의 3가지 기준

| 기준 | 설명 |
|------|------|
| **Relevant** | 실제 사용 케이스와 일치 |
| **Diverse** | 엣지 케이스 포함, 의도치 않은 패턴 학습 방지 |
| **Clear** | `<example>` 태그로 구조화 |

### 예시 형식

```markdown
<examples>
<example>
<input>Apple announced new iPhone today</input>
<output>{"category": "technology", "entities": ["Apple", "iPhone"]}</output>
</example>

<example>
<input>The weather is nice outside</input>
<output>{"category": "general", "entities": []}</output>
</example>

<example>
<input>Error 404: Page not found</input>
<output>{"category": "error", "entities": ["404"]}</output>
</example>
</examples>
```

### 예시 개수 가이드

| 작업 유형 | 권장 개수 |
|-----------|----------|
| 간단한 분류 | 3개 |
| 복잡한 추출 | 4-5개 |
| 엣지 케이스 포함 | +1-2개 추가 |

---

## 4. Let Claude Think (Chain of Thought)

### 3단계 CoT

| 단계 | 방식 | 예시 |
|------|------|------|
| **Basic** | 한 줄 지시 | "Think step-by-step" |
| **Guided** | 단계별 프로세스 명시 | "First... Then... Finally..." |
| **Structured** | XML 태그로 분리 | `<thinking>` + `<answer>` |

### Structured CoT 예시

```markdown
Please analyze this problem:

<problem>
[문제 설명]
</problem>

Show your reasoning in <thinking> tags, then provide your final answer in <answer> tags.
```

### 장점
- 디버깅 용이 (사고 과정 확인)
- 후처리로 `<thinking>` 제거 가능
- 복잡한 문제에서 정확도 향상

---

## 5. Use XML Tags (구조화)

### 장점

| 장점 | 설명 |
|------|------|
| **Clarity** | 프롬프트 내 역할 명확화 |
| **Accuracy** | 정확한 지시 경계 |
| **Flexibility** | 태그 순서 변경 용이 |
| **Parseability** | 프로그래밍적 추출 용이 |

### 권장 패턴

```markdown
<context>
[배경 정보]
</context>

<instructions>
[작업 지시]
</instructions>

<data>
[처리할 데이터]
</data>

<output_format>
[출력 형식 정의]
</output_format>
```

### 중첩 구조

```markdown
<document>
  <section name="introduction">
    [내용]
  </section>
  <section name="body">
    [내용]
  </section>
</document>
```

---

## 6. Give Role (System Prompt)

### 역할 정의 위치
**System 파라미터** 사용 권장 (User 메시지보다 우선)

### 효과

| 효과 | 설명 |
|------|------|
| **정확도 향상** | 도메인 전문성 활성화 |
| **톤 조정** | 일관된 어조 유지 |
| **초점 유지** | 역할 범위 내 응답 |

### 예시

```python
response = client.messages.create(
    model="claude-sonnet-4-5-20250514",
    system="You are a senior security engineer specializing in web application security.",
    messages=[
        {"role": "user", "content": "Review this code for vulnerabilities."}
    ]
)
```

### 역할 유지 기법
Prefill과 결합하여 캐릭터 일탈 방지

```python
messages=[
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "[Security Engineer]"}  # Prefill
]
```

---

## 7. Prefill Response

### 목적
응답 시작점을 강제하여 형식/스타일 제어

### 핵심 규칙

| 규칙 | 설명 |
|------|------|
| 후행 공백 금지 | `"text "` → 에러 |
| Extended Thinking 비호환 | 함께 사용 불가 |

### 패턴

| 용도 | Prefill | 효과 |
|------|---------|------|
| JSON 강제 | `{` | 바로 JSON 시작 |
| 역할 유지 | `[Character]` | 일탈 방지 |
| XML 구조 | `<analysis>` | 태그로 시작 |

---

## 8. Chain Prompts (프롬프트 체이닝)

### 적용 시점
- 복잡한 작업을 하위 태스크로 분해
- 각 단계의 출력이 다음 단계의 입력

### 자가 수정 체인

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Generate │────▶│  Review  │────▶│  Refine  │
│  (생성)  │     │  (검토)  │     │  (수정)  │
└──────────┘     └──────────┘     └──────────┘
```

### XML 핸드오프 패턴

```markdown
## Step 1 Output
<step1_result>
[이전 단계 결과]
</step1_result>

## Step 2 Input
Use the content in <step1_result> to...
```

---

## 9. Long Context Tips

### 대용량 문서 처리

| 기법 | 설명 |
|------|------|
| **문서 상단 배치** | 중요 문서는 프롬프트 앞쪽에 |
| **XML 태그 분리** | 문서 간 명확한 경계 |
| **인용 기반 응답** | 긴 문서는 먼저 인용 추출 |

### 할루시네이션 방지

```markdown
<documents>
[긴 문서들]
</documents>

## Instructions
1. 위 문서에서 관련 인용을 먼저 추출하세요
2. 인용만을 기반으로 답변하세요
3. 문서에 없는 정보는 "확인할 수 없음"으로 표시하세요
```

---

## 기법 선택 가이드

### 작업 유형별 우선 기법

| 작업 유형 | 1순위 | 2순위 | 3순위 |
|-----------|-------|-------|-------|
| **분류** | Examples | XML Tags | - |
| **생성** | Clear Instructions | Role | Examples |
| **분석** | CoT | XML Tags | Examples |
| **추출** | Examples | XML Tags | Prefill |
| **대화** | Role | Clear Instructions | - |
| **복잡한 작업** | Chaining | CoT | XML Tags |

### 점진적 적용

```
[기본] Clear & Direct
    ↓ 형식 일관성 필요?
[추가] Examples (3-5개)
    ↓ 복잡한 추론 필요?
[추가] CoT (Structured)
    ↓ 구조화 필요?
[추가] XML Tags
    ↓ 특정 형식 강제?
[추가] Prefill
    ↓ 작업이 너무 복잡?
[분할] Chaining
```

---

## 관련 참조

- [quality-checklist.md](quality-checklist.md) - 7-Point Quality Check
- [claude-4x-best-practices.md](claude-4x-best-practices.md) - Claude 4.x 최적화
- [hallucination-reduction.md](hallucination-reduction.md) - 할루시네이션 감소
- [latency-optimization.md](latency-optimization.md) - 지연시간 최적화
