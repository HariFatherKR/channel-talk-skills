/**
 * 채널톡 스니펫 서버 API 템플릿
 * 파일 위치: app/api/channel-talk/snippet/route.ts
 *
 * 스니펫은 상담 화면 우측에 고객 정보를 표시하거나
 * 커스텀 기능(쿠폰 발급, 주문 조회 등)을 추가할 수 있습니다.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// ============================================
// 타입 정의
// ============================================

interface SnippetRequest {
  user: {
    id: string
    memberId?: string
    profile?: {
      name?: string
      email?: string
      mobileNumber?: string
      [key: string]: any
    }
  }
  userChat: {
    id: string
  }
  channel: {
    id: string
  }
  manager?: {
    id: string
    name: string
  }
  snippet: {
    id: string
    name: string
  }
  componentId?: string  // submit 시 클릭된 컴포넌트 ID
  submit?: Record<string, string>  // submit 시 폼 데이터
}

// 스니펫 응답 블록 타입
type SnippetBlock =
  | { type: 'text'; value: string; style?: { bold?: boolean; size?: 'small' | 'medium' | 'large' } }
  | { type: 'label'; title: string; value: string }
  | { type: 'divider' }
  | { type: 'button'; id: string; label: string; style?: 'primary' | 'default' | 'danger' }
  | { type: 'textInput'; id: string; placeholder?: string }
  | { type: 'select'; id: string; options: Array<{ label: string; value: string }> }
  | { type: 'image'; url: string; alt?: string }

interface SnippetResponse {
  version: '2'
  blocks: SnippetBlock[]
}

// ============================================
// 서명 검증 (보안)
// ============================================

function verifySignature(body: string, signature: string): boolean {
  const token = process.env.CHANNEL_TALK_SNIPPET_TOKEN

  if (!token) {
    console.warn('CHANNEL_TALK_SNIPPET_TOKEN is not set')
    return true  // 개발 환경에서는 스킵
  }

  const hmac = crypto.createHmac('sha256', token)
  hmac.update(body)
  const expected = hmac.digest('hex')

  return signature === expected
}

// ============================================
// 메인 핸들러
// ============================================

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature') || ''
  const body = await request.text()

  // 서명 검증
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data: SnippetRequest = JSON.parse(body)

  // componentId가 있으면 submit 요청, 없으면 init 요청
  if (data.componentId) {
    return handleSubmit(data)
  }

  return handleInit(data)
}

// ============================================
// Init 핸들러 (스니펫 초기 로드)
// ============================================

function handleInit(data: SnippetRequest): NextResponse<SnippetResponse> {
  const { user } = data

  return NextResponse.json({
    version: '2',
    blocks: [
      // 헤더
      {
        type: 'text',
        value: `${user.profile?.name || '고객'}님 정보`,
        style: { bold: true, size: 'large' }
      },

      { type: 'divider' },

      // 고객 기본 정보
      {
        type: 'label',
        title: '고객 ID',
        value: user.id
      },
      {
        type: 'label',
        title: '이메일',
        value: user.profile?.email || '-'
      },
      {
        type: 'label',
        title: '전화번호',
        value: user.profile?.mobileNumber || '-'
      },

      { type: 'divider' },

      // 액션 버튼들
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
      },

      { type: 'divider' },

      // 메모 입력
      {
        type: 'text',
        value: '메모',
        style: { bold: true }
      },
      {
        type: 'textInput',
        id: 'memo-input',
        placeholder: '고객 메모 입력...'
      },
      {
        type: 'button',
        id: 'save-memo',
        label: '메모 저장',
        style: 'default'
      }
    ]
  })
}

// ============================================
// Submit 핸들러 (버튼 클릭/폼 제출)
// ============================================

async function handleSubmit(data: SnippetRequest): Promise<NextResponse<SnippetResponse>> {
  const { user, componentId, submit } = data

  switch (componentId) {
    case 'view-orders':
      return await handleViewOrders(user.id)

    case 'issue-coupon':
      return await handleIssueCoupon(user.id)

    case 'save-memo':
      return await handleSaveMemo(user.id, submit?.['memo-input'] || '')

    default:
      return NextResponse.json({
        version: '2',
        blocks: [
          { type: 'text', value: '알 수 없는 요청입니다.' }
        ]
      })
  }
}

// ============================================
// 비즈니스 로직 핸들러
// ============================================

async function handleViewOrders(userId: string): Promise<NextResponse<SnippetResponse>> {
  // TODO: 실제 DB/API에서 주문 조회
  const orders = [
    { id: 'ORD-2024-001', product: '프리미엄 플랜', status: '이용중', date: '2024-01-15' },
    { id: 'ORD-2024-002', product: '추가 시트 5개', status: '완료', date: '2024-01-20' },
  ]

  const orderBlocks: SnippetBlock[] = orders.flatMap(order => [
    {
      type: 'label' as const,
      title: order.id,
      value: `${order.product}`
    },
    {
      type: 'label' as const,
      title: '상태',
      value: `${order.status} (${order.date})`
    },
    { type: 'divider' as const }
  ])

  return NextResponse.json({
    version: '2',
    blocks: [
      { type: 'text', value: '주문 내역', style: { bold: true, size: 'large' } },
      { type: 'divider' },
      ...orderBlocks,
      { type: 'button', id: 'back-to-main', label: '← 돌아가기', style: 'default' }
    ]
  })
}

async function handleIssueCoupon(userId: string): Promise<NextResponse<SnippetResponse>> {
  // TODO: 실제 쿠폰 발급 로직
  const couponCode = `WELCOME-${Date.now().toString(36).toUpperCase()}`

  return NextResponse.json({
    version: '2',
    blocks: [
      { type: 'text', value: '쿠폰 발급 완료!', style: { bold: true, size: 'large' } },
      { type: 'divider' },
      { type: 'label', title: '쿠폰 코드', value: couponCode },
      { type: 'label', title: '할인', value: '10% 할인' },
      { type: 'label', title: '유효기간', value: '발급일로부터 30일' },
      { type: 'divider' },
      { type: 'button', id: 'back-to-main', label: '← 돌아가기', style: 'default' }
    ]
  })
}

async function handleSaveMemo(userId: string, memo: string): Promise<NextResponse<SnippetResponse>> {
  // TODO: 실제 메모 저장 로직
  console.log(`Saving memo for user ${userId}: ${memo}`)

  return NextResponse.json({
    version: '2',
    blocks: [
      { type: 'text', value: '메모가 저장되었습니다.', style: { bold: true } },
      { type: 'label', title: '내용', value: memo || '(빈 메모)' },
      { type: 'divider' },
      { type: 'button', id: 'back-to-main', label: '← 돌아가기', style: 'default' }
    ]
  })
}
