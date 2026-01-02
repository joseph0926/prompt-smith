# State Tracking 상세 가이드

장기 실행 태스크나 멀티스텝 작업에서 상태를 관리하는 방법입니다.

> Claude 4.x 7-Point Quality Check의 6번째 항목

---

## 개요

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE_TRACKING                            │
├─────────────────────────────────────────────────────────────┤
│  목적: 장기 태스크의 진행 상태 추적 및 복구                  │
│                                                             │
│  핵심 요소:                                                  │
│  1. 상태 저장 형식 (JSON 권장)                               │
│  2. 체크포인트 시점                                          │
│  3. 재개 방법                                                │
│  4. 진행률 표시                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 적용 조건

다음 중 하나라도 해당되면 STATE_TRACKING 적용:

- [ ] 3단계 이상 멀티스텝 태스크
- [ ] 10개 이상 항목 순차 처리
- [ ] 세션 중단 가능성 있는 장시간 작업
- [ ] 체크포인트/롤백이 필요한 작업

**해당 없으면 N/A** (점수 계산에서 제외)

---

## 상태 파일 스키마

### 기본 스키마

```json
{
  "task_id": "string - 고유 식별자",
  "status": "pending | in_progress | completed | failed | paused",
  "progress": {
    "total": "number - 전체 항목 수",
    "completed": "number - 완료된 항목 수",
    "current": "string - 현재 처리 중인 항목"
  },
  "checkpoint": "ISO 8601 timestamp - 마지막 체크포인트",
  "errors": [
    {
      "item": "string - 실패한 항목",
      "error": "string - 에러 메시지",
      "timestamp": "ISO 8601"
    }
  ],
  "metadata": {
    "started_at": "ISO 8601",
    "updated_at": "ISO 8601",
    "version": "string - 프롬프트/스크립트 버전"
  }
}
```

### 예시

```json
{
  "task_id": "migration-jest-to-vitest-001",
  "status": "in_progress",
  "progress": {
    "total": 100,
    "completed": 45,
    "current": "src/utils/date.test.ts"
  },
  "checkpoint": "2024-01-15T10:30:00Z",
  "errors": [
    {
      "item": "src/legacy/old.test.ts",
      "error": "Cannot convert dynamic import",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ],
  "metadata": {
    "started_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

---

## 체크포인트 전략

### 시간 기반

```markdown
## Checkpoint Rules
- 매 5분마다 상태 저장
- 작업 시작/종료 시 저장
```

### 항목 기반

```markdown
## Checkpoint Rules
- 매 10개 항목 처리 후 저장
- 에러 발생 시 즉시 저장
```

### 이벤트 기반

```markdown
## Checkpoint Rules
- 각 단계 완료 시 저장
- 외부 API 호출 전후 저장
- 파일 수정 전후 저장
```

### Git 체크포인트

```markdown
## Checkpoint Rules
- 매 10개 파일 수정 후 git commit
- 커밋 메시지: "checkpoint: [task_id] - [progress]"
- 문제 발생 시 해당 커밋으로 롤백
```

---

## 재개 프로토콜

### 기본 프로토콜

```markdown
## Resume Protocol

1. 상태 파일 읽기
   - 파일 존재 확인
   - 스키마 유효성 검증

2. 상태 확인
   - status가 "in_progress" 또는 "paused"인지 확인
   - "completed"면 종료
   - "failed"면 에러 처리 후 재시도 결정

3. 진행 위치 확인
   - progress.completed 값 확인
   - 다음 처리 항목 결정

4. 이어서 실행
   - completed + 1번째 항목부터 시작
   - 처리 완료마다 상태 업데이트
```

### 예시 코드

```markdown
## Resume Steps

1. Read state.json
2. Check status:
   - "completed" → Exit with success
   - "failed" → Review errors, decide retry
   - "in_progress" → Continue from progress.completed
3. Set current = items[progress.completed]
4. Process from current item
5. Update state after each item
6. On completion: status = "completed"
```

---

## 진행률 표시

### 콘솔 출력

```markdown
## Progress Display

Processing: 45/100 (45%)
Current: src/utils/date.test.ts
Errors: 1
ETA: 15 minutes

Last checkpoint: 2024-01-15 10:30:00
```

### 상태 요약

```markdown
## Status Summary

[██████████░░░░░░░░░░] 45/100

✅ Completed: 44
🔄 In Progress: 1
❌ Errors: 1
⏸️ Remaining: 54
```

---

## 에러 처리

### 에러 시 계속 진행

```markdown
## Error Handling: Continue

1. 에러 발생 시:
   - 해당 항목을 errors 배열에 추가
   - progress.completed는 증가하지 않음
   - 다음 항목으로 이동

2. 모든 항목 처리 후:
   - errors 배열 리뷰
   - 필요 시 재처리
```

### 에러 시 중단

```markdown
## Error Handling: Stop

1. 에러 발생 시:
   - status = "failed"
   - 상태 저장
   - 즉시 중단

2. 재시작 시:
   - 실패 원인 해결
   - Resume Protocol 실행
```

### 재시도 로직

```markdown
## Error Handling: Retry

1. 에러 발생 시:
   - 최대 3회 재시도
   - 재시도 간격: 1초, 5초, 30초

2. 3회 실패 시:
   - errors 배열에 추가
   - 다음 항목으로 이동 (또는 중단)
```

---

## 프롬프트 템플릿

```markdown
## State Tracking

### 상태 파일
파일: {{state_file}}

```json
{
  "task_id": "{{task_id}}",
  "status": "pending | in_progress | completed | failed",
  "progress": {
    "total": {{total}},
    "completed": 0,
    "current": ""
  },
  "checkpoint": "",
  "errors": []
}
```

### 체크포인트 규칙
- 매 {{checkpoint_interval}}개 항목 처리 후 상태 저장
- 에러 발생 시 즉시 저장
- 각 체크포인트에서 {{checkpoint_action}}

### 재개 방법
1. {{state_file}} 읽기
2. progress.completed 확인
3. completed 이후 항목부터 계속
4. 완료 시 상태 파일 정리

### 에러 처리
- 에러 발생 시: {{error_action}}
- 재시도 횟수: {{retry_count}}회
```

---

## 점수 기준

| 점수 | 기준 |
|------|------|
| **0점** | 상태 관리 없음 (필요한데) |
| **1점** | 부분적 상태 관리 (진행률만 표시, 구조화 없음) |
| **2점** | 체계적 상태 관리 (JSON 상태 + 체크포인트 + 재개 지원) |

---

## 체크리스트

```markdown
## STATE_TRACKING 체크리스트

### 필수
- [ ] 상태 저장 형식 정의 (JSON 권장)
- [ ] 체크포인트 시점 명시
- [ ] 재개 방법 정의

### 권장
- [ ] 진행률 표시 방법 명시
- [ ] 에러 처리 전략 정의
- [ ] 완료 조건 명확
- [ ] 롤백 방법 정의
```

---

## 관련 참조

- [quality-checklist.md](quality-checklist.md) - 7-Point Quality Check
- [claude-4x-best-practices.md](claude-4x-best-practices.md) - Claude 4.x 가이드
- [tool-usage-guide.md](tool-usage-guide.md) - 도구 사용 가이드
