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
  const body = await parseRequestBody(request);

  if (!body.componentId) {
    return Response.json({ snippet: buildInitSnippet() });
  }

  const reservationNumber = body.submit?.["reservation-number"]?.trim() ?? "";

  if (body.componentId === "lookup-reservation" && reservationNumber) {
    const reservation = findReservationByNumber(reservationNumber);
    if (reservation) {
      return Response.json({ snippet: buildReservationFoundSnippet(reservation) });
    }

    return Response.json({ snippet: buildReservationNotFoundSnippet(reservationNumber) });
  }

  return Response.json({ snippet: buildInitSnippet() });
}

async function parseRequestBody(request: Request): Promise<SnippetRequestBody> {
  const rawBody = await request.text();

  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody) as SnippetRequestBody;
  } catch {
    return {};
  }
}
