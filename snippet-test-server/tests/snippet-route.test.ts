import { describe, expect, it } from "vitest";
import { POST } from "../app/api/channel-talk/snippet/route";

describe("snippet api route", () => {
  it("returns the init snippet for a fresh request", async () => {
    const request = new Request("http://localhost/api/channel-talk/snippet", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        user: {
          id: "user-1"
        }
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.layout[0].id).toBe("intro-text");
  });

  it("returns reservation details for a known reservation number", async () => {
    const request = new Request("http://localhost/api/channel-talk/snippet", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        user: {
          id: "user-1"
        },
        componentId: "lookup-reservation",
        submit: {
          "reservation-number": "RSV-2026-0001"
        }
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.params.reservationNumber).toBe("RSV-2026-0001");
    expect(json.layout).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "reservation-details", type: "key-value" })
      ])
    );
  });

  it("returns not found guidance for an unknown reservation number", async () => {
    const request = new Request("http://localhost/api/channel-talk/snippet", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        user: {
          id: "user-1"
        },
        componentId: "lookup-reservation",
        submit: {
          "reservation-number": "RSV-404"
        }
      })
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.layout).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "reservation-missing", type: "text" }),
        expect.objectContaining({ id: "open-channel-consult", type: "button" })
      ])
    );
  });
});
