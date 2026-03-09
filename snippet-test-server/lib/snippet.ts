import type { Reservation } from "./mock-reservations";

export function buildInitSnippet() {
  return {
    version: "v0",
    params: {},
    layout: [
      {
        id: "intro-text",
        type: "text",
        text: "예약번호를 입력하면 예약 정보를 확인할 수 있습니다."
      },
      {
        id: "reservation-number",
        type: "input",
        label: "예약번호",
        placeholder: "예: RSV-2026-0001"
      },
      {
        id: "lookup-reservation",
        type: "button",
        label: "예약 조회",
        action: {
          type: "submit"
        }
      }
    ]
  };
}

export function buildReservationFoundSnippet(reservation: Reservation) {
  return {
    version: "v0",
    params: {
      reservationNumber: reservation.reservationNumber
    },
    layout: [
      {
        id: "reservation-found",
        type: "text",
        text: "예약 정보를 찾았습니다.",
        color: "success"
      },
      {
        id: "reservation-details",
        type: "key-value",
        items: [
          { key: "예약번호", value: reservation.reservationNumber },
          { key: "예약자명", value: reservation.customerName },
          { key: "예약일시", value: reservation.reservationDateTime },
          { key: "예약상태", value: reservation.status },
          { key: "예약 서비스", value: reservation.serviceName }
        ]
      },
      {
        id: "channel-consult-guide",
        type: "text",
        text: "추가 문의는 채널톡 상담으로 안내해 주세요."
      }
    ]
  };
}

export function buildReservationNotFoundSnippet(reservationNumber: string) {
  return {
    version: "v0",
    params: {
      reservationNumber
    },
    layout: [
      {
        id: "reservation-missing",
        type: "text",
        text: "예약을 찾을 수 없습니다. 다시 확인해 주세요.",
        color: "warning"
      },
      {
        id: "reservation-number",
        type: "input",
        label: "예약번호",
        value: reservationNumber
      },
      {
        id: "open-channel-consult",
        type: "button",
        label: "채널톡 상담 연결",
        action: {
          type: "url",
          url: "https://channel.io"
        }
      }
    ]
  };
}
