# Channel Help KO Archive Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a reusable script that archives `https://docs.channel.io/help/ko` into lightweight JSON and Markdown files under `docs/archive/channel-help-ko/`.

**Architecture:** A Python script will crawl the root help page and article pages, extract Next.js payload fragments from HTML, normalize article data into a structured schema, and emit both machine-readable JSON and human-readable Markdown. The archive directory will also contain an index, manifest, and usage documentation.

**Tech Stack:** Python 3 standard library, repository docs under `docs/`

---

### Task 1: Create parser tests for Next payload extraction

**Files:**
- Create: `tests/test_archive_channel_help_ko.py`
- Create: `tests/fixtures/channel_help_root.html`
- Create: `tests/fixtures/channel_help_article.html`

**Step 1: Write the failing test**

Create tests that:
- extract `__next_f.push(...)` payload chunks from fixture HTML
- detect at least one article URL from the root fixture
- parse article metadata from the article fixture

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: FAIL because parser module does not exist yet

**Step 3: Write minimal implementation**

Create the parser helpers inside the future script module with pure functions for:
- reading HTML
- extracting payload chunks
- locating article URLs
- parsing article metadata

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/test_archive_channel_help_ko.py tests/fixtures/channel_help_root.html tests/fixtures/channel_help_article.html scripts/archive_channel_help_ko.py
git commit -m "test: cover channel help payload parsing"
```

### Task 2: Implement crawler and archive writers

**Files:**
- Modify: `scripts/archive_channel_help_ko.py`
- Create: `docs/archive/channel-help-ko/.gitkeep`

**Step 1: Write the failing test**

Add tests that:
- build a normalized article record from parsed data
- render Markdown output with title, source URL, body text, and FAQ
- build an index entry pointing to `articles/<id>.json` and `articles/<id>.md`

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: FAIL on missing normalizer or renderer behavior

**Step 3: Write minimal implementation**

Add code to:
- normalize article records
- render Markdown text
- write article JSON/Markdown files
- write `index.json` and `manifest.json`

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/archive_channel_help_ko.py docs/archive/channel-help-ko/.gitkeep tests/test_archive_channel_help_ko.py
git commit -m "feat: write channel help archive artifacts"
```

### Task 3: Add CLI flow and failure reporting

**Files:**
- Modify: `scripts/archive_channel_help_ko.py`

**Step 1: Write the failing test**

Add tests that:
- simulate a small crawl queue and confirm deduplication of article URLs
- verify failed fetches are captured in a failure list
- verify manifest fields include root URL, mode, and generated timestamp

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: FAIL because crawl orchestration and manifest logic are incomplete

**Step 3: Write minimal implementation**

Implement:
- crawl queue orchestration
- retry-safe fetch wrapper without external deps
- failure logging file such as `failed-urls.json`
- CLI entrypoint and arguments

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/archive_channel_help_ko.py tests/test_archive_channel_help_ko.py
git commit -m "feat: add channel help archive cli flow"
```

### Task 4: Document archive usage

**Files:**
- Create: `docs/archive/channel-help-ko/README.md`
- Modify: `README.md`
- Modify: `README.en.md`

**Step 1: Write the failing test**

No automated test required for prose-only documentation. Verify accuracy against the implemented CLI and output paths before writing.

**Step 2: Run test to verify it fails**

Skip. There is no meaningful automated failure mode for static prose in this repository.

**Step 3: Write minimal implementation**

Document:
- what the archive contains
- how to run the script
- output structure
- known limits of the lightweight mode

Add a short note in both READMEs pointing to the archive tooling.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: PASS, confirming docs still match current script behavior

**Step 5: Commit**

```bash
git add -f docs/archive/channel-help-ko/README.md README.md README.en.md
git commit -m "docs: explain channel help archive workflow"
```

### Task 5: Generate and verify the archive snapshot

**Files:**
- Modify: `docs/archive/channel-help-ko/index.json`
- Modify: `docs/archive/channel-help-ko/manifest.json`
- Create/Modify: `docs/archive/channel-help-ko/articles/*`
- Create/Modify: `docs/archive/channel-help-ko/failed-urls.json`

**Step 1: Write the failing test**

No new unit test. Use the existing suite plus a real archive run as the verification target.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests.test_archive_channel_help_ko -v`
Expected: PASS before the live crawl. If it fails, fix implementation before generating data.

**Step 3: Write minimal implementation**

Run the real crawl:

```bash
python3 scripts/archive_channel_help_ko.py
```

Inspect generated outputs and fix any parser gaps needed for real site data.

**Step 4: Run test to verify it passes**

Run:
- `python3 -m unittest tests.test_archive_channel_help_ko -v`
- `python3 scripts/archive_channel_help_ko.py --verify`

Expected:
- unit tests PASS
- verification reports matching index counts and non-empty required fields for sampled documents

**Step 5: Commit**

```bash
git add -f docs/archive/channel-help-ko scripts/archive_channel_help_ko.py tests/test_archive_channel_help_ko.py README.md README.en.md
git commit -m "feat: archive channel help ko docs"
```
