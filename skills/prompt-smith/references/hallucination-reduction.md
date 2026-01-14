# 할루시네이션 감소 가이드

Claude가 사실이 아닌 정보를 생성하는 것을 방지하는 기법들입니다.

> **출처**: Anthropic 공식 문서 - Reduce Hallucinations

---

## 목차

- [할루시네이션 유형](#할루시네이션-유형)
- [기본 전략 (4가지)](#기본-전략-4가지)
- [고급 전략](#고급-전략)
- [다중 검증 프로세스](#다중-검증-프로세스)
- [문서 유형별 전략](#문서-유형별-전략)
- [프롬프트 템플릿](#프롬프트-템플릿)
- [탐지 패턴](#탐지-패턴)
- [체크리스트](#체크리스트)
- [관련 참조](#관련-참조)

---

## 할루시네이션 유형

| 유형 | 설명 | 예시 |
|------|------|------|
| **사실 오류** | 틀린 정보 제시 | 존재하지 않는 API 메서드 |
| **존재하지 않는 인용** | 없는 출처 생성 | 가짜 논문, URL |
| **과장된 확신** | 불확실한 것을 확정적으로 | "반드시 X입니다" |
| **맥락 이탈** | 제공된 맥락을 벗어난 정보 | 문서에 없는 내용 추가 |

---

## 기본 전략 (4가지)

### 1. "I don't know" 허용

Claude에게 불확실성을 인정할 수 있는 권한 부여

```markdown
## Instructions
Answer the question based on the documents provided.

IMPORTANT: If you don't have enough information to answer confidently,
say "I don't know" or "I'm not certain about this."
It's better to admit uncertainty than to provide potentially incorrect information.
```

### 2. 인용 기반 응답

긴 문서(>20K 토큰)에서 먼저 관련 인용을 추출

```markdown
## Step 1: 관련 인용 추출
문서에서 질문과 관련된 부분을 직접 인용하세요.
각 인용에 출처를 표시하세요. (예: [문서 1, 섹션 3])

<relevant_quotes>
[인용 추출]
</relevant_quotes>

## Step 2: 인용 기반 답변
위 <relevant_quotes>의 인용만 사용하여 답변하세요.
인용에 없는 정보는 추가하지 마세요.
```

### 3. 인용 검증

각 주장에 대해 문서 내 출처 명시 요구

```markdown
## Instructions
Answer the question using only the provided documents.

For each claim in your answer:
- Include a citation in the format [Doc X, Section Y]
- If a claim cannot be supported by the documents, explicitly state:
  "This information is not available in the provided documents."
```

### 4. 외부 지식 제한

문서 외부의 정보 사용 금지

```markdown
IMPORTANT CONSTRAINTS:
- Only use information explicitly provided in the documents above
- Do not use any external knowledge or assumptions
- Do not infer information that is not directly stated
- If asked about something not in the documents, say "The documents do not contain this information"
```

---

## 고급 전략

### Chain-of-Thought 검증

생성 후 자기 검증 단계 추가

```markdown
## Step 1: 초안 작성
질문에 답변하세요.

## Step 2: 검증
<verification>
위 답변의 각 주장에 대해:
1. 문서에서 해당 내용을 찾을 수 있는가?
2. 인용 가능한 구체적 부분이 있는가?
3. 불확실한 부분은 어떤 것인가?
</verification>

## Step 3: 최종 수정
검증 결과를 반영한 최종 답변:
- 확인된 내용: 유지
- 확인 안 된 내용: 제거 또는 불확실성 표시
- 불확실한 내용: 명시적으로 표시
```

### Best-of-N 검증

여러 번 생성하여 일관성 확인

```markdown
## 다중 검증 프로세스

### Round 1: 초안 생성
질문에 답변하세요.

### Round 2: 독립 검토
위 답변을 비판적으로 검토하세요:
- 문서에서 확인되지 않는 주장은?
- 과도한 확신을 가진 부분은?
- 논리적 비약이 있는 부분은?

### Round 3: 최종 합성
검토 결과를 반영하여 최종 답변을 작성하세요.
```

### 반복 정제 (Iterative Refinement)

```markdown
## Initial Answer
[첫 번째 답변]

## Self-Critique
위 답변을 다음 기준으로 평가:
- 문서 기반 정확성: X/10
- 확신 수준 적절성: X/10
- 인용 완전성: X/10

## Refined Answer
평가 결과를 반영한 개선된 답변
```

---

## 문서 유형별 전략

### 기술 문서 (API, 코드)

```markdown
## Instructions
Answer based on the API documentation provided.

Rules:
- Only mention methods/functions that exist in the documentation
- If a method doesn't exist, say "This method is not documented"
- Include exact signatures when referencing functions
- Do not guess about undocumented behavior
```

### 법률/규정 문서

```markdown
## Instructions
Answer based solely on the legal documents provided.

Rules:
- Quote exact text when possible
- Use "According to [Section X]..." format
- Never interpret beyond the explicit text
- If interpretation is needed, clearly state "This may be interpreted as..."
```

### 연구 논문

```markdown
## Instructions
Summarize the research paper provided.

Rules:
- Only report findings explicitly stated in the paper
- Do not generalize beyond the study's scope
- Include page/section references for claims
- Distinguish between: findings, author's interpretations, limitations
```

---

## 프롬프트 템플릿

### 기본 템플릿 (할루시네이션 방지)

```markdown
<documents>
{{DOCUMENTS}}
</documents>

<question>
{{QUESTION}}
</question>

## Instructions
Answer the question using ONLY the information in the documents above.

## Rules
1. If the answer is not in the documents, say "I cannot find this information in the provided documents"
2. For each claim, indicate which document it comes from
3. Do not use any external knowledge
4. If uncertain, express your uncertainty level

## Output Format
<answer>
[Your answer with citations]
</answer>

<confidence>
High | Medium | Low
</confidence>

<sources>
[List of document sections used]
</sources>
```

### 고급 템플릿 (검증 포함)

```markdown
<documents>
{{DOCUMENTS}}
</documents>

<question>
{{QUESTION}}
</question>

## Phase 1: Extract Relevant Information
<extracted_info>
List all relevant quotes from the documents.
Format: "[Doc X] Quote text here"
</extracted_info>

## Phase 2: Draft Answer
<draft>
Answer based only on extracted information.
</draft>

## Phase 3: Verify
<verification>
For each claim in the draft:
- Claim: [claim text]
- Source: [document reference] or "NOT FOUND"
- Confidence: High/Medium/Low
</verification>

## Phase 4: Final Answer
<final_answer>
Revised answer based on verification.
Remove or flag any unverified claims.
</final_answer>
```

---

## 탐지 패턴

### 할루시네이션 위험 표현

```regex
# 과도한 확신
(확실히|반드시|항상|절대로|100%|틀림없이)

# 외부 지식 의존 징후
(일반적으로|보통|대부분의 경우|알려진 바로는|~에 따르면)

# 모호한 출처
(연구에 의하면|전문가들은|많은 사람들이)

# 검증 없는 단정
(~입니다|~됩니다)(?!.*(문서|인용|출처))
```

### 안전한 표현

```markdown
# 권장 표현
- "문서에 따르면..."
- "문서 X의 섹션 Y에서..."
- "이 정보는 문서에서 확인되지 않습니다"
- "제공된 정보를 기반으로..."
- "불확실하지만..."
```

---

## 체크리스트

```
┌─ Hallucination Prevention Checklist ────────────────────────┐
│                                                             │
│  □ "I don't know" 허용 문구 포함                            │
│  □ 문서 기반 답변 지시                                      │
│  □ 외부 지식 사용 금지 명시                                 │
│  □ 인용 요구 사항 포함                                      │
│  □ 불확실성 표현 방법 제공                                  │
│  □ 검증 단계 포함 (고급)                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 관련 참조

- [anti-patterns.md](anti-patterns.md) - #11 할루시네이션 유발 패턴
- [technique-priority.md](technique-priority.md) - 기법 우선순위
- [quality-checklist.md](quality-checklist.md) - 품질 체크리스트
