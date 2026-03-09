# Snippet Repo Extraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract `snippet-test-server/` into a sibling repository at `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet` and remove it from the current repository.

**Architecture:** Reuse the already-created subtree history and remote repository, then materialize the standalone app as a sibling checkout. After standalone verification passes, delete the in-repo copy and remove the root README reference so `channel_talk_skills` returns to being only the skill repository.

**Tech Stack:** Git, Git subtree history, Next.js, npm, Markdown

---

### Task 1: Materialize the standalone sibling repository

**Files:**
- Create directory: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet`
- Create git checkout: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet/.git`

**Step 1: Verify the target path is free**

Run:

```bash
test ! -e /Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet
```

Expected: exit `0`

**Step 2: Create the sibling checkout from the standalone remote**

Run:

```bash
git clone git@github.com:HariFatherKR/pada_channel_talk_snippet.git /Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet
```

Expected: clone succeeds and creates the directory.

**Step 3: Verify the standalone repository wiring**

Run:

```bash
git -C /Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet remote -v
git -C /Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet status -sb
```

Expected:
- `origin` points to `git@github.com:HariFatherKR/pada_channel_talk_snippet.git`
- working tree is clean

**Step 4: Commit**

No new commit required in this step.

### Task 2: Verify the standalone app works independently

**Files:**
- Verify: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet/package.json`
- Verify: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet/app/api/channel-talk/snippet/route.ts`
- Verify: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet/app/page.tsx`

**Step 1: Install dependencies in the standalone repository if needed**

Run:

```bash
npm install
```

Working directory:

```bash
/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet
```

Expected: install completes successfully.

**Step 2: Run the standalone test suite**

Run:

```bash
npm test
```

Expected: `9 passed`

**Step 3: Run the standalone production build**

Run:

```bash
npm run build
```

Expected: Next.js build succeeds with route output for `/` and `/api/channel-talk/snippet`.

**Step 4: Commit**

No new commit required in this step.

### Task 3: Remove the embedded snippet app from the source repository

**Files:**
- Delete: `/Users/harifatherkr/Documents/pada/Web/channel_talk_skills/snippet-test-server`
- Modify: `/Users/harifatherkr/Documents/pada/Web/channel_talk_skills/README.md`

**Step 1: Remove the root README section that points to the embedded app**

Delete the `## Snippet Test Server` section from `README.md`.

**Step 2: Remove the embedded application directory**

Delete the entire `snippet-test-server/` directory from the source repository root.

**Step 3: Verify only the intended source-repo changes remain**

Run:

```bash
git -C /Users/harifatherkr/Documents/pada/Web/channel_talk_skills status --short
```

Expected:
- `README.md` modified
- `snippet-test-server/` deleted
- no unrelated source-repo edits

**Step 4: Commit**

Run:

```bash
git -C /Users/harifatherkr/Documents/pada/Web/channel_talk_skills add README.md snippet-test-server
git -C /Users/harifatherkr/Documents/pada/Web/channel_talk_skills commit -m "refactor: extract snippet test server"
```

Expected: commit succeeds.

### Task 4: Verify both repositories after extraction

**Files:**
- Verify source repo: `/Users/harifatherkr/Documents/pada/Web/channel_talk_skills/README.md`
- Verify standalone repo: `/Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet/README.md`

**Step 1: Re-check standalone repository status**

Run:

```bash
git -C /Users/harifatherkr/Documents/pada/Web/pada_channel_talk_snippet status -sb
```

Expected: clean working tree on `main`

**Step 2: Re-check source repository status**

Run:

```bash
git -C /Users/harifatherkr/Documents/pada/Web/channel_talk_skills status -sb
```

Expected: clean working tree after the extraction commit, or only branch divergence relative to origin.

**Step 3: Re-run the source repository baseline test**

Run:

```bash
python3 -m unittest tests.test_archive_channel_help_ko -v
```

Working directory:

```bash
/Users/harifatherkr/Documents/pada/Web/channel_talk_skills
```

Expected: archive test suite still passes.

**Step 4: Commit**

No new commit required in this step.
