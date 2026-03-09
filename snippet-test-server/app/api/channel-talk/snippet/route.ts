import {
  buildInitSnippet,
  buildReservationFoundSnippet,
  buildReservationNotFoundSnippet
} from "../../../../lib/snippet";
import { findReservationByNumber } from "../../../../lib/mock-reservations";

interface SnippetRequestBody {
  componentId?: string;
  submit?: Record<string, string>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SnippetRequestBody;

  if (!body.componentId) {
    return Response.json(buildInitSnippet());
  }

  const reservationNumber = body.submit?.["reservation-number"]?.trim() ?? "";

  if (body.componentId === "lookup-reservation" && reservationNumber) {
    const reservation = findReservationByNumber(reservationNumber);
    if (reservation) {
      return Response.json(buildReservationFoundSnippet(reservation));
    }

    return Response.json(buildReservationNotFoundSnippet(reservationNumber));
  }

  return Response.json(buildInitSnippet());
}
