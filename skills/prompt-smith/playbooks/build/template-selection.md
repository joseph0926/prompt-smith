# 템플릿 선택 가이드

BUILD Mode의 DESIGN 단계에서 적절한 템플릿을 선택하기 위한 의사결정 가이드입니다.

---

## 템플릿 선택 플로우차트

```
                    ┌─────────────────┐
                    │  태스크 유형?    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │  생성   │         │  분석   │         │  변환   │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ 코드?   │         │ 평가?   │         │ 요약?   │
   └────┬────┘         └────┬────┘         └────┬────┘
        │                    │                    │
    Yes │ No             Yes │ No             Yes │ No
        │                    │                    │
   ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
   │ Code    │         │Content  │         │Document │
   │Generator│         │Evaluator│         │Summarize│
   └─────────┘         └─────────┘         └─────────┘
```

---

## 1. 생성 (Generation) 템플릿

### 1.1 Code Generator

**적합한 경우**:
- 함수/클래스/모듈 작성
- API 엔드포인트 구현
- 테스트 코드 작성

**핵심 요소**:
```markdown
## Role
You are a senior [언어] developer with [N] years of experience.

## Context
- Language: [언어] [버전]
- Framework: [프레임워크]
- Style Guide: [스타일 가이드]

## Output Format
```[언어]
// Implementation
```

```[언어]
// Tests
```
```

**체크리스트**:
- [ ] 언어/버전 명시
- [ ] 스타일 가이드 지정
- [ ] 테스트 포함 여부
- [ ] 에러 처리 요구사항

---

### 1.2 Document Writer

**적합한 경우**:
- 기술 문서 작성
- API 문서 생성
- README 작성

**핵심 요소**:
```markdown
## Role
You are a technical writer who specializes in [분야].

## Context
- Audience: [대상 독자]
- Technical Level: [초급/중급/고급]
- Purpose: [목적]

## Output Format
# Title
## Section 1
...
```

---

### 1.3 Content Creator

**적합한 경우**:
- 마케팅 콘텐츠
- 블로그 포스트
- 소셜 미디어 콘텐츠

**핵심 요소**:
```markdown
## Role
You are a content creator for [브랜드/분야].

## Context
- Brand Voice: [톤/스타일]
- Platform: [플랫폼]
- Target Audience: [대상]
```

---

## 2. 분석 (Analysis) 템플릿

### 2.1 Content Evaluator

**적합한 경우**:
- 코드 리뷰
- 문서 평가
- 품질 검사

**핵심 요소**:
```markdown
## Role
You are an expert evaluator who provides objective assessments.

## Rubric
| Criterion | Weight | 0 | 1 | 2 |
|-----------|--------|---|---|---|
| [기준1]   | 30%    |...|...|...|

## Output Format
### Overall Score: X/10
### Criterion Scores
| Criterion | Score | Evidence |
...
```

**체크리스트**:
- [ ] 평가 기준 정의
- [ ] 점수 체계 명시
- [ ] 근거 요구

---

### 2.2 Code Reviewer

**적합한 경우**:
- PR 리뷰
- 보안 검토
- 성능 분석

**핵심 요소**:
```markdown
## Role
You are a senior code reviewer focusing on [관점].

## Review Criteria
- Security: [보안 체크포인트]
- Performance: [성능 체크포인트]
- Maintainability: [유지보수 체크포인트]

## Output Format
### Summary
### Issues Found
| Severity | Location | Issue | Suggestion |
```

---

### 2.3 Data Analyzer

**적합한 경우**:
- 데이터 분석
- 트렌드 파악
- 인사이트 도출

**핵심 요소**:
```markdown
## Role
You are a data analyst specializing in [분야].

## Analysis Framework
1. Descriptive: [현황]
2. Diagnostic: [원인]
3. Prescriptive: [권장]
```

---

## 3. 변환 (Transformation) 템플릿

### 3.1 Document Summarizer

**적합한 경우**:
- 긴 문서 요약
- 회의록 정리
- 뉴스 요약

**핵심 요소**:
```markdown
## Role
You are a senior analyst who creates concise, actionable summaries.

## Output Format
### TL;DR
[1-2 sentences]

### Key Points
- Point 1
- Point 2

### Action Items
- [ ] Item 1
```

