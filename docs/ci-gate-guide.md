# CI Gate Guide

> PromptShield CI Quality Gate 사용 가이드

## 개요

PromptShield CI Gate는 PR 머지 전에 프롬프트 품질을 검증합니다.
품질 기준 미달 시 PR이 차단됩니다.

## 로컬에서 CI와 동일하게 실행

### 기본 실행

```bash
# 저장소 루트에서 실행
./scripts/ci-lint.sh
```

### 필수 의존성

- `jq`: JSON 파싱용 (config 읽기)

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 설정 파일

`ps.config.json`에서 threshold를 조정할 수 있습니다:

```json
{
  "lint": {
    "minScoreCI": 6,      // CI Gate 기준 (미달 시 FAIL)
    "minScoreWarn": 4,    // 경고 기준
    "maxScore": 10        // 최대 점수
  },
  "ci": {
    "failOnThresholdBreach": true,
    "maxFailuresShown": 5
  }
}
```

## Exit Codes

| Code | 의미 |
|------|------|
| 0 | 모든 프롬프트가 threshold 충족 (PASS) |
| 1 | 하나 이상의 프롬프트가 threshold 미달 (FAIL) |
| 2 | 설정/실행 오류 |

## 엔터프라이즈 운영 체크리스트

- **Branch Protection**: PR 필수 체크에 `CI Gate` 추가
- **permissions 최소화**: 기본 `contents: read`로 시작, 필요 시만 확장
- **Action pinning**: tag 고정(최소) 또는 SHA pinning(권장)
- **Untrusted PR 정책**: `pull_request_target` 사용 시 secrets 접근 금지/격리
- **아티팩트 보관**: 실패 로그/리포트 보관 기간 명시
- **동시성 관리**: `concurrency`로 중복 실행 취소

## 점수 산정 기준

| 항목 | 점수 | 설명 |
|------|------|------|
| Role/Persona | +2 | `you are`, `act as`, `role:`, `persona:` |
| Context | +2 | `context:`, `background:`, `given:`, `##` |
| Instructions | +2 | `instruction:`, `task:`, `step:`, `##` |
| Examples | +2 | `example:`, `for instance:`, `e.g.`, ``` |
| Output Format | +2 | `format:`, `output:`, `response:`, `##` |

**최대 점수**: 10점

## 문제 해결

### CI에서 실패했을 때

1. 로컬에서 동일하게 재현:
   ```bash
   ./scripts/ci-lint.sh
   ```

2. 상세 분석:
   ```bash
   # Claude Code에서
   /ps:lint
   ```

3. 실패한 프롬프트 개선 후 재커밋

### Threshold 조정이 필요한 경우

팀/프로젝트 상황에 따라 `ps.config.json`의 `minScoreCI`를 조정하세요.

```json
{
  "lint": {
    "minScoreCI": 4  // 더 관대한 기준
  }
}
```

## 참고

- [ROADMAP.md](../ROADMAP.md) - 전체 로드맵
- [ARCHITECTURE.md](../ARCHITECTURE.md) - 아키텍처 개요
