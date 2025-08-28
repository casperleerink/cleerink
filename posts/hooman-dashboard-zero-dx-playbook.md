---
title: Building Apps with Sync Engines - A Developer’s Perspective
date: 2025-08-09
---

In the past few months, I have been working on the Hooman Dashboard, a client and project management app for freelancers and small companies. The goal is to provide a centralized hub for client interactions and task management — a tool that service companies like ours can use to manage their day-to-day and keep track of all tasks across all clients. Inspired by products like [Linear](https://linear.app/) and [Superhuman](https://superhuman.com/), I wanted the app to feel effortless to use, so I looked into local‑first approaches, and specifically sync engines.

## Sync Engines vs Traditional APIs

When building traditional web apps, you're used to a request-response cycle: fetch data from the server, display it, and when users make changes, send mutations to the server and then refetch or invalidate cached data to stay in sync. Using TanStack Query, this cycle might look something like this:

```ts
const tasks = useQuery({
  queryKey: ["tasks"],
  queryFn: getTasks,
});

// In the same or a different component
const addTask = useMutation({
  mutationFn: createTask,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});
```

This approach works well for many applications, but it has some limitations:

1. It requires two network requests, one for the mutation and one to refetch the data.
2. It is easy to miss a cache invalidation unless you refetch everything on the page. For example, you might have another milestones query, and on those milestones you also fetch the tasks or the task count, but you didn't invalidate that query so you still see the old numbers.

**Note:**
_Before Single Page Apps, the pattern usually involved refreshing the entire page after a mutation, but the pattern is mostly the same. React Server Components provide a method to consistently make only one network request, yet I find the existing caching mechanisms (in Next.js) still introduce significant complexity and challenges._

I find these limitations quite painful, especially in apps where the user makes a lot of mutations like our dashboard.

In a sync engine (spoiler: I chose [Zero](https://zero.rocicorp.dev/) from Rocicorp) this mutation pattern is very different.

With Zero, you still query the data in a similar way, although in most cases the data will already be in a local IndexedDB or another local data store, so the query is instant.

```ts
const [tasks] = useQuery(z.query.tasks);
```

Then you just have to call the mutation, nothing to invalidate.

```ts
const addTask = () => {
  await z.mutate.task.create({
    ...,
  }).client;
}
```

Everything gets updated automatically — even any other queries that reference this newly added task, like the milestone task counter.

Furthermore, with sync engines, another major benefit is that changes made by anyone else are updated in real time as well; even if you manually update something in the database, it will be synced to all connected clients.

For more information about what a sync engine exactly is I recommend this article: [What is Sync?](https://zero.rocicorp.dev/docs/sync)

## Sync Engine Requirements

These benefits do not come for free; they require more setup, as the sync engine must know your database schema to synchronize queries. Queries are also limited to what Zero’s query language provides. So far I have found very few limitations, except for aggregations — but this depends on your app, and it’s worth reading [this page](https://zero.rocicorp.dev/docs/reading-data) and also [this one](https://zero.rocicorp.dev/docs/when-to-use) before rewriting your entire application!

One of the benefits of working with Zero is a feature called [Custom Mutators](https://zero.rocicorp.dev/docs/custom-mutators), which allows you to create any kind of mutation. It lets you add custom validation logic (often required) and any server-only logic on your own API endpoint, such as handling notifications or other third-party integrations — similar to a [tRPC endpoint](/blog/end-to-end-typesafety-to-ship-fast) — but with the benefit that every mutation feels instant to the user because the local data is updated first.

For Zero, you will also need to deploy the zero-cache server, which is another piece of infrastructure — in addition to your database and web application — that you will have to manage.

## Everything reacts instantly? New UX problems arise

The funny thing about instant reactivity is that users do not always expect it, even though they unconsciously [appreciate it](https://www.linkedin.com/pulse/breaking-down-latency-how-delays-affect-user-yash-bisht-p5loc/).

In my case, I was working on a task priority module. This priority updates the sorting order of the list, so when it’s clicked the task moves to a different place. Even though I added a layout animation that shows the task moving from one position to another, there is still a jarring effect when an action immediately reorders the list. In this case, I ended up adding a 300 ms debounce before the mutation to prevent the reordering from happening instantaneously.

## Conclusion

Adopting a sync engine like Zero shifts the mental model from request/response to local‑first data with optimistic, automatic consistency. It adds setup and infrastructure (schema modeling and the zero‑cache server) and introduces new UX considerations around “instant” updates, but for high‑mutation, collaborative apps like the Hooman Dashboard the trade‑off is worth it: the UI feels fast, data stays predictable across views, and server‑only logic remains possible via Custom Mutators.
