# Structured Outputs 가이드

100% JSON 유효성을 보장하는 구조화된 출력 강제 기법입니다.

---

## 개요

### 목적
- 일관된 JSON/XML 출력 보장
- 파싱 실패 제로화
- 타입 안전성 확보
- 자동화 파이프라인 안정화

### 적용 시점
- API 응답 생성
- 데이터 추출 및 분류
- 구조화된 분석 결과
- 자동화 시스템 연동

---

## 방법 비교

| 방법 | 신뢰도 | 적용 난이도 | Claude Code 지원 |
|------|--------|------------|------------------|
| **Format 지시 + 예시** | 90%+ | 낮음 | ✅ 완전 지원 |
| **Prefill 패턴** | 95%+ | 낮음 | ⚠️ API 레벨 |
| **XML 구조 강제** | 95%+ | 낮음 | ✅ 완전 지원 |
| **Tool Use 강제** | 99%+ | 중간 | ✅ 지원 |
| **JSON Mode (API)** | 100% | 낮음 | ⚠️ API 직접 호출 |

---

## 방법 1: Format 지시 + 예시

### 기본 패턴

```markdown
## 출력 형식
응답은 반드시 유효한 JSON 형식이어야 합니다.
JSON 외의 텍스트를 포함하지 마세요.
마크다운 코드 블록으로 감싸지 마세요.

## JSON 스키마
{
  "result": "string",
  "confidence": "number (0.0-1.0)",
  "details": ["string array"]
}

## 예시
{"result": "positive", "confidence": 0.92, "details": ["clear intent", "no ambiguity"]}
```

### 강화 패턴

```markdown
## 지시
당신의 응답은 **오직 JSON만** 포함해야 합니다.

## 금지 사항
- ❌ JSON 앞뒤에 텍스트 추가
- ❌ ```json 코드 블록 사용
- ❌ 설명이나 주석 추가
- ❌ 키 이름 변경

## 필수 사항
- ✅ 첫 문자는 반드시 `{`
- ✅ 마지막 문자는 반드시 `}`
- ✅ 모든 키는 큰따옴표
- ✅ 문자열 값은 큰따옴표

## 스키마
{{json_schema}}

