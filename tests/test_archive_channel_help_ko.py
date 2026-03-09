import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "archive_channel_help_ko.py"


def load_module():
    spec = importlib.util.spec_from_file_location("archive_channel_help_ko", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class ArchiveChannelHelpKoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_html = (ROOT / "tests" / "fixtures" / "channel_help_root.html").read_text()
        cls.article_html = (ROOT / "tests" / "fixtures" / "channel_help_article.html").read_text()

    def test_extracts_decoded_next_payload_chunks(self):
        module = load_module()

        chunks = module.extract_next_payload_chunks(self.root_html)

        self.assertEqual(len(chunks), 2)
        self.assertIn('"navNodes"', chunks[0])
        self.assertIn("FAQ-db21218c", "".join(chunks))

    def test_discovers_unique_article_urls_from_root_html(self):
        module = load_module()

        urls = module.extract_article_urls(self.root_html)

        self.assertEqual(
            urls,
            [
                "https://docs.channel.io/help/ko/articles/%ED%83%9C%EC%8A%A4%ED%81%AC--2a16be8b",
                "https://docs.channel.io/help/ko/articles/FAQ-db21218c",
            ],
        )

    def test_parses_article_metadata_from_article_html(self):
        module = load_module()

        article = module.parse_article_html(self.article_html)

        self.assertEqual(article["id"], "332352")
        self.assertEqual(article["title"], "태스크")
        self.assertEqual(
            article["url"],
            "https://docs.channel.io/help/ko/articles/%ED%83%9C%EC%8A%A4%ED%81%AC--2a16be8b",
        )
        self.assertEqual(article["author"]["name"], "Beige")
        self.assertEqual(len(article["body"]), 2)
        self.assertEqual(article["linked_faqs"][0]["question"], "코드 노드 사용 시 암호화해서 저장되나요?")

    def test_normalizes_article_record_for_archive_output(self):
        module = load_module()

        parsed = module.parse_article_html(self.article_html)
        record = module.normalize_article_record(parsed)

        self.assertEqual(record["id"], "332352")
        self.assertEqual(record["title"], "태스크")
        self.assertIn("태스크는 반복 업무를 자동화하는 기능입니다.", record["plaintext"])
        self.assertEqual(record["faq_count"], 1)
        self.assertEqual(record["author"]["name"], "Beige")

    def test_renders_markdown_with_metadata_body_and_faq(self):
        module = load_module()

        record = module.normalize_article_record(module.parse_article_html(self.article_html))
        markdown = module.render_article_markdown(record)

        self.assertIn("# 태스크", markdown)
        self.assertIn("Source: https://docs.channel.io/help/ko/articles/", markdown)
        self.assertIn("태스크는 반복 업무를 자동화하는 기능입니다.", markdown)
        self.assertIn("## FAQs", markdown)
        self.assertIn("코드 노드 사용 시 암호화해서 저장되나요?", markdown)

    def test_builds_index_entry_with_archive_paths(self):
        module = load_module()

        record = module.normalize_article_record(module.parse_article_html(self.article_html))
        entry = module.build_index_entry(record)

        self.assertEqual(entry["id"], "332352")
        self.assertEqual(entry["json_path"], "articles/332352.json")
        self.assertEqual(entry["markdown_path"], "articles/332352.md")
        self.assertEqual(entry["url"], record["url"])

    def test_crawls_unique_article_urls_and_collects_failures(self):
        module = load_module()
        calls = []

        def fake_fetch(url):
            calls.append(url)
            if url.endswith("FAQ-db21218c"):
                raise RuntimeError("missing fixture")
            return self.article_html

        records, failures = module.crawl_article_records(self.root_html, fake_fetch)

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["id"], "332352")
        self.assertEqual(calls.count("https://docs.channel.io/help/ko/articles/%ED%83%9C%EC%8A%A4%ED%81%AC--2a16be8b"), 1)
        self.assertEqual(calls.count("https://docs.channel.io/help/ko/articles/FAQ-db21218c"), 1)
        self.assertEqual(
            failures,
            [{"url": "https://docs.channel.io/help/ko/articles/FAQ-db21218c", "error": "missing fixture"}],
        )

    def test_build_manifest_includes_root_mode_and_timestamp(self):
        module = load_module()

        manifest = module.build_manifest(
            root_url="https://docs.channel.io/help/ko",
            article_count=1,
            generated_at="2026-03-09T12:00:00Z",
            failed_count=1,
        )

        self.assertEqual(manifest["root_url"], "https://docs.channel.io/help/ko")
        self.assertEqual(manifest["mode"], "lightweight")
        self.assertEqual(manifest["generated_at"], "2026-03-09T12:00:00Z")
        self.assertEqual(manifest["article_count"], 1)
        self.assertEqual(manifest["failed_count"], 1)

    def test_crawl_deduplicates_records_by_article_id(self):
        module = load_module()

        def fake_fetch(_url):
            return self.article_html

        records, failures = module.crawl_article_records(self.root_html, fake_fetch)

        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["id"], "332352")
        self.assertEqual(failures, [])


if __name__ == "__main__":
    unittest.main()
