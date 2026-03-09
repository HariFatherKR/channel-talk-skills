export interface Reservation {
  reservationNumber: string;
  customerName: string;
  reservationDateTime: string;
  status: string;
  serviceName: string;
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    reservationNumber: "RSV-2026-0001",
    customerName: "김하늘",
    reservationDateTime: "2026-03-16 14:00",
    status: "예약 완료",
    serviceName: "피부 상담"
  },
  {
    reservationNumber: "RSV-2026-0002",
    customerName: "박서준",
    reservationDateTime: "2026-03-18 10:30",
    status: "예약 확인 중",
    serviceName: "초기 진료"
  }
];

export function findReservationByNumber(reservationNumber: string) {
  return MOCK_RESERVATIONS.find(
    (reservation) => reservation.reservationNumber === reservationNumber
  );
}
