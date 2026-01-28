# Examples

PromptShield 사용 예시(입력/출력 스케치). 실제 출력은 모드/컨텍스트에 따라 달라질 수 있습니다.

## Example 1: LINT (진단)

Input:
```
/ps:lint 사용자 피드백을 3가지 이슈로 요약해줘
```

Output (요약):
- 점수 + Top 3 이슈
- 개선된 프롬프트(ROLE/CONTEXT/FORMAT 보강)
- 테스트 케이스 5개

Output (샘플 포맷):
```
## 점수: 5/10 → 8/10

## Top 3 Issues
1. ROLE 미정의
2. FORMAT 모호
3. EXAMPLE 부재

### 원본 프롬프트
> 사용자 피드백을 3가지 이슈로 요약해줘

### 개선된 프롬프트 (전문)
You are a customer insights analyst.
Summarize the feedback into exactly 3 issues.

## Output Format
- Issue: <short title>
  Evidence: <direct quote>
  Impact: <one sentence>

## Constraints
- Do not add new information.
- Use only the provided feedback.

## Success Criteria
- [ ] Exactly 3 issues
- [ ] Each issue has Evidence and Impact

### 변경사항
- [+] ROLE 추가
- [+] FORMAT 명시
- [+] SUCCESS_CRITERIA 추가

### 테스트 케이스
1) 일반 케이스
2) 엣지 케이스
3) 인젝션 케이스
4) 도메인 케이스
5) 요약 길이 제한 케이스
```

## Example 2: BUILD (설계)

Input:
```
/ps:build 고객지원 티켓을 분류하는 프롬프트를 설계해줘
```

Output (요약):
- Role/Context/Instructions/Examples/Output Format/Success Criteria 포함
- JSON 구조화 출력 스키마 제시

Output (샘플 포맷):
```
# Ticket Classifier Prompt

## Role
You are a support triage specialist.
Your goal is to classify support tickets for routing.

## Context
- Domain: SaaS customer support
- Categories: Bug, Billing, Feature Request, Account

## Instructions
1. Read the ticket text.
2. Select the best category.
3. Provide a brief rationale.

## Examples
Input: "결제 영수증이 필요합니다."
Output: {"category":"Billing","confidence":0.92,"rationale":"요금/결제 문의"}

## Output Format (JSON only)
{"category":"string","confidence":0.0-1.0,"rationale":"string"}

## Success Criteria
- [ ] Valid JSON only
- [ ] Category from allowed list
- [ ] Rationale <= 1 sentence
```

## Example 3: Review (리뷰 모드)

Input:
```
/ps:r JSON 파싱 함수를 작성해줘
```

Output (요약):
- Express LINT 점수 비교
- 개선된 프롬프트 제안 + 변경사항 표시
- 진행 여부 확인 (y/n/e)

Output (샘플 포맷):
```
┌─────────────────────────────────────────────────────────────┐
│ Express LINT 결과                                            │
├─────────────────────────────────────────────────────────────┤
│ 원본 점수: 3/10 → 개선 점수: 8/10 (+5)                       │
└─────────────────────────────────────────────────────────────┘

### 원본 프롬프트
> JSON 파싱 함수를 작성해줘

### 개선된 프롬프트 (전문)
You are a senior Python engineer.
Write a function that parses a JSON string into a dict.
If parsing fails, return None and log the error.

## Output Format
- Function with type hints
- Includes docstring
- Handles errors gracefully

### 변경사항
- [+] ROLE 추가
- [+] FORMAT 명시
- [~] INSTRUCTION 구체화

### 진행하시겠습니까? (y/n/e)
```

## Example 4: Intercept (자동 적용)

Input:
```
/ps:a 로그 파일에서 에러 라인만 추출해줘
```

Output (요약):
- Express LINT 결과 요약
- 개선된 프롬프트 자동 적용 후 즉시 실행

Output (샘플 포맷):
```
[PromptShield] 활성화됨 (4→7점)

실행 프롬프트 (참고용):
You are a log analyst.
Extract only lines that contain errors from the log text.
Return the result as a plain list of lines, no extra commentary.
```
