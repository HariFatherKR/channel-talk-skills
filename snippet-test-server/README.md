# Snippet Test Server

채널톡 스니펫을 Vercel에 배포해 빠르게 검증하기 위한 Next.js 테스트 앱입니다.

## 포함 기능

- `POST /api/channel-talk/snippet`
  - `init` 요청 응답
  - `submit` 요청 응답
- `/`
  - 스니펫 JSON 미리보기
  - 예약 조회 성공/실패 상태 확인

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 미리보기 페이지를 확인할 수 있습니다.

## 테스트

```bash
npm test
npm run build
```

## 채널톡 연결 방법

1. 이 앱을 Vercel에 배포합니다.
2. 채널톡 관리자에서 `Settings > Snippet settings` 로 이동합니다.
3. 스니펫 이름을 입력합니다.
4. API URL에 아래 엔드포인트를 입력합니다.

```text
https://<your-deployment>.vercel.app/api/channel-talk/snippet
```

## 현재 동작

- 예약번호 `RSV-2026-0001` 조회 성공
- 예약번호 `RSV-2026-0002` 조회 성공
- 그 외 예약번호 조회 실패

실제 운영 연동 시에는 `lib/mock-reservations.ts`를 자사 DB 조회 로직으로 교체하면 됩니다.
