---
title: Building a Fast, Local‑First Dashboard with Zero, A Practical DX Playbook
date: 2025-08-09
---

Building a multi‑tenant dashboard is usually a juggling act: real‑time updates, offline‑tolerant UX, authorization rules, and a lot of boilerplate to glue it together. This post shows how adopting Zero (a local‑first, real‑time data layer) streamlines the developer experience end‑to‑end. We’ll walk through bootstrapping a typed client, composing queries that feel like a local DB, centralizing authorization in shared mutators, preloading for instant UX, URL‑driven UI, notifications, and a small dev Inspector. We’ll wrap with two end‑to‑end examples and a minimal recipe for shipping new features fast — plus common footguns to avoid.

## Who this is for

- **Frontend engineers building collaborative dashboards**
- **Teams wanting typed queries/mutations, offline‑ready UX, and simple multi‑tenant safety**
- **Readers comfortable with React and TypeScript**

## 1) Architecture at a glance

- **Shell**: An authenticated route wraps the dashboard with providers (auth, organization, hotkeys, Zero data).
- **State model**: Data flows via typed `z.query.*` hooks and `z.mutate.*` calls; dialogs and selections are driven by URL search params.
- **DX pillars**:
  - Single Zero client with auth baked in
  - Query builder that fetches relations and caches by default
  - Shared mutators centralizing auth checks and side effects
  - Preload high‑value queries for instant navigation
  - Optional dev Inspector to view live client state

---

## 2) Bootstrapping Zero once

Goal: Create a single Zero client instance with auth and mutators; provide it to the app.

Steps:

1. Retrieve user session (token, user ID, role, organization ID).
2. Initialize Zero with server base URL, `userID`, `auth`, `schema`, `mutators`, and `onOnlineChange`.
3. Wrap the app with `ZeroProvider`.

Output: A globally available, typed Zero client.

```ts
const z = new Zero<Schema, Mutators>({
  server: ENV.SERVER_URL,
  userID: session.user.id,
  auth: session.token,
  schema,
  mutators: createMutators({
    sub: session.user.id,
    role: session.role,
    organizationId: session.organizationId,
  }),
  onOnlineChange: setOnline,
});
```

---

## 3) Strong typing everywhere

Create a single `useZero` hook with your `Schema` and `Mutators` types. All queries/mutations become typed — including related rows and mutator args.

```ts
export const useZero = () => useZeroPrimitive<Schema, Mutators>();
```

---

## 4) Modeling queries like a local DB

Approach:

- **Compose** queries with predicates (`where`, `orderBy`) and relations via `.related(...)`.
- **Subscribe** to results with a React hook.
- **Stabilize** UX with debounce/defer for search and `CACHE_AWHILE` for non‑critical freshness.

Patterns:

- **Multi‑tenant safety**: Always scope by `organizationId`.
- **Sorting and limiting**: For overview cards or summaries.
- **Hook‑wrapper reuse**: `useTaskList`, `useGetThread`, etc.

Example “get thread” hook:

```ts
function useGetThread({
  threadId,
  messagesLimit = 100,
}: {
  threadId: string;
  messagesLimit?: number;
}) {
  const z = useZero();
  const [thread] = useQuery(
    z.query.thread
      .where("id", "=", threadId)
      .related("users", (q) => q.related("user"))
      .related("tasks")
      .related("messages", (q) =>
        q.orderBy("created_at", "desc").limit(messagesLimit)
      )
      .one()
  );
  return thread;
}
```

---

## 5) Mutations with guardrails (client code stays tiny)

Philosophy: UI performs one‑liners; shared mutators hold authorization and side‑effects.

Centralized checks:

- `assertIsLoggedIn`, `assertIsAdmin`, `assertIsInOrganization`, etc.

Side‑effects:

- Derived updates (e.g., update `updated_at`, unread flags)
- Activity logging and notifications

Location control:

- `.client` for local‑first ack; `.server` for server‑only tasks

UI call example:

```ts
await z.mutate.thread.createReply({
  id: nanoid(),
  threadId,
  message: editorJSON,
  createdAt: Date.now(),
}).client;
```

Mutator (conceptual skeleton):

```ts
async function createReply(tx, { id, threadId, message, createdAt }) {
  const session = assertIsLoggedIn(authData);
  const thread = await tx.query.thread.where("id", "=", threadId).one().run();
  await assertIsInOrganization(session, tx.query.thread, threadId);
  await tx.mutate.thread_message.insert({
    id,
    thread_id: threadId,
    message,
    created_by_id: session.sub,
    workspace_id: session.organizationId,
    created_at: createdAt,
  });
  // Update unread flags for other users + bump thread.updated_at
}
```

---

## 6) Preloading for instant UX

Why: Improve first‑paint and tab switching by prefetching common lists.

What to preload:

- Current user’s notifications
- Incomplete tasks with relations
- Threads visible to the user
- Clients and active milestones

Implementation: Call `.preload()` on queries during app start or org change, then await `.complete`.

```ts
await Promise.all([
  z.query.task
    .where("workspace_id", "=", orgId)
    .where("completed", "IS NOT", true)
    .related("milestone")
    .related("client")
    .related("assignee")
    .preload(CACHE_AWHILE).complete,
  z.query.thread
    .where("workspace_id", "=", orgId)
    .where("archived", "=", false)
    .related("users", (q) => q.related("user"))
    .orderBy("updated_at", "desc")
    .preload(CACHE_AWHILE).complete,
  // ...
]);
```

