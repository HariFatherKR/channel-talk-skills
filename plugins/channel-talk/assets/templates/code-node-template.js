/**
 * 채널톡 코드노드 템플릿
 *
 * 제한사항:
 * - JavaScript만 지원
 * - 최대 실행 시간: 60초
 * - 사용 가능 라이브러리: axios, crypto
 *
 * 사용 가능한 객체:
 * - memory: 노드 간 데이터 공유 (get, put, save)
 * - context: 실행 환경 정보 (user, userChat) - 읽기 전용
 */

const axios = require('axios')

export const handler = async (memory, context) => {
  // ============================================
  // 1. 컨텍스트에서 정보 가져오기
  // ============================================
  const userId = context.user.id
  const userName = context.user.profile?.name || '고객'
  const chatId = context.userChat.id

  console.log(`User: ${userName} (${userId})`)
  console.log(`Chat: ${chatId}`)

  // ============================================
  // 2. 메모리에서 이전 값 가져오기
  // ============================================
  const previousValue = memory.get('someKey')
  console.log('Previous value:', previousValue)

  // ============================================
  // 3. 외부 API 호출 (예시)
  // ============================================
  try {
    const response = await axios.get('https://api.example.com/data', {
      params: { userId },
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30초 타임아웃
    })

    const data = response.data

    // 결과를 메모리에 저장
    memory.put('apiResult', data)
    memory.put('success', true)

  } catch (error) {
    console.log('API Error:', error.message)
    memory.put('error', error.message)
    memory.put('success', false)
  }

  // ============================================
  // 4. 비즈니스 로직 처리 (예시)
  // ============================================

  // 조건 분기용 플래그 설정
  const orderCount = memory.get('orderCount') || 0
  if (orderCount > 10) {
    memory.put('customerType', 'VIP')
  } else {
    memory.put('customerType', 'REGULAR')
  }

  // ============================================
  // 5. 반드시 save() 호출!
  // ============================================
  memory.save()
}

// ============================================
// 실용적인 예시들
// ============================================

/**
 * 예시 1: 주문 상태 조회
 */
// export const handler = async (memory, context) => {
//   const axios = require('axios')
//
//   try {
//     const response = await axios.get(
//       `https://your-api.com/orders/${context.user.id}`
//     )
//     const orders = response.data
//
//     if (orders.length > 0) {
//       const latest = orders[0]
//       memory.put('hasOrder', true)
//       memory.put('orderNumber', latest.orderNumber)
//       memory.put('orderStatus', latest.status)
//     } else {
//       memory.put('hasOrder', false)
//     }
//   } catch (error) {
//     memory.put('hasOrder', false)
//     memory.put('error', error.message)
//   }
//
//   memory.save()
// }

/**
 * 예시 2: 쿠폰 발급
 */
// export const handler = async (memory, context) => {
//   const axios = require('axios')
//
//   try {
//     const response = await axios.post('https://your-api.com/coupons/issue', {
//       userId: context.user.id,
//       couponType: memory.get('selectedCouponType') || 'WELCOME'
//     })
//
//     memory.put('couponIssued', true)
//     memory.put('couponCode', response.data.couponCode)
//   } catch (error) {
//     memory.put('couponIssued', false)
//     memory.put('errorMessage', error.message)
//   }
//
//   memory.save()
// }

/**
 * 예시 3: 슬랙 알림 전송
 */
// export const handler = async (memory, context) => {
//   const axios = require('axios')
//
//   const slackWebhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
//
//   await axios.post(slackWebhookUrl, {
//     text: `새 상담 요청`,
//     blocks: [
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text: `*고객 ID:* ${context.user.id}\n*상담 ID:* ${context.userChat.id}`
//         }
//       }
//     ]
//   })
//
//   memory.put('slackNotified', true)
//   memory.save()
// }
