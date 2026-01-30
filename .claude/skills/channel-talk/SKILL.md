---
name: channel-talk
description: 채널톡 기능 구현을 도와줍니다. ALF 태스크, 코드노드, 스니펫, Open API, SDK 연동 작업 시 사용하세요. 채널톡 관련 코드 생성, 파일 수정, API 호출을 지원합니다.
---

# 채널톡 개발 도우미

채널톡의 모든 기능(ALF, 코드노드, 스니펫, Open API, SDK)을 Next.js/React 프로젝트에 구현하는 것을 도와줍니다.

## 환경 확인

1. `.env.local` 파일에서 인증 정보 확인
2. 없으면 `assets/env.local.example` 파일을 프로젝트 루트에 복사하여 설정 안내
3. 키 발급 위치:
   - **Plugin Key**: 일반 설정 > 버튼 설치 및 설정 > 채널톡 버튼 설치
   - **Access Key/Secret**: 보안 및 개발 > API 인증 및 관리

## 요청 분류

사용자 요청을 분석하여 해당하는 기능 파악:

| 키워드 | 기능 | 참조 문서 |
|--------|------|----------|
| ALF, 워크플로우, 자동화, 챗봇 | ALF 태스크 | [references/alf-task.md](references/alf-task.md) |
| 코드노드, 스크립트, 커스텀 로직 | 코드노드 | [references/code-node.md](references/code-node.md) |
| 스니펫, 상담원 UI, 고객정보 패널 | 스니펫 | [references/snippet.md](references/snippet.md) |
| API, 데이터 조회, 웹훅, 메시지 | Open API | [references/open-api.md](references/open-api.md) |
| SDK, 프론트엔드, 채팅 버튼, 부트 | SDK 연동 | [references/sdk.md](references/sdk.md) |

## 작업 흐름

1. 해당 reference 문서 읽기
2. 요구사항에 맞는 코드/설정 생성
3. 적절한 위치에 파일 생성/수정
4. 필요시 `scripts/channel-api.py`로 API 테스트

## Next.js 프로젝트 규칙

- **API Routes**: `app/api/channel-talk/` 하위에 생성
- **컴포넌트**: `components/channel-talk/` 하위에 생성
- **타입 정의**: `types/channel-talk.ts`에 정의
- **환경변수**: `.env.local`에 저장

## 템플릿 활용

`assets/templates/` 폴더의 템플릿을 기반으로 코드 생성:
- `webhook-handler.ts` - 웹훅 수신 API Route
- `alf-workflow.json` - ALF 워크플로우 구조
- `code-node-template.js` - 코드노드 기본 템플릿
- `snippet-component.tsx` - 스니펫 서버 컴포넌트
- `sdk-init.tsx` - SDK 초기화 컴포넌트

## API 호출 테스트

```bash
# 사용자 목록 조회
python scripts/channel-api.py users list

# 메시지 전송
python scripts/channel-api.py message send --chat-id <chat_id> --message "테스트"

# 웹훅 테스트
python scripts/channel-api.py webhook test
```

## 주요 작업 예시

### ALF 태스크 생성
"고객이 환불 요청하면 담당자에게 알림 보내줘"
→ ALF 워크플로우 JSON 생성 + 코드노드 작성

### 스니펫 개발
"상담원이 고객 주문 내역 볼 수 있게 해줘"
→ Next.js API Route + 스니펫 응답 포맷 구현

### SDK 연동
"로그인한 사용자 정보를 채널톡에 연동해줘"
→ ChannelIO boot 설정 + profile 연동 코드

### 웹훅 처리
"새 상담이 들어오면 슬랙에 알림 보내줘"
→ 웹훅 수신 API Route + 슬랙 연동 코드