---

## 7) URL‑driven UI (dialogs and deep links)

- **Validate** URL search params with a schema (e.g., `taskId`, `threadId`).
- **Use URL state** to open dialogs instead of local component state.

Benefits:

- Shareable, bookmarkable states
- Better back/forward navigation
- Notifications can deep‑link into the dashboard

```ts
const [search, setSearch] = useSearch(); // e.g., via your router
// Open task dialog
setSearch({ taskId: someId });
// Close dialog but preserve other params
setSearch((prev) => ({ ...prev, taskId: undefined }));
```

---

## 8) Realtime + offline affordances

- Online indicator via `onOnlineChange`
- Optimistic UI: Call mutations `.client` first; server reconciles later
- Lists auto‑update through query subscriptions

UI patterns:

- Disabled “Send” button during uploads
- Banner for offline mode

---

## 9) Notifications and deep linking

Post‑commit fan‑out:

- Database notifications
- Email (compose link with `?taskId=` or `?threadId=`)
- Push notifications via saved subscriptions

Flow:

- Save push subscription from client (VAPID)
- On server, fetch subscriptions by user and send payload with the URL

UI entry: Landing the user on the dashboard with prefilled URL state opens the dialog immediately.

---

## 10) Dev tooling: The Inspector

A dev‑only control to inspect:

- Current client
- Cached rows per table
- Active queries across the client group

This helps debug “what is in memory” without custom logging.

---

## 11) Example A: “Reply to discussion” end‑to‑end

Goal: Add a rich‑text reply box to a discussion detail dialog.

Steps:

1. Query: `useGetThread({ threadId, messagesLimit: 100 })`
2. UI: Editor component + “Send” button; disable while uploads are in progress
3. Mutation: `z.mutate.thread.createReply({...}).client`
4. Auto‑updates:
   - Messages list updates via subscription
   - Unread flags set for other collaborators
   - Thread `updated_at` bumps for ordering
5. URL: Keep `threadId` in search params so reload/deep‑link lands in the same dialog

---

## 12) Example B: “Task quick updates” micro‑interactions

Goal: Toggle fields with minimal UI (complete, urgent, assign, reviewer).

Steps:

- Complete checkbox calls `z.mutate.task.update({ id, completed: true })`.
- Urgent toggle calls `z.mutate.task.update({ id, urgent: !urgent })`.
- Assign dropdown calls `z.mutate.task.update({ id, assigned_id })`.
- Reviewer chip toggles `z.mutate.task_reviewer.create/delete`.

Derived effects:

- Activity creation for “assign” or “complete.”
- Updating related `client.updated_at` when relevant.

Result: The list updates live; details dialog can be opened via URL as needed.

---

## 13) Performance notes

- Use `.limit()` and sort appropriately for “overview” widgets
- Preload common lists for instant tab switching
- Virtualize long lists (for discussion messages or task feeds)
- Debounce and defer search inputs

---

## 14) Security and multi‑tenancy checklist

- Always assert `organizationId` matches for queried/updated rows in mutators
- Prefer “am I allowed?” checks (`assertIsAdmin`, “is reviewer or admin?”, “is assigned or admin?”)
- Never trust client IDs directly; read rows inside transactions before mutating
- Keep role checks in shared mutators, not components

---

## 15) Minimal “new feature” recipe

- **Define**: Add schema fields/tables as needed
- **Query**: Write a hook that scopes by org and pulls required relations
- **Mutate**: Add a mutator with auth checks and any side‑effects
- **UI**: Call `z.mutate.*` from the component; subscribe via your hook
- **Preload (optional)**: If it improves UX, add to preload
- **URL state (optional)**: If you need dialogs/deep links, add validated search params
- **Debug**: Use Inspector during dev

---

## 16) Appendix: Template snippets

Typed hook:

```ts
export const useZero = () => useZeroPrimitive<Schema, Mutators>();
```

Query wrapper:

```ts
function useTaskList({ filters, orderBy }: Args) {
  const z = useZero();
  const [tasks] = useQuery(
    z.query.task
      .where("workspace_id", "=", orgId)
      // add filter predicates...
      .related("client")
      .related("milestone")
      .related("assignee")
      .orderBy("estimated_date", "asc"),
    CACHE_AWHILE
  );
  return tasks ?? [];
}
```

Mutator signature:

```ts
export function createMutators(auth?: AuthData) {
  return {
    task: {
      async update(tx, change: UpdateValue<typeof schema.tables.task>) {
        const session = assertIsLoggedIn(auth);
        await assertIsInOrganization(session, tx.query.task, change.id);
        await tx.mutate.task.update(change);
        // optional: create activity, touch related client, etc.
      },
    },
    // ...
  } satisfies CustomMutatorDefs<typeof schema>;
}
```

Preload:

```ts
await z.query.notification
  .where("user_id", "=", z.userID)
  .orderBy("created_at", "desc")
  .limit(20)
  .preload(CACHE_AWHILE).complete;
```

Notifications (conceptual):

```ts
await notifyAll(tx, { type, user_id, entity_id, metadata }, postCommitTasks, [
  databaseNotificationChannel(tx),
  emailNotificationChannel(tx),
  pushNotificationChannel(tx),
]);
```
