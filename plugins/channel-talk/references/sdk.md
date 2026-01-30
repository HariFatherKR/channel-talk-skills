# 채널톡 SDK

프론트엔드에서 채널톡 채팅 위젯을 연동하는 방법입니다.

## Plugin Key 발급

채널톡 대시보드에서 Plugin Key를 발급받습니다:

1. [app.channel.io](https://app.channel.io) 로그인
2. 좌측 메뉴 **일반 설정** > **버튼 설치 및 설정** 클릭
3. **채널톡 버튼 설치** 섹션에서 Plugin Key 확인
4. 설치 코드 내 `pluginKey` 값 복사

```
// 설치 코드 예시에서 pluginKey 찾기
ChannelIO('boot', {
  "pluginKey": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // <- 이 값
});
```

## 설치

### NPM

```bash
npm install @channel.io/channel-web-sdk-loader
```

### Script 태그

```html
<script>
  (function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
</script>
```

## Next.js 연동

### SDK 초기화 컴포넌트

```typescript
// components/channel-talk/ChannelTalkProvider.tsx
'use client'

import { useEffect } from 'react'
import * as ChannelService from '@channel.io/channel-web-sdk-loader'

interface ChannelTalkProviderProps {
  children: React.ReactNode
  pluginKey: string
  user?: {
    id: string
    profile?: {
      name?: string
      email?: string
      mobileNumber?: string
      [key: string]: any
    }
  }
}

export function ChannelTalkProvider({
  children,
  pluginKey,
  user
}: ChannelTalkProviderProps) {
  useEffect(() => {
    ChannelService.loadScript()

    const bootOption: ChannelService.BootOption = {
      pluginKey,
    }

    // 로그인 유저인 경우 프로필 연동
    if (user) {
      bootOption.memberId = user.id
      bootOption.profile = user.profile
    }

    ChannelService.boot(bootOption)

    return () => {
      ChannelService.shutdown()
    }
  }, [pluginKey, user])

  return <>{children}</>
}
```

### App에 적용

```typescript
// app/layout.tsx
import { ChannelTalkProvider } from '@/components/channel-talk/ChannelTalkProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <ChannelTalkProvider
          pluginKey={process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY!}
        >
          {children}
        </ChannelTalkProvider>
      </body>
    </html>
  )
}
```

### 로그인 유저 연동

```typescript
// app/layout.tsx (로그인 상태에 따른 연동)
import { auth } from '@/lib/auth'
import { ChannelTalkProvider } from '@/components/channel-talk/ChannelTalkProvider'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  const channelUser = session?.user ? {
    id: session.user.id,
    profile: {
      name: session.user.name,
      email: session.user.email,
    }
  } : undefined

  return (
    <html lang="ko">
      <body>
        <ChannelTalkProvider
          pluginKey={process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY!}
          user={channelUser}
        >
          {children}
        </ChannelTalkProvider>
      </body>
    </html>
  )
}
```

## Boot 옵션

```typescript
interface BootOption {
  // 필수
  pluginKey: string

  // 회원 연동
  memberId?: string           // 회원 고유 ID
  memberHash?: string         // HMAC 해시 (보안용)

  // 프로필
  profile?: {
    name?: string
    email?: string
    mobileNumber?: string
    avatarUrl?: string
    [key: string]: any       // 커스텀 필드
  }

  // UI 설정
  hideChannelButtonOnBoot?: boolean  // 버튼 숨김
  zIndex?: number                     // z-index

  // 언어
  language?: 'ko' | 'en' | 'ja'
}
```

## SDK 메서드

### 채팅창 열기/닫기

```typescript
import * as ChannelService from '@channel.io/channel-web-sdk-loader'

// 채팅창 열기
ChannelService.showMessenger()

// 채팅창 닫기
ChannelService.hideMessenger()

// 채팅 버튼 표시/숨김
ChannelService.showChannelButton()
ChannelService.hideChannelButton()
```

### 프로필 업데이트

```typescript
// 로그인 후 프로필 업데이트
ChannelService.updateUser({
  profile: {
    name: '홍길동',
    email: 'hong@example.com',
    mobileNumber: '010-1234-5678',
    // 커스텀 필드
    plan: 'premium',
    signupDate: '2024-01-15'
  }
})
```

### 이벤트 트래킹

```typescript
// 이벤트 전송
ChannelService.track('Purchase', {
  productName: '프리미엄 플랜',
  price: 99000,
  currency: 'KRW'
})

// 페이지뷰 트래킹
ChannelService.track('PageView', {
  page: '/products/123'
})
```

### 이벤트 리스너

```typescript
// 채팅창 열림/닫힘
ChannelService.onShowMessenger(() => {
  console.log('채팅창 열림')
})

ChannelService.onHideMessenger(() => {
  console.log('채팅창 닫힘')
})

// 읽지 않은 메시지 수 변경
ChannelService.onBadgeChanged((unread: number) => {
  console.log('읽지 않은 메시지:', unread)
})

// URL 클릭
ChannelService.onUrlClicked((url: string) => {
  console.log('클릭된 URL:', url)
})
```

## 커스텀 버튼

기본 채팅 버튼 대신 커스텀 버튼 사용:

```typescript
// components/channel-talk/CustomChatButton.tsx
'use client'

import * as ChannelService from '@channel.io/channel-web-sdk-loader'
import { useState, useEffect } from 'react'

export function CustomChatButton() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    ChannelService.onBadgeChanged((count) => {
      setUnreadCount(count)
    })
  }, [])

  const handleClick = () => {
    ChannelService.showMessenger()
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full"
    >
      💬 상담하기
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full px-2">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
```

```typescript
// Boot 시 기본 버튼 숨김
ChannelService.boot({
  pluginKey: 'YOUR_PLUGIN_KEY',
  hideChannelButtonOnBoot: true
})
```

## 회원 해시 (보안)

서버에서 회원 해시 생성:

```typescript
// app/api/channel-talk/member-hash/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = process.env.CHANNEL_TALK_SECRET!
  const hash = crypto
    .createHmac('sha256', secret)
    .update(session.user.id)
    .digest('hex')

  return NextResponse.json({ memberHash: hash })
}
```

클라이언트에서 사용:

```typescript
useEffect(() => {
  async function bootWithHash() {
    const res = await fetch('/api/channel-talk/member-hash')
    const { memberHash } = await res.json()

    ChannelService.boot({
      pluginKey: 'YOUR_PLUGIN_KEY',
      memberId: userId,
      memberHash,
      profile: { name, email }
    })
  }

  bootWithHash()
}, [])
```

## 환경변수

```bash
# .env.local
NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=your_plugin_key
CHANNEL_TALK_SECRET=your_secret  # 서버용 (member hash 생성)
```

## 주의사항

1. `pluginKey`는 클라이언트에서 사용하므로 `NEXT_PUBLIC_` prefix 필요
2. `secret`은 서버에서만 사용 (member hash 생성용)
3. SSR 환경에서는 `useEffect` 내에서 초기화
4. `shutdown()` 호출로 메모리 누수 방지

## 관련 문서

- [SDK 공식 문서](https://developers.channel.io/docs/web-sdk)
- [NPM 패키지](https://www.npmjs.com/package/@channel.io/channel-web-sdk-loader)
