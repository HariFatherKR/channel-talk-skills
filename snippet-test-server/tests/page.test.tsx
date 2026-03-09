import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../app/page";
import {
  buildInitSnippet,
  buildReservationFoundSnippet,
  buildReservationNotFoundSnippet
} from "../lib/snippet";
import { findReservationByNumber } from "../lib/mock-reservations";

describe("snippet preview page", () => {
  beforeEach(() => {
    const reservation = findReservationByNumber("RSV-2026-0001");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const payload = init?.body ? JSON.parse(String(init.body)) : {};

        if (!payload.componentId) {
          return Response.json({ snippet: buildInitSnippet() });
        }

        if (payload.submit?.["reservation-number"] === "RSV-2026-0001") {
          return Response.json({ snippet: buildReservationFoundSnippet(reservation!) });
        }

        return Response.json(
          {
            snippet: buildReservationNotFoundSnippet(
              payload.submit?.["reservation-number"] ?? ""
            )
          }
        );
      })
    );
  });

  it("renders the init preview on load", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("스니펫 미리보기")).toBeInTheDocument();
      expect(screen.getByLabelText("예약번호")).toBeInTheDocument();
      expect(screen.getByText("예약 조회")).toBeInTheDocument();
    });
  });

  it("shows the success state for a known reservation number", async () => {
    render(<Page />);

    const input = await screen.findByLabelText("예약번호");
    fireEvent.change(input, { target: { value: "RSV-2026-0001" } });
    fireEvent.click(screen.getByText("성공 예시"));

    await waitFor(() => {
      expect(screen.getByText("예약 정보를 찾았습니다.")).toBeInTheDocument();
      expect(screen.getByText("김하늘")).toBeInTheDocument();
    });
  });

  it("shows the failure state for an unknown reservation number", async () => {
    render(<Page />);

    const input = await screen.findByLabelText("예약번호");
    fireEvent.change(input, { target: { value: "RSV-404" } });
    fireEvent.click(screen.getByText("실패 예시"));

    await waitFor(() => {
      expect(
        screen.getByText("예약을 찾을 수 없습니다. 다시 확인해 주세요.")
      ).toBeInTheDocument();
      expect(screen.getByText("채널톡 상담 연결")).toBeInTheDocument();
    });
  });
});
