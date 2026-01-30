# Channel Talk Skills

[English](README.en.md) | **한국어**

Channel Talk Skills는 채널톡의 모든 기능을 Claude Code에서 쉽게 구현할 수 있도록 도와주는 플러그인 마켓플레이스입니다.

## How it works

채널톡 관련 작업을 시작하면, 스킬이 자동으로 활성화됩니다. "ALF 워크플로우 만들어줘", "스니펫 개발해줘", "SDK 연동해줘" 같은 요청을 하면 스킬이 해당 기능의 레퍼런스 문서를 참조하여 코드를 생성합니다.

환경 설정부터 코드 생성, API 테스트까지 채널톡 개발에 필요한 모든 과정을 안내합니다. Next.js/React 프로젝트 구조에 맞춰 적절한 위치에 파일을 생성하고, 템플릿을 활용해 빠르게 구현할 수 있습니다.

## Installation

### Claude Code (via Plugin Marketplace)

Claude Code에서 마켓플레이스를 먼저 등록합니다:

```bash
/plugin marketplace add HariFatherKR/channel-talk-skills
```

그 다음 플러그인을 설치합니다:

```bash
/plugin install channel-talk@channel-talk-plugins
```

### Verify Installation

설치 확인:

```bash
/help
```

```
# Should see:
# /channel-talk - 채널톡 기능 구현 도우미
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# SDK 연동 (프론트엔드)
# 발급: 채널톡 대시보드 > 일반 설정 > 버튼 설치 및 설정 > 채널톡 버튼 설치
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=your_plugin_key_here

# Open API (백엔드)
# 발급: 채널톡 대시보드 > 보안 및 개발 > API 인증 및 관리
CHANNEL_TALK_ACCESS_KEY=your_access_key_here
CHANNEL_TALK_SECRET=your_secret_here

# 스니펫 (선택)
CHANNEL_TALK_SNIPPET_TOKEN=your_snippet_token_here
```

## Updating

플러그인 업데이트:

```bash
/plugin update channel-talk@channel-talk-plugins
```

마켓플레이스 업데이트:

```bash
/plugin marketplace update channel-talk-plugins
```

## The Basic Workflow

1. **환경 확인** - `.env.local`에서 인증 정보 확인. 없으면 설정 안내.

2. **요청 분류** - 사용자 요청을 분석하여 ALF, 코드노드, 스니펫, Open API, SDK 중 해당 기능 파악.

3. **레퍼런스 참조** - 해당 기능의 상세 문서를 읽고 요구사항에 맞는 구현 방식 결정.

4. **코드 생성** - 템플릿을 기반으로 Next.js 프로젝트 규칙에 맞춰 코드 생성.

5. **테스트** - `scripts/channel-api.py`로 API 호출 테스트 및 검증.

**스킬이 자동으로 적절한 기능을 선택합니다.** 그냥 원하는 것을 말하면 됩니다.

## What's Inside

### 지원 기능

| 기능 | 설명 | 예시 |
|------|------|------|
| **ALF 태스크** | 워크플로우 자동화, 챗봇 로직 | "환불 요청 시 담당자 알림" |
| **코드노드** | 워크플로우 내 커스텀 JavaScript 로직 | "외부 API 호출해서 데이터 가져오기" |
| **스니펫** | 상담원 UI 커스텀 패널 | "고객 주문 내역 조회 패널" |
| **Open API** | 서버 사이드 데이터 조회/조작 | "메시지 발송, 사용자 조회" |
| **SDK 연동** | 프론트엔드 채팅 버튼, 사용자 연동 | "로그인 사용자 정보 연동" |

## Philosophy

- **자동화** - 반복적인 설정과 보일러플레이트 코드 자동 생성
- **일관성** - Next.js 프로젝트 규칙에 맞는 파일 구조 유지
- **테스트 가능** - API 테스트 도구로 즉시 검증
- **문서 기반** - 공식 문서를 레퍼런스로 활용하여 정확한 구현

## Contributing

1. 레포지토리 포크
2. 브랜치 생성
3. 레퍼런스 문서 또는 템플릿 개선
4. PR 제출

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: https://github.com/HariFatherKR/channel-talk-skills/issues
- **채널톡 공식 문서**: https://developers.channel.io/
