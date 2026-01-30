# 코드노드 (Code Node)

코드노드는 ALF 워크플로우 내에서 JavaScript 코드를 실행할 수 있는 노드입니다.

## 제한사항

- **지원 언어**: JavaScript만 지원
- **최대 실행 시간**: 60초
- **외부 라이브러리**: `axios`, `crypto`만 사용 가능

### 사용 가능한 JavaScript 객체

```javascript
// Built-in Objects
JSON, Math, Date, Array, Object, String, Number, Boolean, RegExp, Error, TypeError, ReferenceError, SyntaxError

// Utility Functions
parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, encodeURI, decodeURI
```

### 제한된 함수

```javascript
// 사용 불가
require, process, global, Buffer, eval, Function, setTimeout, setInterval, clearTimeout, clearInterval, setImmediate, clearImmediate
```

## 코드 작성 방법

### 기본 구조

```javascript
export const handler = async (memory, context) => {
  // 코드 작성
}
```

### Memory 객체

노드 간 데이터를 공유하고 저장하는 인터페이스입니다.

| 메서드 | 설명 |
|--------|------|
| `get(key)` | 지정된 키의 값 조회 |
| `put(key, value)` | 지정된 키에 값 저장 |
| `save()` | 변경사항 영구 저장 (필수 호출) |

**중요**: `memory.put()`만 호출하고 `save()`를 호출하지 않으면 변경사항이 저장되지 않습니다.

```javascript
export const handler = async (memory, context) => {
  // 값 조회
  console.log(memory.get('orderStatus'))  // undefined

  // 값 저장
  memory.put('orderStatus', 'completed')

  // 변경 후 조회
  console.log(memory.get('orderStatus'))  // completed

  // 반드시 save() 호출
  memory.save()
}
```

### Context 객체

코드노드 실행 환경 정보를 담고 있습니다. **읽기 전용**입니다.

```javascript
{
  "user": {
    "id": "1dfaknk",
    "profile": { ... },
    // 고객 정보
  },
  "userChat": {
    "id": "asdjo92",
    "profile": { ... },
    // 상담 세션 정보
  }
}
```

#### 주요 필드

- **user**: 고객 정보 (ID, 프로필, 커스텀 데이터 등)
- **userChat**: 현재 상담 세션 정보

```javascript
export const handler = async (memory, context) => {
  const userId = context.user.id
  const chatId = context.userChat.id

  console.log(`User: ${userId}, Chat: ${chatId}`)
}
```

## 외부 API 호출

HTTP 요청은 반드시 `axios`를 사용해야 합니다.

```javascript
const axios = require('axios')

export const handler = async (memory, context) => {
  try {
    // GET 요청
    const response = await axios.get('https://api.example.com/orders', {
      params: { userId: context.user.id }
    })

    memory.put('orders', response.data)
    memory.save()

  } catch (error) {
    console.log('API Error:', error.message)
    memory.put('error', error.message)
    memory.save()
  }
}
```

### POST 요청 예시

```javascript
const axios = require('axios')

export const handler = async (memory, context) => {
  const response = await axios.post('https://api.example.com/webhook', {
    userId: context.user.id,
    action: 'coupon_issued',
    data: {
      couponCode: 'WELCOME10'
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  })

  memory.put('webhookResult', response.data)
  memory.save()
}
```

## 실용적인 예시

### 주문 상태 조회

```javascript
const axios = require('axios')

export const handler = async (memory, context) => {
  const userId = context.user.id

  try {
    const response = await axios.get(`https://your-api.com/orders/${userId}`)
    const orders = response.data

    if (orders.length > 0) {
      const latestOrder = orders[0]
      memory.put('orderStatus', latestOrder.status)
      memory.put('orderNumber', latestOrder.orderNumber)
      memory.put('hasOrder', true)
    } else {
      memory.put('hasOrder', false)
    }

    memory.save()
  } catch (error) {
    memory.put('error', error.message)
    memory.save()
  }
}
```

### 쿠폰 발급

```javascript
const axios = require('axios')

export const handler = async (memory, context) => {
  const userId = context.user.id
  const couponType = memory.get('couponType') || 'WELCOME'

  try {
    const response = await axios.post('https://your-api.com/coupons/issue', {
      userId,
      couponType
    })

    memory.put('couponCode', response.data.couponCode)
    memory.put('couponIssued', true)
    memory.save()

  } catch (error) {
    memory.put('couponIssued', false)
    memory.put('errorMessage', error.message)
    memory.save()
  }
}
```

### 슬랙 알림 전송

```javascript
const axios = require('axios')

export const handler = async (memory, context) => {
  const slackWebhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

  const message = {
    text: `새 상담 요청`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*새 상담이 접수되었습니다*\n고객 ID: ${context.user.id}\n상담 ID: ${context.userChat.id}`
        }
      }
    ]
  }

  await axios.post(slackWebhookUrl, message)
  memory.save()
}
```

## 디버깅 팁

1. `console.log()`를 사용하여 실행 로그 확인
2. 테스트 환경에서 **Result > In** 탭에서 입력 데이터 확인
3. **Result > Out** 탭에서 실행 후 memory 상태 확인
4. **Console log** 탭에서 로그 출력 확인

## 주의사항

1. `memory.save()`를 반드시 호출해야 데이터가 저장됨
2. `context`는 읽기 전용 - 값을 수정해도 실제 데이터에 영향 없음
3. 외부 API 호출 시 타임아웃 주의 (60초 제한)
4. 에러 처리를 반드시 구현 (try-catch)