**체크리스트**:
- [ ] 요약 길이 제한
- [ ] 핵심 정보 추출 기준
- [ ] 원문 정보만 사용

---

### 3.2 Translator

**적합한 경우**:
- 언어 번역
- 기술 용어 현지화
- 문화적 적응

**핵심 요소**:
```markdown
## Role
You are a professional translator specialized in [분야].

## Context
- Source Language: [원본 언어]
- Target Language: [대상 언어]
- Style: [격식/비격식]
- Domain: [전문 분야]
```

---

### 3.3 Format Converter

**적합한 경우**:
- JSON ↔ XML
- 마크다운 ↔ HTML
- 데이터 형식 변환

**핵심 요소**:
```markdown
## Input Format
[입력 스키마]

## Output Format
[출력 스키마]

## Conversion Rules
- [규칙 1]
- [규칙 2]
```

---

## 4. 추출 (Extraction) 템플릿

### 4.1 Entity Extractor

**적합한 경우**:
- 개체명 인식
- 정보 추출
- 데이터 파싱

**핵심 요소**:
```markdown
## Role
You are a data extraction specialist.

## Entity Types
- [엔티티 유형 1]: [정의]
- [엔티티 유형 2]: [정의]

## Output Format
```json
{
  "entities": [
    {"type": "string", "value": "string"}
  ],
  "confidence": 0.0-1.0
}
```
```

**체크리스트**:
- [ ] 추출 대상 정의
- [ ] 신뢰도 점수 포함
- [ ] 빈 결과 처리

---

### 4.2 Classifier

**적합한 경우**:
- 텍스트 분류
- 감정 분석
- 카테고리 태깅

**핵심 요소**:
```markdown
## Categories
1. [카테고리 1]: [정의]
2. [카테고리 2]: [정의]

## Classification Rules
- [규칙 1]
- [규칙 2]

## Output Format
{
  "category": "string",
  "confidence": 0.0-1.0,
  "reasoning": "string"
}
```

---

## 5. 대화 (Conversation) 템플릿

### 5.1 Customer Support Agent

**적합한 경우**:
- 고객 문의 응대
- FAQ 봇
- 헬프데스크

**핵심 요소**:
```markdown
## Role
You are a friendly customer support agent for [회사].

## Response Guidelines
- Greeting: [인사 스타일]
- Problem Solving: [해결 프로세스]
- Escalation: [에스컬레이션 조건]

## Forbidden Actions
- Never promise [금지 사항]
- Never share [비공개 정보]
```

**체크리스트**:
- [ ] 브랜드 톤 정의
- [ ] 에스컬레이션 조건
- [ ] 금지 사항 명시

---

### 5.2 Q&A Assistant

**적합한 경우**:
- 지식 기반 Q&A
- 문서 기반 답변
- 튜토리얼 봇

**핵심 요소**:
```markdown
## Knowledge Base
[참조 문서/데이터]

## Response Format
1. Direct Answer
2. Supporting Details
3. Related Topics

## Uncertainty Handling
- If unsure: [처리 방법]
- If out of scope: [처리 방법]
```

---

## 복잡도별 템플릿 선택

| 복잡도 | 권장 항목 | 템플릿 예시 |
|--------|----------|------------|
| 단순 | 5-Point 기본 | Entity Extractor, Classifier |
| 중간 | 5-Point + 상세 | Code Generator, Document Summarizer |
| 복잡 | 7-Point 전체 | 멀티스텝 Code Generator, 대규모 Migration |

---

## 빠른 선택 표

| 하고 싶은 것 | 템플릿 |
|-------------|--------|
| 코드 작성 | Code Generator |
| 문서 작성 | Document Writer |
| 코드 리뷰 | Code Reviewer |
| 문서 평가 | Content Evaluator |
| 문서 요약 | Document Summarizer |
| 번역 | Translator |
| 정보 추출 | Entity Extractor |
| 분류 | Classifier |
| 고객 응대 | Customer Support Agent |
| Q&A | Q&A Assistant |

---

## 관련 참조

- [build-mode.md](build-mode.md) - BUILD 워크플로우
- [requirement-gathering.md](requirement-gathering.md) - 요구사항 수집
- [../../templates/prompt-template.md](../../templates/prompt-template.md) - 전체 템플릿
