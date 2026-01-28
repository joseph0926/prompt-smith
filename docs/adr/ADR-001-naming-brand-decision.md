# ADR-001: Naming/Brand Decision

## Status

**Accepted** (2026-01-28)

## Context

PromptShield는 "Claude Code + MCP 생태계의 Prompt Quality Gate 표준"을 목표로 합니다.

### 기존 네이밍 (변경 전)

| Scope | Previous Name |
|-------|---------------|
| Repository | `prompt-shield` |
| CLI commands | `/ps:r`, `/ps:a`, `/ps:lint`, `/ps:build`, `/ps:eval` |
| MCP server | `prompt-registry` |
| Natural language | `use prompt-shield` |
| npm package | (미정) |

### 결정 네이밍 (변경 후)

| Scope | New Name |
|-------|----------|
| Repository | `prompt-shield` |
| CLI commands | `/ps:r`, `/ps:a`, `/ps:lint`, `/ps:build`, `/ps:eval` |
| MCP server | `prompt-registry` |
| Natural language | `use prompt-shield` |
| npm package | `@prompt-shield/*` (예정) |

### 충돌 리스크

[PromptSmith-OSS/promptsmith](https://github.com/PromptSmith-OSS/promptsmith)가 존재합니다.
- "A prompt engineering solution to manage AI prompts easily"
- 다른 제품이지만 이름이 유사하여 혼동 가능

### 결정 기준

1. **검색 충돌**: Google/npm/GitHub 검색 시 혼동 여부
2. **발음/기억성**: 쉽게 말하고 기억할 수 있는가
3. **의미 명확성**: 도구의 목적이 이름에서 드러나는가
4. **확장성**: 향후 기능 확장 시 이름이 제약이 되지 않는가
5. **CLI 편의성**: 타이핑하기 쉬운가 (`/ps:` prefix는 이미 확립됨)

## Decision

### `prompt-shield`로 변경

**결정**: 프로젝트/브랜드명을 `prompt-shield`에서 `prompt-shield`로 변경합니다.

### 근거

1. **충돌 리스크 해소**
   - PromptSmith-OSS와의 혼동 가능성을 줄이고 검색 충돌을 회피

2. **의미 명확성**
   - "Shield"는 **품질 게이트/방어** 포지셔닝과 일치

3. **CLI prefix 유지**
   - `/ps:`는 그대로 유지하여 학습 비용 최소화

4. **MCP 서버명 분리 유지**
   - `prompt-registry`는 별도 이름으로 유지해 생태계 충돌 최소화

### 향후 변경 조건

다음 상황이 발생하면 재검토:
- 법적 분쟁 또는 상표권 이슈
- npm 패키지명 충돌 (`@prompt-shield/*` 선점 등)
- 커뮤니티에서 지속적인 혼동 보고

## Alternatives Considered

### Option A: promptgate

```
Repository: promptgate
CLI: /pg:r, /pg:lint, ...
```

**장점**: "Gate"가 품질 게이트 목적을 명확히 표현
**단점**: CLI prefix 변경 필요, 기존 문서/사용자 마이그레이션 비용

### Option B: promptops-gate

```
Repository: promptops-gate
CLI: /pog:r, /pog:lint, ...
```

**장점**: PromptOps 표준 포지셔닝과 일치
**단점**: 이름이 길고 타이핑 불편, "ops"가 운영보다는 개발 도구에 가까움

### Option C: ps (minimal)

```
Repository: ps
CLI: /ps:r, /ps:lint, ... (유지)
```

**장점**: CLI와 일치, 짧음
**단점**: 너무 일반적, 검색 불가, npm 충돌 가능성 높음

## Consequences

### Positive

- 검색 혼동 감소 및 브랜드 인지도 개선
- "Gate/Shield" 포지셔닝이 명확해짐
- `/ps:` 유지로 사용성 변화 최소화

### Negative

- 리브랜딩에 따른 문서/배포 경로 변경 비용 발생
- 기존 사용자/링크 호환성 관리 필요

### Neutral

- 리포지토리/마켓플레이스 리다이렉트로 단계적 마이그레이션 가능
- 명령어 `/ps:`는 동일하게 유지

## References

- [PromptSmith-OSS](https://github.com/PromptSmith-OSS/promptsmith)
- [.temp.docs/0_start_here.md](../../.temp.docs/0_start_here.md) - 네이밍 충돌 리스크 언급
