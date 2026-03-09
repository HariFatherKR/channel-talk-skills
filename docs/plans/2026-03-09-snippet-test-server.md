# Snippet Test Server Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vercel-deployable test app for Channel Talk snippets with a snippet API endpoint and a browser preview page.

**Architecture:** A small Next.js App Router app will serve a snippet endpoint at `/api/channel-talk/snippet` and a preview page at `/`. Mock reservation data will be stored locally, and snippet response generation will live in a reusable helper module so the preview page and API share the same logic.

**Tech Stack:** Next.js, React, TypeScript, Vercel

---

### Task 1: Scaffold the Next.js snippet test app

**Files:**
- Create: `snippet-test-server/package.json`
- Create: `snippet-test-server/tsconfig.json`
- Create: `snippet-test-server/next.config.ts`
- Create: `snippet-test-server/app/layout.tsx`
- Create: `snippet-test-server/app/globals.css`

**Step 1: Write the failing test**

Create a minimal test that imports the future snippet helper module so the project has an initial red state.

**Step 2: Run test to verify it fails**

Run: `cd snippet-test-server && npm test`
Expected: FAIL because the app and helper modules do not exist yet.

**Step 3: Write minimal implementation**

Scaffold the Next.js app with the smallest dependency set needed for local dev and Vercel deploy.

**Step 4: Run test to verify it passes**

Run: `cd snippet-test-server && npm test`
Expected: PASS for the initial scaffold test.

**Step 5: Commit**

```bash
git add snippet-test-server
git commit -m "feat: scaffold snippet test server"
```

### Task 2: Add mock reservation data and snippet response builders

**Files:**
- Create: `snippet-test-server/lib/mock-reservations.ts`
- Create: `snippet-test-server/lib/snippet.ts`
- Create: `snippet-test-server/tests/snippet.test.ts`

**Step 1: Write the failing test**

Add tests for:
- init response shape
- submit success response with reservation details
- submit failure response for missing reservation number

**Step 2: Run test to verify it fails**

Run: `cd snippet-test-server && npm test`
Expected: FAIL because the response builders are not implemented yet.

**Step 3: Write minimal implementation**

Implement:
- mock reservation lookup
- init response builder
- submit success/failure response builders

**Step 4: Run test to verify it passes**

Run: `cd snippet-test-server && npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add snippet-test-server
git commit -m "feat: add snippet mock data and response builders"
```

### Task 3: Implement the snippet API route

**Files:**
- Create: `snippet-test-server/app/api/channel-talk/snippet/route.ts`
- Modify: `snippet-test-server/lib/snippet.ts`
- Test: `snippet-test-server/tests/snippet-route.test.ts`

**Step 1: Write the failing test**

Add tests for:
- init request returns initial snippet JSON
- submit request returns success JSON for known reservation number
- submit request returns fallback JSON for unknown reservation number

**Step 2: Run test to verify it fails**

Run: `cd snippet-test-server && npm test`
Expected: FAIL because the route is not implemented.

**Step 3: Write minimal implementation**

Implement the route and branch on `componentId` / `submit` presence.

**Step 4: Run test to verify it passes**

Run: `cd snippet-test-server && npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add snippet-test-server
git commit -m "feat: add snippet api route"
```

### Task 4: Build the browser preview page

**Files:**
- Create: `snippet-test-server/app/page.tsx`
- Modify: `snippet-test-server/app/globals.css`

**Step 1: Write the failing test**

Add a simple UI test for rendering:
- init preview
- reservation input
- submit success/failure preview states

**Step 2: Run test to verify it fails**

Run: `cd snippet-test-server && npm test`
Expected: FAIL because the preview page does not exist yet.

**Step 3: Write minimal implementation**

Build a small preview UI that:
- calls the same snippet API
- shows raw JSON and a simple readable preview

**Step 4: Run test to verify it passes**

Run: `cd snippet-test-server && npm test`
Expected: PASS

**Step 5: Commit**

```bash
git add snippet-test-server
git commit -m "feat: add snippet preview page"
```

### Task 5: Document and deploy to Vercel

**Files:**
- Create: `snippet-test-server/README.md`
- Modify: `README.md`

**Step 1: Write the failing test**

No automated doc test required. Verify that documented commands and paths match the implemented app before writing.

**Step 2: Run test to verify it fails**

Skip. There is no meaningful automated red state for prose-only docs here.

**Step 3: Write minimal implementation**

Document:
- local run command
- API route path
- preview page usage
- how to paste the deployed API URL into Channel Talk snippet settings

Deploy with the Vercel deploy workflow after tests pass.

**Step 4: Run test to verify it passes**

Run:
- `cd snippet-test-server && npm test`
- `cd snippet-test-server && npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add snippet-test-server README.md
git commit -m "docs: prepare snippet test server for deployment"
```
