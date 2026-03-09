#!/usr/bin/env python3
"""Archive Channel help/ko pages into local JSON and Markdown files."""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen


NEXT_PUSH_RE = re.compile(
    r'self\.__next_f\.push\(\[1,"(.*?)"\]\)\s*</script>',
    re.DOTALL,
)
ARTICLE_URL_RE = re.compile(r"https://docs\.channel\.io/help/ko/articles/[^\"\\\s]+")
DEFAULT_ROOT_URL = "https://docs.channel.io/help/ko"
DEFAULT_ARCHIVE_DIR = Path(__file__).resolve().parents[1] / "docs" / "archive" / "channel-help-ko"


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


def crawl_article_records(root_html: str, fetch_html) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Fetch and normalize every unique article discovered from the root HTML."""
    records = []
    failures = []
    for url in extract_article_urls(root_html):
        try:
            article_html = fetch_html(url)
            parsed = parse_article_html(article_html)
            records.append(normalize_article_record(parsed))
        except Exception as exc:  # pragma: no cover - exercised via tests
            failures.append({"url": url, "error": str(exc)})
    return records, failures


def build_manifest(
    *,
    root_url: str,
    article_count: int,
    generated_at: str,
    failed_count: int,
    mode: str = "lightweight",
) -> dict[str, Any]:
    """Build archive metadata for the current snapshot."""
    return {
        "root_url": root_url,
        "mode": mode,
        "generated_at": generated_at,
        "article_count": article_count,
        "failed_count": failed_count,
    }


def fetch_html(url: str) -> str:
    """Fetch HTML with a browser-like user agent."""
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 ChannelTalkArchive/1.0"})
    with urlopen(request) as response:
        return response.read().decode("utf-8", errors="replace")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def write_archive(
    archive_dir: Path,
    root_url: str,
    records: list[dict[str, Any]],
    failures: list[dict[str, str]],
    generated_at: str,
) -> None:
    """Write normalized records, index, manifest, and failure report."""
    archive_dir.mkdir(parents=True, exist_ok=True)
    articles_dir = archive_dir / "articles"
    articles_dir.mkdir(parents=True, exist_ok=True)

    index_entries = []
    for record in records:
        article_id = record["id"]
        json_path = articles_dir / f"{article_id}.json"
        markdown_path = articles_dir / f"{article_id}.md"
        write_json(json_path, record)
        markdown_path.write_text(render_article_markdown(record))
        index_entries.append(build_index_entry(record))

    write_json(archive_dir / "index.json", {"generated_at": generated_at, "articles": index_entries})
    write_json(
        archive_dir / "manifest.json",
        build_manifest(
            root_url=root_url,
            article_count=len(records),
            generated_at=generated_at,
            failed_count=len(failures),
        ),
    )
    write_json(archive_dir / "failed-urls.json", failures)


def verify_archive(archive_dir: Path) -> int:
    """Verify that generated archive files are present and internally consistent."""
    index_path = archive_dir / "index.json"
    if not index_path.exists():
        raise SystemExit("Missing index.json")

    index_payload = json.loads(index_path.read_text())
    entries = index_payload.get("articles", [])
    missing = []
    for entry in entries:
        if not (archive_dir / entry["json_path"]).exists():
            missing.append(entry["json_path"])
        if not (archive_dir / entry["markdown_path"]).exists():
            missing.append(entry["markdown_path"])

    if missing:
        raise SystemExit(f"Missing archive files: {', '.join(missing)}")

    return len(entries)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Archive Channel help/ko documents")
    parser.add_argument("--root-url", default=DEFAULT_ROOT_URL, help="Root help page URL")
    parser.add_argument(
        "--archive-dir",
        default=str(DEFAULT_ARCHIVE_DIR),
        help="Output directory for archive files",
    )
    parser.add_argument("--verify", action="store_true", help="Verify an existing archive only")
    return parser.parse_args(argv)


def main() -> None:
    args = parse_args()
    archive_dir = Path(args.archive_dir)

    if args.verify:
        count = verify_archive(archive_dir)
        print(f"Verified archive entries: {count}")
        return

    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    root_html = fetch_html(args.root_url)
    records, failures = crawl_article_records(root_html, fetch_html)
    write_archive(archive_dir, args.root_url, records, failures, generated_at)
    print(
        f"Archived {len(records)} articles to {archive_dir} with {len(failures)} failures."
    )


if __name__ == "__main__":
    main()
