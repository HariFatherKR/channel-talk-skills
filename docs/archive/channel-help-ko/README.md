# Channel Help KO Archive

`https://docs.channel.io/help/ko` 문서를 경량 아카이브 형식으로 저장하는 디렉터리입니다.

## What It Contains

- `manifest.json`: 아카이브 메타데이터
- `index.json`: 수집된 문서 목록과 로컬 파일 경로
- `failed-urls.json`: 수집 실패 URL 목록
- `articles/<article-id>.json`: 구조화 문서 데이터
- `articles/<article-id>.md`: 사람이 읽기 쉬운 Markdown 변환본

## Generate

```bash
python3 scripts/archive_channel_help_ko.py
```

기본 출력 경로는 `docs/archive/channel-help-ko/` 입니다.

## Verify

```bash
python3 scripts/archive_channel_help_ko.py --verify
```

검증은 `index.json` 기준으로 각 문서의 JSON/Markdown 파일 존재 여부를 확인합니다.

## Limits

- `help/ko` 범위의 article URL만 수집합니다.
- 이미지와 첨부파일 바이너리는 내려받지 않습니다.
- 본문 안의 이미지 URL은 문자열로만 보존합니다.
- 사이트의 Next.js payload 형식이 바뀌면 파서 수정이 필요할 수 있습니다.
