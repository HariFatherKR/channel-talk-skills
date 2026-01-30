# 스니펫 (Snippet)

스니펫은 상담 화면 우측에 고객 정보를 표시하거나 커스텀 기능을 추가할 수 있는 기능입니다.

## 스니펫으로 구현 가능한 것들

- VOC를 사내 메신저에 공유하기
- 해당 고객의 주문 내역 확인하기
- 특정 고객에게 쿠폰 발급하기
- 특정 고객에게 문자 발송하기
- 회원 탈퇴 처리하기

## 스니펫 플로우

스니펫에는 두 가지 플로우가 있습니다: **init**과 **submit**

### Init 플로우

상담 화면에 스니펫이 처음 로드될 때 실행됩니다.

```
채널톡 클라이언트 → 채널톡 서버 → 고객사 서버
     ↑                              ↓
     └──────── 스니펫 응답 ←─────────┘
```

1. 상담원이 유저챗에 들어감
2. 채널톡 서버가 고객사 서버에 유저 정보와 함께 요청
3. 고객사 서버가 스니펫 형태로 응답
4. 채널톡 클라이언트에서 스니펫 표시

### Submit 플로우

스니펫에서 버튼을 클릭하거나 폼을 제출할 때 실행됩니다.

```
채널톡 클라이언트 (버튼 클릭) → 채널톡 서버 → 고객사 서버 (액션 처리)
          ↑                                        ↓
          └────────────── 스니펫 응답 ←─────────────┘
```

**예시: 쿠폰 발급**
1. 상담원이 쿠폰 발급 버튼 클릭 (submit)
2. 채널톡 서버가 고객사 서버로 요청 전달
3. 고객사 서버에서 쿠폰 발급 처리
4. 결과를 스니펫 형태로 응답
5. 채널톡 클라이언트에서 결과 표시

## 스니펫 요청 데이터

채널톡 서버가 고객사 서버로 보내는 데이터:

```json
{
  "appUsers": { ... },
  "channel": { ... },
  "user": { ... },
  "userOnline": { ... },
  "manager": { ... },
  "snippet": { ... },
  "componentId": "submit-button",
  "submit": {
    "text-input": "hello"
  }
}
```

### 주요 필드

| 필드 | 설명 |
|------|------|
| `user` | 고객 정보 (ID, 이름, 프로필 등) |
| `manager` | 현재 상담 중인 매니저 정보 |
| `channel` | 채널 정보 |
| `snippet` | 스니펫 설정 정보 |
| `componentId` | submit 시 클릭된 컴포넌트 ID |
| `submit` | submit 시 입력된 폼 데이터 |

## 스니펫 응답 형식

스니펫은 JSON 형식으로 UI 컴포넌트를 정의합니다.

### 기본 구조

```json
{
  "version": "2",
  "blocks": [
    // UI 컴포넌트들
  ]
}
```

### 사용 가능한 컴포넌트

#### Text (텍스트)

```json
{
  "type": "text",
  "value": "주문 정보",
  "style": {
    "bold": true,
    "size": "large"
  }
}
```

#### Label (라벨 + 값)

```json
{
  "type": "label",
  "title": "주문번호",
  "value": "ORD-2024-001"
}
```

#### Button (버튼)

```json
{
  "type": "button",
  "id": "issue-coupon",
  "label": "쿠폰 발급",
  "style": "primary"
}
```

#### Text Input (텍스트 입력)

```json
{
  "type": "textInput",
  "id": "coupon-code",
  "placeholder": "쿠폰 코드 입력"
}
```

#### Select (드롭다운)

```json
{
  "type": "select",
  "id": "coupon-type",
  "options": [
    { "label": "10% 할인", "value": "DISCOUNT_10" },
    { "label": "무료배송", "value": "FREE_SHIPPING" }
  ]
}
```

#### Divider (구분선)

```json
{
  "type": "divider"
}
```

#### Image (이미지)

```json
{
  "type": "image",
  "url": "https://example.com/image.png",
  "alt": "상품 이미지"
}
```

## Next.js에서 스니펫 서버 구현

### API Route 구조

```
app/
  api/
    channel-talk/
      snippet/
        route.ts      # 메인 스니펫 핸들러
```

