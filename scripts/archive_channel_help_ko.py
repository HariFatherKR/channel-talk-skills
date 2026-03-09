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


def collect_plaintext(value: Any) -> str:
    """Flatten nested block content into readable plaintext."""
    if isinstance(value, dict):
        parts = []
        attrs = value.get("attrs", {})
        text = attrs.get("text")
        if text:
            parts.append(text.strip())
        content = value.get("content")
        if content:
            nested = collect_plaintext(content)
            if nested:
                parts.append(nested)
        return "\n".join(part for part in parts if part)

    if isinstance(value, list):
        parts = [collect_plaintext(item) for item in value]
        return "\n".join(part for part in parts if part)

    return ""


def normalize_article_record(article: dict[str, Any]) -> dict[str, Any]:
    """Normalize parsed article data into the archive schema."""
    plaintext = collect_plaintext(article.get("body", []))
    plaintext = "\n".join(line for line in (line.strip() for line in plaintext.splitlines()) if line)

    return {
        "id": article["id"],
        "url": article["url"],
        "title": article["title"],
        "summary": article.get("summary", ""),
        "plaintext": plaintext,
        "body": article.get("body", []),
        "author": article.get("author", {}),
        "cover_image_url": article.get("cover_image_url"),
        "linked_faqs": article.get("linked_faqs", []),
        "faq_count": len(article.get("linked_faqs", [])),
    }


def render_article_markdown(record: dict[str, Any]) -> str:
    """Render a normalized article record as Markdown."""
    lines = [
        f"# {record['title']}",
        "",
        f"Source: {record['url']}",
    ]

    if record.get("summary"):
        lines.extend(["", record["summary"]])

    if record.get("plaintext"):
        lines.extend(["", "## Body", "", record["plaintext"]])

    if record.get("linked_faqs"):
        lines.extend(["", "## FAQs"])
        for faq in record["linked_faqs"]:
            lines.extend(["", f"### {faq['question']}", "", faq["answer_plaintext"]])

    return "\n".join(lines).strip() + "\n"


def build_index_entry(record: dict[str, Any]) -> dict[str, Any]:
    """Build the lightweight index entry for a normalized record."""
    article_id = record["id"]
    return {
        "id": article_id,
        "title": record["title"],
        "url": record["url"],
        "json_path": f"articles/{article_id}.json",
        "markdown_path": f"articles/{article_id}.md",
        "faq_count": record.get("faq_count", 0),
    }


def main() -> None:
    raise SystemExit("CLI not implemented yet.")


if __name__ == "__main__":
    main()
