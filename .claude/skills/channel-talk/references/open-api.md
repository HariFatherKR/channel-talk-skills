# 채널톡 Open API

채널톡 Open API를 통해 유저, 채팅, 메시지 등의 데이터를 조회하고 관리할 수 있습니다.

## 인증

### 인증 방식

채널톡 API는 **Access Key + Secret** 기반 인증을 사용합니다.

```typescript
// 환경변수 설정 (.env.local)
CHANNEL_TALK_ACCESS_KEY=your_access_key
CHANNEL_TALK_SECRET=your_secret
```

### 인증 헤더

```typescript
const headers = {
  'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY,
  'x-access-secret': process.env.CHANNEL_TALK_SECRET,
  'Content-Type': 'application/json'
}
```

### 키 발급 위치

채널톡 설정 > API 인증 및 관리

## API 기본 정보

- **Base URL**: `https://api.channel.io`
- **문서**: https://api-doc.channel.io/

## 주요 엔드포인트

### 유저 (User)

#### 유저 조회

```typescript
// GET /open/v5/users/{userId}
async function getUser(userId: string) {
  const response = await fetch(`https://api.channel.io/open/v5/users/${userId}`, {
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!
    }
  })
  return response.json()
}
```

#### 유저 검색

```typescript
// GET /open/v5/users
async function searchUsers(query: string) {
  const params = new URLSearchParams({ query })
  const response = await fetch(`https://api.channel.io/open/v5/users?${params}`, {
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!
    }
  })
  return response.json()
}
```

#### 유저 정보 수정

```typescript
// PUT /open/v5/users/{userId}
async function updateUser(userId: string, profile: object) {
  const response = await fetch(`https://api.channel.io/open/v5/users/${userId}`, {
    method: 'PUT',
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profile })
  })
  return response.json()
}
```

### 채팅 (UserChat)

#### 채팅 목록 조회

```typescript
// GET /open/v5/user-chats
async function getUserChats(state?: string) {
  const params = new URLSearchParams()
  if (state) params.append('state', state)

  const response = await fetch(`https://api.channel.io/open/v5/user-chats?${params}`, {
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!
    }
  })
  return response.json()
}
```

#### 채팅 상세 조회

```typescript
// GET /open/v5/user-chats/{userChatId}
async function getUserChat(userChatId: string) {
  const response = await fetch(`https://api.channel.io/open/v5/user-chats/${userChatId}`, {
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!
    }
  })
  return response.json()
}
```

### 메시지 (Message)

#### 메시지 전송

```typescript
// POST /open/v5/user-chats/{userChatId}/messages
async function sendMessage(userChatId: string, message: string) {
  const response = await fetch(
    `https://api.channel.io/open/v5/user-chats/${userChatId}/messages`,
    {
      method: 'POST',
      headers: {
        'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
        'x-access-secret': process.env.CHANNEL_TALK_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        blocks: [
          {
            type: 'text',
            value: message
          }
        ]
      })
    }
  )
  return response.json()
}
```

#### 버튼 메시지 전송

```typescript
async function sendButtonMessage(userChatId: string, text: string, buttons: Array<{label: string, value: string}>) {
  const response = await fetch(
    `https://api.channel.io/open/v5/user-chats/${userChatId}/messages`,
    {
      method: 'POST',
      headers: {
        'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
        'x-access-secret': process.env.CHANNEL_TALK_SECRET!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        blocks: [
          { type: 'text', value: text },
          {
            type: 'buttons',
            buttons: buttons.map(btn => ({
              title: btn.label,
              colorVariant: 'blue',
              action: { type: 'native', value: btn.value }
            }))
          }
        ]
      })
    }
  )
  return response.json()
}
```

## 웹훅 (Webhook)

### 웹훅 이벤트 종류

| 이벤트 | 설명 |
|--------|------|
| `user_chat.created` | 새 상담 생성 |
| `user_chat.opened` | 상담 열림 |
| `user_chat.closed` | 상담 종료 |
| `message.created` | 새 메시지 |
| `user.created` | 새 유저 생성 |
| `user.updated` | 유저 정보 수정 |

### Next.js 웹훅 핸들러

```typescript
// app/api/channel-talk/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface WebhookPayload {
  event: string
  entity: Record<string, any>
}

// 서명 검증
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.CHANNEL_TALK_SECRET!
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expected = hmac.digest('hex')
  return signature === expected
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature') || ''
  const body = await request.text()

  // 서명 검증
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: WebhookPayload = JSON.parse(body)

  switch (payload.event) {
    case 'user_chat.created':
      await handleNewChat(payload.entity)
      break
    case 'message.created':
      await handleNewMessage(payload.entity)
      break
    case 'user_chat.closed':
      await handleChatClosed(payload.entity)
      break
  }

  return NextResponse.json({ success: true })
}

async function handleNewChat(chat: any) {
  console.log('New chat created:', chat.id)
  // 슬랙 알림, DB 저장 등
}

async function handleNewMessage(message: any) {
  console.log('New message:', message)
  // 메시지 분석, 자동 응답 등
}

async function handleChatClosed(chat: any) {
  console.log('Chat closed:', chat.id)
  // 만족도 조사 발송 등
}
```

### 웹훅 등록

채널톡 설정 > 웹훅에서 URL 등록

## Next.js API 래퍼 예시

```typescript
// lib/channel-talk.ts
const BASE_URL = 'https://api.channel.io'

async function channelFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'x-access-key': process.env.CHANNEL_TALK_ACCESS_KEY!,
      'x-access-secret': process.env.CHANNEL_TALK_SECRET!,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`Channel Talk API Error: ${response.status}`)
  }

  return response.json()
}

export const channelTalk = {
  // Users
  getUser: (userId: string) =>
    channelFetch(`/open/v5/users/${userId}`),

  searchUsers: (query: string) =>
    channelFetch(`/open/v5/users?query=${encodeURIComponent(query)}`),

  updateUser: (userId: string, profile: object) =>
    channelFetch(`/open/v5/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ profile })
    }),

  // Chats
  getChats: (state?: string) =>
    channelFetch(`/open/v5/user-chats${state ? `?state=${state}` : ''}`),

  getChat: (chatId: string) =>
    channelFetch(`/open/v5/user-chats/${chatId}`),

  // Messages
  sendMessage: (chatId: string, message: string) =>
    channelFetch(`/open/v5/user-chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        blocks: [{ type: 'text', value: message }]
      })
    })
}
```

## 에러 처리

```typescript
async function safeChannelCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    console.error('Channel Talk API Error:', error)
    return null
  }
}

// 사용 예시
const user = await safeChannelCall(() => channelTalk.getUser('user-id'))
```

## 관련 문서

- [Open API 문서](https://api-doc.channel.io/)
- [개발자 문서](https://developers.channel.io/developers/ko)