## 정확한 출력 예시
{{example_output}}
```

---

## 방법 2: Prefill 패턴

### 개념

```
┌─────────────────────────────────────────────────────────────┐
│              Prefill 패턴                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User: [질문/요청]                                           │
│                                                             │
│  Assistant: {                    ← Prefill (응답 시작 강제)   │
│    "result": "...",                                         │
│    ...                           ← 모델이 계속 작성          │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API 레벨 구현 (참고용)

```python
# Anthropic API 직접 호출 시
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "분석 요청..."},
        {"role": "assistant", "content": "{"}  # Prefill
    ]
)
```

### Claude Code 프롬프트 대안

```markdown
## 지시
JSON 응답을 생성하세요. 반드시 `{`로 시작하세요.

## 출력
{으로 시작하는 JSON:
```

---

## 방법 3: XML 구조 강제

### 기본 패턴

```markdown
## 출력 형식
응답을 다음 XML 구조로 작성하세요:

<response>
  <result>결과 값</result>
  <confidence>0.0-1.0 사이 숫자</confidence>
  <reasoning>판단 근거</reasoning>
</response>

## 규칙
- 모든 태그 필수
- 태그 이름 변경 금지
- 태그 외 텍스트 금지
```

### JSON 내장 XML 패턴

```markdown
## 출력 형식
<json_output>
{"key": "value", ...}
</json_output>

## 규칙
- <json_output> 태그 내에 유효한 JSON만 포함
- 태그 외 텍스트 금지
```

---

## 방법 4: Tool Use 강제

### 개념

```markdown
## 설명
Tool Use를 통해 출력 스키마를 강제합니다.
모델이 도구를 "호출"하는 형태로 구조화된 데이터를 반환합니다.
```

### 프롬프트 패턴

```markdown
## 사용 가능한 도구

### output_json
결과를 구조화된 JSON으로 반환합니다.

**입력 스키마**:
```json
{
  "type": "object",
  "properties": {
    "result": {
      "type": "string",
      "description": "분석 결과"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "신뢰도 (0.0-1.0)"
    },
    "categories": {
      "type": "array",
      "items": {"type": "string"},
      "description": "분류 카테고리 목록"
    }
  },
  "required": ["result", "confidence"]
}
```

## 지시
분석을 완료한 후 반드시 `output_json` 도구를 사용하여 결과를 반환하세요.
다른 형태의 출력은 허용되지 않습니다.
```

---

## 스키마 정의 모범 사례

### 명확한 스키마 작성

```markdown
## JSON 스키마

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "analysis": {
      "type": "object",
      "properties": {
        "sentiment": {
          "type": "string",
          "enum": ["positive", "negative", "neutral", "mixed"],
          "description": "전반적인 감정 분류"
        },
        "score": {
          "type": "number",
          "minimum": -1,
          "maximum": 1,
          "description": "감정 점수 (-1: 매우 부정, 1: 매우 긍정)"
        },
        "keywords": {
          "type": "array",
          "items": {"type": "string"},
          "maxItems": 5,
          "description": "핵심 키워드 (최대 5개)"
        }
      },
      "required": ["sentiment", "score"]
    },
    "metadata": {
      "type": "object",
      "properties": {
        "processed_at": {
          "type": "string",
          "format": "date-time"
        },
        "model_version": {
          "type": "string"
        }
      }
    }
  },
  "required": ["analysis"]
}
```
```

### 예시 포함

```markdown
## 예시 출력

### 입력: "정말 좋은 제품이에요! 배송도 빠르고 품질도 최고입니다."

```json
{
  "analysis": {
    "sentiment": "positive",
    "score": 0.92,
    "keywords": ["좋은", "빠른 배송", "품질", "최고"]
  },
  "metadata": {
    "processed_at": "2026-01-11T10:30:00Z",
    "model_version": "1.0.0"
  }
}
```

### 입력: "가격은 비싸지만 성능은 괜찮네요."

```json
{
  "analysis": {
    "sentiment": "mixed",
    "score": 0.2,
    "keywords": ["비싼 가격", "괜찮은 성능"]
  }
}
```
```

---

## 검증 체크리스트

### 출력 검증

```markdown
## JSON 유효성 검증

- [ ] `JSON.parse()` 성공
- [ ] 모든 필수 필드 존재
- [ ] 데이터 타입 일치
  - [ ] string은 string
  - [ ] number는 number
  - [ ] array는 array
- [ ] 값 범위 준수
  - [ ] min/max 범위
  - [ ] enum 값 일치
- [ ] 배열 길이 제한 준수
```

### 일반적인 실패 패턴

```markdown
## 실패 패턴 및 대응

### 1. 마크다운 코드 블록
❌ ```json\n{...}\n```
✅ {...}

대응: "마크다운 코드 블록을 사용하지 마세요" 명시

### 2. 설명 텍스트 추가
❌ 다음은 분석 결과입니다:\n{...}
✅ {...}

대응: "JSON 외 텍스트 금지" 강조

### 3. 키 이름 변경
❌ {"결과": "value"}
✅ {"result": "value"}

대응: "영어 키 이름 유지" 명시, 예시 제공

### 4. 타입 불일치
❌ {"score": "0.5"} (string)
✅ {"score": 0.5} (number)

대응: 스키마에 타입 명시, 예시에서 올바른 타입 보여주기

### 5. 누락된 필드
❌ {"result": "value"} (confidence 누락)
✅ {"result": "value", "confidence": 0.8}

대응: required 필드 명시, 예시에서 모든 필드 포함
```

---

## 에러 복구 전략

### 1. 재시도 패턴

```markdown
## 첫 번째 시도 실패 시

### 피드백 프롬프트
이전 응답이 유효한 JSON이 아닙니다.

오류: {{error_message}}

다시 시도하세요. 반드시:
1. `{`로 시작
2. `}`로 끝
3. 모든 키는 큰따옴표
4. JSON 외 텍스트 없음

스키마:
{{schema}}
```

### 2. 후처리 정규화

```markdown
## 후처리 단계

1. 앞뒤 공백 제거
2. 마크다운 코드 블록 제거 (있는 경우)
3. 앞뒤 설명 텍스트 제거 (JSON 추출)
4. JSON.parse() 시도
5. 실패 시 재시도 또는 에러 반환
```

---

## 프롬프트 템플릿

### 분류 작업용

```markdown
## 역할
당신은 텍스트 분류 시스템입니다.

## 입력
<input>
{{user_input}}
</input>

## 분류 카테고리
- technology: 기술, IT, 소프트웨어
- business: 비즈니스, 경제, 금융
- lifestyle: 생활, 건강, 취미
- other: 기타

## 출력 형식 (JSON만)
{
  "category": "카테고리명",
  "confidence": 0.0-1.0,
  "reasoning": "분류 이유"
}

## 규칙
- 반드시 위 JSON 형식만 출력
- 다른 텍스트 추가 금지
- 카테고리는 위 목록에서만 선택

## 예시
입력: "새로운 AI 모델이 출시되었습니다"
{"category": "technology", "confidence": 0.95, "reasoning": "AI 모델 관련 기술 뉴스"}
```

### 추출 작업용

```markdown
## 역할
당신은 정보 추출 시스템입니다.

## 입력
<document>
{{document}}
</document>

## 추출 대상
- name: 이름 (필수)
- email: 이메일 (옵션)
- phone: 전화번호 (옵션)
- company: 회사명 (옵션)

## 출력 형식 (JSON만)
{
  "extracted": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "company": "string or null"
  },
  "found_count": number,
  "missing_fields": ["string array"]
}

## 규칙
- 찾지 못한 필드는 null
- 반드시 위 JSON 형식만 출력
- 추측하지 말고 문서에 있는 정보만 추출
```

---

## 8-Point Quality Check 연계

### FORMAT 항목 체크리스트

```markdown
## FORMAT (0-2점)

### 2점 (우수)
- [ ] 출력 형식이 JSON/XML로 명확히 정의됨
- [ ] 완전한 스키마 또는 예시 제공
- [ ] 필수/옵션 필드 구분
- [ ] 데이터 타입 명시
- [ ] 값 범위/enum 제약 명시

### 1점 (보통)
- [ ] 출력 형식 언급되었으나 불완전
- [ ] 예시만 있고 스키마 없음
- [ ] 일부 필드만 정의

### 0점 (미흡)
- [ ] 출력 형식 미정의
- [ ] 모호한 형식 요청 ("JSON으로 주세요")
```

---

## 관련 참조

- [quality-checklist.md](quality-checklist.md) - 8-Point Quality Check (FORMAT 섹션)
- [claude-4x-best-practices.md](claude-4x-best-practices.md) - FORMATTED 원칙
- [technique-priority.md](technique-priority.md) - Prefill Response (섹션 7)
- [anti-patterns.md](anti-patterns.md) - 형식 미지정 안티패턴
