import { describe, expect, it } from "vitest";
import { findReservationByNumber } from "../lib/mock-reservations";
import {
  buildInitSnippet,
  buildReservationFoundSnippet,
  buildReservationNotFoundSnippet
} from "../lib/snippet";

describe("snippet builders", () => {
  it("builds the initial snippet with input and submit action", () => {
    const snippet = buildInitSnippet();

    expect(snippet).toMatchObject({
      version: "v0",
      params: {},
      layout: [
        expect.objectContaining({ id: "intro-text", type: "text" }),
        expect.objectContaining({ id: "reservation-number", type: "input" }),
        expect.objectContaining({
          id: "lookup-reservation",
          type: "button",
          label: "예약 조회",
          action: { type: "submit" }
        })
      ]
    });
  });

  it("builds a reservation success snippet with reservation details", () => {
    const reservation = findReservationByNumber("RSV-2026-0001");
    expect(reservation).toBeDefined();

    const snippet = buildReservationFoundSnippet(reservation!);

    expect(snippet.version).toBe("v0");
    expect(snippet.layout).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "reservation-found", type: "text", color: "success" }),
        expect.objectContaining({
          id: "reservation-details",
          type: "key-value",
          items: expect.arrayContaining([
            { key: "예약자명", value: "김하늘" },
            { key: "예약상태", value: "예약 완료" }
          ])
        })
      ])
    );
    expect(snippet.params).toEqual({ reservationNumber: "RSV-2026-0001" });
  });

  it("builds a reservation failure snippet when lookup misses", () => {
    const snippet = buildReservationNotFoundSnippet("RSV-404");

    expect(snippet.version).toBe("v0");
    expect(snippet.layout).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "reservation-missing", type: "text", color: "warning" }),
        expect.objectContaining({
          id: "reservation-number",
          type: "input",
          value: "RSV-404"
        }),
        expect.objectContaining({
          id: "open-channel-consult",
          type: "button",
          label: "채널톡 상담 연결",
          action: { type: "url", url: "https://channel.io" }
        })
      ])
    );
  });
});