### 기본 구현

```typescript
// app/api/channel-talk/snippet/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface SnippetRequest {
  user: {
    id: string
    profile?: {
      name?: string
      email?: string
    }
  }
  componentId?: string
  submit?: Record<string, string>
}

export async function POST(request: NextRequest) {
  const body: SnippetRequest = await request.json()

  // init 요청인지 submit 요청인지 확인
  if (body.componentId) {
    return handleSubmit(body)
  }

  return handleInit(body)
}

function handleInit(body: SnippetRequest) {
  const { user } = body

  return NextResponse.json({
    version: '2',
    blocks: [
      {
        type: 'text',
        value: `안녕하세요, ${user.profile?.name || '고객'}님`,
        style: { bold: true, size: 'large' }
      },
      {
        type: 'label',
        title: '고객 ID',
        value: user.id
      },
      {
        type: 'divider'
      },
      {
        type: 'button',
        id: 'view-orders',
        label: '주문 내역 조회',
        style: 'primary'
      },
      {
        type: 'button',
        id: 'issue-coupon',
        label: '쿠폰 발급',
        style: 'default'
      }
    ]
  })
}

async function handleSubmit(body: SnippetRequest) {
  const { user, componentId, submit } = body

  switch (componentId) {
    case 'view-orders':
      return await handleViewOrders(user.id)
    case 'issue-coupon':
      return await handleIssueCoupon(user.id)
    default:
      return NextResponse.json({
        version: '2',
        blocks: [
          { type: 'text', value: '알 수 없는 요청입니다.' }
        ]
      })
  }
}

async function handleViewOrders(userId: string) {
  // 실제로는 DB나 외부 API에서 주문 조회
  const orders = [
    { id: 'ORD-001', product: '상품A', status: '배송완료' },
    { id: 'ORD-002', product: '상품B', status: '배송중' }
  ]

  const orderBlocks = orders.flatMap(order => [
    {
      type: 'label',
      title: order.id,
      value: `${order.product} - ${order.status}`
    }
  ])

  return NextResponse.json({
    version: '2',
    blocks: [
      { type: 'text', value: '주문 내역', style: { bold: true } },
      { type: 'divider' },
      ...orderBlocks
    ]
  })
}

async function handleIssueCoupon(userId: string) {
  // 쿠폰 발급 로직
  const couponCode = `COUPON-${Date.now()}`

  return NextResponse.json({
    version: '2',
    blocks: [
      { type: 'text', value: '쿠폰 발급 완료!', style: { bold: true } },
      { type: 'label', title: '쿠폰 코드', value: couponCode }
    ]
  })
}
```

## 채널톡에 스니펫 등록

1. 채널톡 설정 > 스니펫 설정
2. "스니펫 추가하기" 클릭
3. 스니펫 이름 입력
4. API URL 입력 (예: `https://your-domain.com/api/channel-talk/snippet`)
5. 저장

## 토큰 검증 (보안)

채널톡에서 보낸 요청이 맞는지 검증합니다.

```typescript
import crypto from 'crypto'

function verifySignature(
  body: string,
  signature: string,
  token: string
): boolean {
  const hmac = crypto.createHmac('sha256', token)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature')
  const body = await request.text()
  const token = process.env.CHANNEL_TALK_SNIPPET_TOKEN!

  if (!verifySignature(body, signature || '', token)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)
  // ... 스니펫 처리
}
```

## 스니펫 데모

스니펫 데모를 미리 보려면:
- 스니펫 서버 주소에 `https://snippet-demo.channel.io/` 입력

## 주의사항

1. **빌더사 제한**: 카페24 등 빌더사는 코드 수정이 제한적이어서 별도 서버 필요
2. **모바일 미지원**: 채널톡 모바일 앱에서는 스니펫 사용 불가
3. **위치 고정**: 스니펫 위치는 우측 패널로 고정, 변경 불가
4. **대화 내역 제외**: 채널톡 서버는 대화 내역을 제외한 대부분의 정보 전달

## 스니펫 빌더

코드 레이아웃 미리보기: [스니펫 빌더](https://developers.channel.io/docs/snippet-builder) 사용
