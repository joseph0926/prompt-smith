# State Checkpoint 템플릿

장기 태스크나 멀티스텝 작업의 상태를 저장하는 템플릿입니다.

> 7-Point Quality Check의 STATE_TRACKING 항목 지원

---

## 기본 체크포인트 템플릿

```json
{
  "task_id": "[고유 식별자]",
  "status": "pending",
  "progress": {
    "total": 0,
    "completed": 0,
    "current": ""
  },
  "checkpoint": "",
  "errors": [],
  "metadata": {
    "started_at": "",
    "updated_at": "",
    "version": "1.0.0"
  }
}
```

---

## 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| `task_id` | string | 태스크 고유 식별자 |
| `status` | enum | `pending` \| `in_progress` \| `completed` \| `failed` \| `paused` |
| `progress.total` | number | 전체 처리 항목 수 |
| `progress.completed` | number | 완료된 항목 수 |
| `progress.current` | string | 현재 처리 중인 항목명 |
| `checkpoint` | ISO 8601 | 마지막 체크포인트 시간 |
| `errors` | array | 에러 기록 배열 |
| `metadata.started_at` | ISO 8601 | 태스크 시작 시간 |
| `metadata.updated_at` | ISO 8601 | 마지막 업데이트 시간 |
| `metadata.version` | string | 프롬프트/스크립트 버전 |

---

## 사용 예시

### 파일 마이그레이션 태스크

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

### 대량 데이터 처리 태스크

```json
{
  "task_id": "data-processing-batch-042",
  "status": "paused",
  "progress": {
    "total": 1500,
    "completed": 750,
    "current": "record-751"
  },
  "checkpoint": "2024-01-15T14:00:00Z",
  "errors": [],
  "metadata": {
    "started_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T14:00:00Z",
    "version": "2.1.0"
  }
}
```

---

## 프롬프트 통합 템플릿

프롬프트에 State Tracking을 추가할 때 사용:

````markdown
## State Tracking

### 상태 파일
**파일명**: `state.json`

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
- 매 {{interval}}개 항목 처리 후 상태 저장
- 에러 발생 시 즉시 저장
- 각 단계 완료 시 저장

### 재개 방법
1. `state.json` 읽기
2. `status` 확인:
   - `completed` → 종료
   - `failed` → 에러 확인 후 재시도 결정
   - `in_progress` / `paused` → 계속 진행
3. `progress.completed` 다음 항목부터 처리
4. 완료 시 `status = "completed"` 설정
````

---

## 진행률 표시 형식

### 콘솔 출력 형식

```
[태스크: migration-jest-to-vitest-001]
진행률: 45/100 (45%)
현재: src/utils/date.test.ts
에러: 1건
예상 완료: 15분

마지막 체크포인트: 2024-01-15 10:30:00
```

### 진행바 형식

```
[██████████░░░░░░░░░░] 45/100

✅ 완료: 44
🔄 진행: 1
❌ 에러: 1
⏸️ 대기: 54
```

---

## 에러 기록 형식

```json
{
  "item": "src/legacy/old.test.ts",
  "error": "Cannot convert dynamic import",
  "timestamp": "2024-01-15T10:25:00Z",
  "retry_count": 2,
  "stack": "[optional stack trace]"
}
```

---

## 체크포인트 전략

| 전략 | 조건 | 예시 |
|------|------|------|
| 시간 기반 | 일정 시간마다 | 매 5분 |
| 항목 기반 | N개 처리마다 | 매 10개 |
| 이벤트 기반 | 특정 이벤트 발생 시 | 단계 완료, API 호출 |
| Git 기반 | 파일 수정 후 | 매 10개 파일 수정 |

---

## 관련 참조

- [state-tracking-guide.md](../references/state-tracking-guide.md) - 상세 가이드
- [quality-checklist.md](../references/quality-checklist.md) - 7-Point Quality Check
- [prompt-template.md](prompt-template.md) - 프롬프트 템플릿
