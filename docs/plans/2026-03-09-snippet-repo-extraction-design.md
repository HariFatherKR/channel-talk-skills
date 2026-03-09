# Snippet Repo Extraction Design

## Goal

현재 `channel_talk_skills` 저장소 안에 있는 `snippet-test-server/` 앱을 형제 디렉터리의 독립 저장소로 분리하고, 원본 저장소에서는 해당 앱을 완전히 제거한다.

## Current State

- 원본 저장소: `/Users/harifatherkr/Documents/pada/Web/channel_talk_skills`
- 작업 worktree: `/Users/harifatherkr/Documents/pada/Web/channel_talk_skills/.worktree/snippet-test-server`
- 분리 대상 앱: `snippet-test-server/`
- 대상 원격 저장소: `git@github.com:HariFatherKR/pada_channel_talk_snippet.git`

현재 분리 대상 앱은 별도 원격 저장소에 subtree split으로 한 차례 푸시되어 있다. 다만 물리적으로는 여전히 원본 저장소 내부 디렉터리로 존재하므로, 실제 파일 시스템 기준 분리가 필요하다.

## Recommended Approach

subtree 기반으로 새 형제 디렉터리 저장소를 구성한 뒤, 원본 저장소에서 분리 대상 디렉터리를 제거한다.

1. 형제 디렉터리 `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet` 에 독립 저장소를 만든다.
2. 새 저장소가 원격 `main` 과 일치하는지 확인한다.
3. 새 저장소에서 `npm test`, `npm run build` 를 실행해 독립 동작을 검증한다.
4. 원본 저장소에서 `snippet-test-server/` 와 관련 README 안내를 제거한다.
5. 원본 저장소에서도 변경 범위가 의도한 대로인지 검증한다.

이 순서의 장점은 새 저장소 정상화가 먼저 끝나므로, 원본 저장소 삭제 이후의 복구 부담이 낮다는 점이다.

## Scope

제거 대상:

- `snippet-test-server/` 전체 디렉터리
- 루트 `README.md` 의 `Snippet Test Server` 안내 문단

유지 대상:

- 채널톡 스킬 본체
- 기존 공식 문서 아카이브 관련 파일
- `docs/plans/` 의 설계 및 계획 문서
- 이미 원격 저장소에 기록된 분리 이력

## Validation

### 새 저장소 `pada_channel_talk_snippet`

- `git remote -v` 가 `git@github.com:HariFatherKR/pada_channel_talk_snippet.git` 를 가리켜야 한다.
- `npm test` 가 통과해야 한다.
- `npm run build` 가 통과해야 한다.

### 원본 저장소 `channel_talk_skills`

- `snippet-test-server/` 디렉터리가 없어야 한다.
- 루트 `README.md` 에 스니펫 테스트 서버 안내가 없어야 한다.
- `git status` 상 의도한 삭제와 문서 수정만 보여야 한다.

## Risks

- 새 저장소 생성 전에 원본에서 먼저 삭제하면 복구 비용이 커진다.
- 원본 저장소에서 제거한 뒤 루트 README 링크가 남아 있으면 깨진 안내가 된다.
- 새 저장소 검증 없이 이동하면 나중에 독립 배포/개발 환경에서 누락 파일을 발견할 수 있다.

## Non-Goals

- 채널톡 스킬 본체 구조 개편
- 스니펫 앱 기능 추가
- 원격 저장소 히스토리 재작성
