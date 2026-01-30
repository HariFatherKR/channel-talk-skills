/**
 * 채널톡 웹훅 핸들러 템플릿
 * 파일 위치: app/api/channel-talk/webhook/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 웹훅 페이로드 타입
interface WebhookPayload {
  event: string
  entity: {
    id: string
    [key: string]: any
  }
}

// 서명 검증
function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.CHANNEL_TALK_SECRET

  if (!secret) {
    console.error('CHANNEL_TALK_SECRET is not set')
    return false
  }

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
    console.error('Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload: WebhookPayload = JSON.parse(body)

  console.log(`Webhook received: ${payload.event}`)

  try {
    switch (payload.event) {
      case 'user_chat.created':
        await handleChatCreated(payload.entity)
        break

      case 'user_chat.opened':
        await handleChatOpened(payload.entity)
        break

      case 'user_chat.closed':
        await handleChatClosed(payload.entity)
        break

      case 'message.created':
        await handleMessageCreated(payload.entity)
        break

      case 'user.created':
        await handleUserCreated(payload.entity)
        break

      case 'user.updated':
        await handleUserUpdated(payload.entity)
        break

      default:
        console.log(`Unhandled event: ${payload.event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// 이벤트 핸들러 함수들
// ============================================

async function handleChatCreated(chat: any) {
  console.log('New chat created:', chat.id)

  // 예: 슬랙 알림 전송
  // await sendSlackNotification({
  //   text: `새 상담이 시작되었습니다. 채팅 ID: ${chat.id}`
  // })

  // 예: DB에 저장
  // await db.chats.create({ data: { channelChatId: chat.id, ... } })
}

async function handleChatOpened(chat: any) {
  console.log('Chat opened:', chat.id)
}

async function handleChatClosed(chat: any) {
  console.log('Chat closed:', chat.id)

  // 예: 만족도 조사 발송
  // await sendSatisfactionSurvey(chat.userId)
}

async function handleMessageCreated(message: any) {
  console.log('New message:', message.id)

  // 예: 메시지 내용 분석
  // if (message.plainText?.includes('긴급')) {
  //   await notifyUrgentMessage(message)
  // }
}

async function handleUserCreated(user: any) {
  console.log('New user:', user.id)

  // 예: CRM에 고객 정보 동기화
  // await syncToCRM(user)
}

async function handleUserUpdated(user: any) {
  console.log('User updated:', user.id)
}

// ============================================
// 유틸리티 함수들 (필요에 따라 구현)
// ============================================

// async function sendSlackNotification(message: { text: string }) {
//   const webhookUrl = process.env.SLACK_WEBHOOK_URL
//   if (!webhookUrl) return
//
//   await fetch(webhookUrl, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(message)
//   })
// }
