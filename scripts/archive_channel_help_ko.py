#!/usr/bin/env python3
"""Archive Channel help/ko pages into local JSON and Markdown files."""

from __future__ import annotations

import json
import re
from typing import Any


NEXT_PUSH_RE = re.compile(
    r'self\.__next_f\.push\(\[1,"(.*?)"\]\)\s*</script>',
    re.DOTALL,
)
ARTICLE_URL_RE = re.compile(r"https://docs\.channel\.io/help/ko/articles/[^\"\\\s]+")


def extract_next_payload_chunks(html: str) -> list[str]:
    """Decode Next.js flight payload chunks embedded in HTML."""
    chunks = []
    for raw_chunk in NEXT_PUSH_RE.findall(html):
        chunks.append(json.loads(f'"{raw_chunk}"'))
    return chunks


def extract_article_urls(html: str) -> list[str]:
    """Collect unique help article URLs in first-seen order."""
    payload = "".join(extract_next_payload_chunks(html))
    seen = set()
    urls = []
    for url in ARTICLE_URL_RE.findall(payload):
        if url not in seen:
            seen.add(url)
            urls.append(url)
    return urls


def extract_json_value(text: str, marker: str) -> Any:
    """Extract a JSON object or array that follows the marker."""
    idx = text.find(marker)
    if idx < 0:
        raise ValueError(f"Marker not found: {marker}")

    start = idx + len(marker)
    opener = text[start]
    if opener not in "[{":
        raise ValueError(f"Unsupported JSON opener after marker: {marker}")

    closer = "}" if opener == "{" else "]"
    depth = 0
    in_string = False
    escape = False
    end = None

    for pos in range(start, len(text)):
        char = text[pos]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                end = pos + 1
                break

    if end is None:
        raise ValueError(f"Unterminated JSON value for marker: {marker}")

    return json.loads(text[start:end])


def parse_article_html(html: str) -> dict[str, Any]:
    """Parse article metadata and body from an article page HTML snapshot."""
    payload = "".join(extract_next_payload_chunks(html))
    article = extract_json_value(payload, '"article":')
    author = extract_json_value(payload, '"author":')
    linked_faqs = extract_json_value(payload, '"linkedFaqs":')

    return {
        "id": str(article["id"]),
        "url": article["website"]["url"],
        "title": article["title"].strip(),
        "summary": article.get("summary", "").strip(),
        "body": article.get("body", []),
        "cover_image_url": article.get("coverImageUrl"),
        "author": {
            "id": str(author["id"]),
            "name": author.get("profile", {}).get("name", "").strip(),
            "bio": author.get("profile", {}).get("bio", "").strip(),
        },
        "linked_faqs": [
            {
                "id": str(item["id"]),
                "question": item.get("question", "").strip(),
                "answer_plaintext": item.get("answerPlaintext", "").strip(),
            }
            for item in linked_faqs
        ],
    }


def main() -> None:
    raise SystemExit("CLI not implemented yet.")


if __name__ == "__main__":
    main()
