# ALF 태스크 (ALF Task)

ALF는 채널톡의 AI 챗봇으로, 태스크를 통해 자동화된 워크플로우를 구성할 수 있습니다.

## ALF 태스크란?

태스크는 고객 문의에 대해 자동으로 처리하는 워크플로우입니다. 노드 기반으로 구성되며, 조건 분기, 메시지 전송, 코드 실행 등을 조합할 수 있습니다.

## 주요 노드 타입

### 1. 시작 노드 (Trigger)

워크플로우가 시작되는 조건을 정의합니다.

- **키워드 트리거**: 특정 키워드 포함 시 시작
- **버튼 트리거**: 고객이 버튼 클릭 시 시작
- **이벤트 트리거**: 특정 이벤트 발생 시 시작

### 2. 메시지 노드 (Message)

고객에게 메시지를 전송합니다.

```json
{
  "type": "message",
  "content": {
    "text": "안녕하세요! 무엇을 도와드릴까요?",
    "buttons": [
      { "label": "주문 조회", "action": "order_inquiry" },
      { "label": "환불 요청", "action": "refund_request" },
      { "label": "상담원 연결", "action": "connect_agent" }
    ]
  }
}
```

### 3. 조건 노드 (Condition)

조건에 따라 분기합니다.

```json
{
  "type": "condition",
  "conditions": [
    {
      "if": "user.profile.vip === true",
      "then": "vip_flow"
    },
    {
      "if": "user.profile.orderCount > 10",
      "then": "loyal_customer_flow"
    }
  ],
  "else": "default_flow"
}
```

### 4. 코드 노드 (Code)

JavaScript 코드를 실행합니다. 상세 내용은 [code-node.md](code-node.md) 참조.

```json
{
  "type": "code",
  "code": "export const handler = async (memory, context) => { ... }"
}
```

### 5. API 호출 노드 (HTTP Request)

외부 API를 호출합니다.

```json
{
  "type": "http",
  "method": "POST",
  "url": "https://your-api.com/webhook",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "userId": "{{user.id}}",
    "action": "notify"
  }
}
```

### 6. 상담원 연결 노드 (Connect Agent)

상담원에게 연결합니다.

```json
{
  "type": "connect_agent",
  "message": "상담원에게 연결 중입니다...",
  "team": "support"
}
```

### 7. 종료 노드 (End)

워크플로우를 종료합니다.

```json
{
  "type": "end",
  "message": "감사합니다. 좋은 하루 되세요!"
}
```

## 워크플로우 예시

### 주문 조회 워크플로우

```
[시작: 키워드 "주문"]
    ↓
[메시지: "주문번호를 입력해주세요"]
    ↓
[코드노드: 주문 API 호출]
    ↓
[조건: 주문 존재 여부]
    ├─ Yes → [메시지: 주문 상태 안내]
    └─ No  → [메시지: 주문 찾을 수 없음]
    ↓
[종료]
```

### 환불 요청 워크플로우

```
[시작: 버튼 "환불요청"]
    ↓
[메시지: "환불 사유를 선택해주세요"]
    ↓
[버튼 선택 대기]
    ↓
[코드노드: 환불 접수 API 호출]
    ↓
[조건: VIP 고객 여부]
    ├─ Yes → [상담원 연결: 우선 처리]
    └─ No  → [메시지: 접수 완료 안내]
    ↓
[종료]
```

## 변수 활용

워크플로우에서 사용 가능한 변수:

| 변수 | 설명 |
|------|------|
| `{{user.id}}` | 고객 ID |
| `{{user.profile.name}}` | 고객 이름 |
| `{{user.profile.email}}` | 고객 이메일 |
| `{{user.profile.phone}}` | 고객 전화번호 |
| `{{memory.key}}` | 메모리에 저장된 값 |
| `{{userChat.id}}` | 현재 상담 ID |

## 코드노드와 연동

### 메모리 활용

코드노드에서 저장한 값을 다른 노드에서 사용:

```javascript
// 코드노드
export const handler = async (memory, context) => {
  const orderStatus = await fetchOrderStatus(context.user.id)
  memory.put('orderStatus', orderStatus)
  memory.put('orderNumber', 'ORD-2024-001')
  memory.save()
}
```

```json
// 메시지 노드
{
  "type": "message",
  "content": {
    "text": "주문번호 {{memory.orderNumber}}의 상태는 {{memory.orderStatus}}입니다."
  }
}
```

### 조건 분기

코드노드 결과로 조건 분기:

```javascript
// 코드노드
export const handler = async (memory, context) => {
  const hasOrder = await checkOrder(context.user.id)
  memory.put('hasOrder', hasOrder)
  memory.save()
}
```

```json
// 조건 노드
{
  "type": "condition",
  "conditions": [
    {
      "if": "memory.hasOrder === true",
      "then": "show_order_flow"
    }
  ],
  "else": "no_order_flow"
}
```

## 태스크 설정 위치

채널톡 관리자 > 워크플로우 > ALF 태스크

## 관련 문서

- [코드노드 상세](code-node.md)
- [ALF 태스크 공식 문서](https://docs.channel.io/help/ko/articles/태스크-2a16be8b)
- [심화: ALF가 업무 처리까지 하게 하기](https://docs.channel.io/channelcampus/ko/articles/심화-ALF가-업무-처리까지하게-하기-b107b442)
