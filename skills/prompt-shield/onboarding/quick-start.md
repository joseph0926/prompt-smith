# Quick Start: 5분 가이드

PromptShield를 5분 안에 시작하세요.

---

## PromptShield란?

```
+-------------------------------------------------------------+
|                     PromptShield                             |
+-------------------------------------------------------------+
|  프롬프트 품질관리 스킬                                       |
|                                                             |
|  LINT Mode: 기존 프롬프트 진단 + 개선 + 테스트 생성          |
|  BUILD Mode: 요구사항에서 프롬프트 설계                      |
|  INTERCEPT: 실시간 프롬프트 개선 파이프라인                   |
|                                                             |
|  7-Point QC로 프롬프트를 운영 가능한 자산으로 변환           |
+-------------------------------------------------------------+
```

---

## 1분: LINT 체험

기존 프롬프트가 있다면 바로 진단해보세요.

### 입력
```
프롬프트 점검해줘:

사용자 피드백을 분석하고 주요 이슈를 추출해줘
```

### 출력 (예시)
```
진단 리포트

점수: 3/10 (등급: D)

Top 3 이슈:
1. 역할 정의 없음
2. 예시 없음
3. 출력 형식 불명확

개선 프롬프트:
[7-Point 충족 개선 버전]
```

---

## 2분: EXPRESS 진단

빠른 점검이 필요할 때:

### 입력
```
빠르게 점검해줘:

[프롬프트 텍스트]
```

### 출력 (예시)
```
Express 진단 리포트

점수: 3/10

Top 3 이슈:
1. 역할 없음
2. 예시 없음
3. 포맷 부분적

한 줄 개선 제안: 역할 + 예시 2개 + JSON 형식 추가
```

---

## 3분: BUILD 체험

새 프롬프트가 필요하다면:

### 입력
```
프롬프트 만들어줘:
고객 문의를 분류하고 우선순위를 부여하는 프롬프트
```

### 프로세스
1. **GATHER**: "어떤 도메인?", "성공 기준?"
2. **CLASSIFY**: 분류 태스크, 중간 복잡도
3. **DESIGN**: 7-Point 설계
4. **DRAFT**: 초안 작성
5. **SELF-LINT**: 8점 이상 검증
6. **TEST**: 테스트 케이스 5개 생성
7. **DELIVER**: 완성 프롬프트 + 가이드

---

## 4분: 7-Point 이해

| # | 항목 | 질문 |
|---|------|------|
| 1 | ROLE | AI 역할이 명확한가? |
| 2 | CONTEXT | 배경/맥락이 충분한가? |
| 3 | INSTRUCTION | 지시가 구체적인가? |
| 4 | EXAMPLE | 예시가 3-5개인가? (Relevant/Diverse/Clear) |
| 5 | FORMAT | 출력 형식이 지정되었는가? |
| 6 | STATE_TRACKING | 상태 관리가 있는가? (멀티스텝) |
| 7 | TOOL_USAGE | 도구 지시가 명확한가? (도구 사용) |

**점수**: 각 항목 0-2점, 10점 만점으로 정규화

---

## 5분: 트리거 키워드

### LINT Mode
- "진단", "분석", "점검"
- "체크", "리뷰"

### EXPRESS Mode
- "빠르게", "간단히", "짧게"

### BUILD Mode
- "만들어줘", "설계", "작성"
- "새 프롬프트"

### INTERCEPT Pipeline
- `/ps:r <프롬프트>` - Review Mode
- `/ps:a <프롬프트>` - Intercept Mode

---

## 다음 단계

### 입문
1. [첫 LINT 튜토리얼](first-lint.md) - 상세 LINT 사용법
2. [첫 BUILD 튜토리얼](first-build.md) - 상세 BUILD 사용법

### 심화
- [7-Point Quality Check](../references/quality-checklist.md)
- [Claude 4.x 베스트 프랙티스](../references/claude-4x-best-practices.md)
- [LINT 상세 가이드](../playbooks/lint/full-lint.md)
- [BUILD 상세 가이드](../playbooks/build/build-mode.md)
- [Intercept Pipeline](../playbooks/intercept/review-mode.md)

### 팀
- [PR 룰](../playbooks/team/prompt-pr.md)
- [오너 가이드](../playbooks/team/owner-guide.md)
- [회귀 테스트](../playbooks/team/regression-testing.md)

---

## 권한 설정 (Allowlist)

커맨드가 차단되면 `~/.claude/settings.json` 또는 프로젝트의 `.claude/settings.local.json`에 다음을 추가하세요:

```json
{
  "permissions": {
    "allow": [
      "Skill(ps:r)",
      "Skill(ps:r:*)",
      "Skill(ps:a)",
      "Skill(ps:a:*)",
      "Skill(ps:lint)",
      "Skill(ps:lint:*)",
      "Skill(ps:build)",
      "Skill(ps:build:*)",
      "Skill(ps:help)",
      "Skill(ps:help:*)"
    ]
  }
}
```

---

## 도움말

문제가 있으시면:
- [SKILL.md](../SKILL.md)에서 상세 문서 확인
- [안티패턴](../references/anti-patterns.md)에서 흔한 실수 확인
- `/ps:help`로 명령어 목록 확인
