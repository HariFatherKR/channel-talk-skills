# Snippet Test Server Design

## Goal

채널톡 스니펫을 실제 운영 환경에 붙이기 전에, Vercel에 배포해 동작을 검증할 수 있는 최소 서버를 만든다. 이 서버는 채널톡 스니펫 API 엔드포인트와 브라우저 테스트 페이지를 함께 제공한다.

## Scope

포함 범위:

- 채널톡 스니펫 `init` 요청 처리
- 채널톡 스니펫 `submit` 요청 처리
- 가짜 예약 데이터 조회
- 브라우저 테스트 페이지
- Vercel 배포 가능 구조

제외 범위:

- 실제 DB 연결
- 실제 채널톡 토큰 서명 검증
- 인증/권한 처리
- 운영 반영 수준의 관리 기능

## Recommended Approach

Next.js App Router 기반의 작은 앱으로 구성한다.

- `POST /api/channel-talk/snippet` 에서 채널톡 스니펫 요청을 받는다.
- `/` 테스트 페이지에서 `init`, `submit 성공`, `submit 실패`를 재현한다.
- 예약 데이터는 `lib/mock-reservations.ts` 의 상수로 관리한다.
- 스니펫 응답 JSON 생성 로직은 `lib/snippet.ts` 에 분리한다.

이 구조는 Vercel 배포가 간단하고, 나중에 실제 DB 연결 시 mock 레이어만 교체하면 된다.

## App Structure

- `app/api/channel-talk/snippet/route.ts`
- `app/page.tsx`
- `lib/mock-reservations.ts`
- `lib/snippet.ts`
- 필요 시 `types/snippet.ts`

## Test Scenarios

### 1. init

- 상담원이 채팅방을 열었을 때의 초기 응답
- 기본 안내 문구, 예약번호 입력창, 조회 버튼 표시

### 2. submit 성공

- 예약번호 입력 후 조회 성공
- 예약자명, 예약일시, 상태, 상품명, 상담 유도 문구 표시

### 3. submit 실패

- 존재하지 않는 예약번호 입력
- 예약을 찾을 수 없다는 안내와 상담 유도 버튼 표시

## Risks

- 채널톡 스니펫 JSON 포맷을 잘못 맞추면 실제 관리자 화면에서 렌더링되지 않을 수 있다.
- 브라우저 테스트 페이지가 실제 채널톡 렌더링과 완전히 같지는 않다.

## Validation

- 로컬에서 테스트 페이지로 `init / submit 성공 / submit 실패`를 확인할 수 있어야 한다.
- 스니펫 API가 JSON 응답을 안정적으로 반환해야 한다.
- Vercel 배포 후 공개 URL을 채널톡 스니펫 설정에 넣어 테스트할 수 있어야 한다.
