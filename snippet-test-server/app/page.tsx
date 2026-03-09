"use client";

import { startTransition, useEffect, useState } from "react";

type SnippetAction =
  | {
      type: "submit";
    }
  | {
      type: "url";
      url: string;
    };

type SnippetLayoutItem =
  | {
      id: string;
      type: "text";
      text: string;
      color?: string;
    }
  | {
      id: string;
      type: "input";
      label: string;
      value?: string;
      placeholder?: string;
    }
  | {
      id: string;
      type: "button";
      label: string;
      action: SnippetAction;
    }
  | {
      id: string;
      type: "key-value";
      items: Array<{ key: string; value: string }>;
    };

type SnippetResponse = {
  version: string;
  params: Record<string, string>;
  layout: SnippetLayoutItem[];
};

const API_PATH = "/api/channel-talk/snippet";

async function requestSnippet(payload: Record<string, unknown>) {
  const response = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as SnippetResponse;
}

export default function Page() {
  const [reservationNumber, setReservationNumber] = useState("");
  const [snippet, setSnippet] = useState<SnippetResponse | null>(null);

  useEffect(() => {
    void requestSnippet({
      user: {
        id: "preview-user"
      }
    }).then(setSnippet);
  }, []);

  const loadLookup = (value: string) => {
    startTransition(() => {
      void requestSnippet({
        user: {
          id: "preview-user"
        },
        componentId: "lookup-reservation",
        submit: {
          "reservation-number": value
        }
      }).then(setSnippet);
    });
  };

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="panel-header">
          <h1>스니펫 미리보기</h1>
          <p>채널톡 스니펫 init/submit 응답을 브라우저에서 바로 확인합니다.</p>
        </div>

        <div className="preview-controls">
          <label htmlFor="reservation-number-input">예약번호</label>
          <input
            id="reservation-number-input"
            name="reservation-number"
            value={reservationNumber}
            placeholder="예: RSV-2026-0001"
            onChange={(event) => setReservationNumber(event.target.value)}
          />
          <div className="button-row">
            <button type="button" onClick={() => loadLookup(reservationNumber || "RSV-2026-0001")}>
              예약 조회
            </button>
            <button type="button" onClick={() => loadLookup(reservationNumber || "RSV-2026-0001")}>
              성공 예시
            </button>
            <button type="button" onClick={() => loadLookup(reservationNumber || "RSV-404")}>
              실패 예시
            </button>
          </div>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>렌더링 미리보기</h2>
          {snippet ? <SnippetRenderer snippet={snippet} /> : <p>불러오는 중...</p>}
        </article>

        <article className="panel">
          <h2>응답 JSON</h2>
          <pre>{snippet ? JSON.stringify(snippet, null, 2) : "{}"}</pre>
        </article>
      </section>
    </main>
  );
}

function SnippetRenderer({ snippet }: { snippet: SnippetResponse }) {
  return (
    <div className="snippet-card">
      {snippet.layout.map((item) => {
        if (item.type === "text") {
          return (
            <p className={`snippet-text ${item.color ?? "default"}`} key={item.id}>
              {item.text}
            </p>
          );
        }

        if (item.type === "input") {
          return (
            <label className="snippet-field" key={item.id}>
              <span>{item.label}</span>
              <input
                aria-label={`미리보기 ${item.label}`}
                defaultValue={item.value}
                placeholder={item.placeholder}
                readOnly
              />
            </label>
          );
        }

        if (item.type === "button") {
          return (
            <button className="snippet-button" key={item.id} type="button">
              {item.label}
            </button>
          );
        }

        return (
          <dl className="snippet-key-value" key={item.id}>
            {item.items.map((entry) => (
              <div className="snippet-key-value-row" key={entry.key}>
                <dt>{entry.key}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        );
      })}
    </div>
  );
}
