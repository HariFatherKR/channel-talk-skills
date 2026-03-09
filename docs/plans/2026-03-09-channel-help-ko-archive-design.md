# Channel Help KO Archive Design

## Goal

`https://docs.channel.io/help/ko` 전체를 경량 아카이브 형식으로 로컬 보관한다. 결과물은 사람이 읽기 쉬운 Markdown과 재가공 가능한 JSON을 함께 제공하고, 이후 다시 실행할 수 있는 수집 스크립트를 포함한다.

## Scope

- 대상 범위: `https://docs.channel.io/help/ko` 및 그 하위 `articles/` 문서
- 산출 형식: 문서별 `json`, 문서별 `md`, 전체 `index.json`
- 수집 방식: 페이지 HTML에서 Next.js 데이터 조각을 추출해 메타데이터와 본문 구조를 파싱
- 제외 범위: 이미지/첨부파일 바이너리 다운로드, 브라우저 렌더링 복제, `help/ko` 외 도메인 전체 수집

## Archive Layout

아카이브 루트는 `docs/archive/channel-help-ko/` 로 둔다.

- `index.json`: 전체 문서 인덱스, 수집 시각, 총 문서 수, 원문 URL, 로컬 파일 경로
- `manifest.json`: 수집 모드, 루트 URL, 생성 스크립트 버전, 제약사항
- `README.md`: 사용법과 구조 설명
- `articles/<article-id>.json`: 구조화 아티클 데이터
- `articles/<article-id>.md`: 사람이 읽기 쉬운 변환본

파일명은 slug 대신 `article-id` 기준으로 관리한다. URL slug 변경에 비해 식별자가 더 안정적이기 때문이다.

## Data Model

각 아티클 JSON에는 다음 정보를 담는다.

- `id`, `url`, `path`, `language`
- `title`, `summary`, `category`, `topics`
- `author`, `createdAt`, `updatedAt`, `revisionId`
- `coverImageUrl`
- `content`: 원문 블록 구조
- `plaintext`: 검색용 평문 본문
- `faqs`, `qnas`
- `links`: 본문에서 발견한 내부/외부 링크

Markdown 변환본에는 제목, 원문 URL, 주요 메타데이터, 평문 본문, FAQ/QnA를 포함한다.

## Collection Strategy

수집은 루트 페이지에서 시작한다.

1. `help/ko` 페이지 HTML을 가져온다.
2. HTML 안의 `__next_f.push(...)` 스크립트 조각을 추출한다.
3. 데이터 안에서 아티클 메타데이터와 내부 링크를 찾는다.
4. `help/ko/articles/...` URL을 큐에 넣어 순회한다.
5. 각 아티클 페이지에서 동일한 방식으로 구조화 데이터를 추출한다.
6. JSON과 Markdown을 저장하고 인덱스를 갱신한다.

이미지 URL은 문자열로만 보존하고, 파일은 내려받지 않는다.

## Risks

- Next.js 내부 데이터 포맷이 바뀌면 파서가 깨질 수 있다.
- 일부 페이지는 링크만으로는 발견되지 않을 수 있어 보조 탐색이 필요할 수 있다.
- 문서 수가 많아 수집 시간이 길 수 있다.

## Validation

- 스크립트 실행 후 `manifest.json`, `index.json`, 문서별 `json`/`md` 파일이 생성되어야 한다.
- `index.json`의 문서 수와 실제 생성된 문서 파일 수가 일치해야 한다.
- 샘플 문서 몇 개에 대해 제목, URL, 평문 본문, FAQ/QnA가 비어 있지 않은지 확인한다.
- 실패한 URL은 별도 목록으로 남겨 재시도 가능하게 한다.

## Implementation Notes

- 수집 스크립트는 표준 라이브러리 위주로 작성해 의존성을 줄인다.
- HTML 파싱은 `html.parser` 또는 정규식 기반의 최소 구현으로 시작한다.
- 데이터 추출 로직은 테스트 가능한 순수 함수로 분리한다.
