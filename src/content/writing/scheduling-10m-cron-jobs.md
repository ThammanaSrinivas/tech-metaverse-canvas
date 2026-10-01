Zoho Catalyst is a serverless platform: developers write functions, and Catalyst runs them. A lot of those functions run on a schedule, nightly reports, reminders, syncs, so the job scheduler sits on the critical path of every app built on it.

When I picked it up, it had two limits users kept running into:

- **The smallest interval was one hour.** Anything that needed to run every few minutes had to be faked.
- **Each project had a cap on how many crons it could create.**

The goal was to remove both: run jobs **down to every minute**, with **no per-project limit**, at platform scale.

> ✏️ Optional, only if public: what the hourly limit cost users (e.g. the workarounds people built). Skip internal numbers.

## Why per-minute is not "just run it more often"

Going from hourly to per-minute multiplies the number of scheduling decisions by 60. Every minute the scheduler has to answer one question very quickly: *which jobs are due right now?* And then hand each of them to a worker.

Two things break first when you do that naively:

1. **Finding due jobs.** Scanning all jobs every minute gets slower as the platform grows.
2. **Dispatching them.** Publishing one message per due job floods the queue. At our scale that was about **7,000 Kafka messages per scheduling cycle**.

## The design

The scheduler is built on **Kafka** and **Redis**, and supports full **cron expressions** with an **SDK**, so developers can create and manage schedules from code.

**Due jobs come from Redis sorted sets.** A sorted set keeps members ordered by a score, so asking for "everything due before now" is a range query rather than a scan, and the cost grows with the number of due jobs, not the total number of jobs. **Redis counters** track progress without extra round trips.

> ✏️ Keep it at the level of the pattern, not Zoho internals: confirm the sorted sets are ordered by next run time, and say in one line what the counters are for. No key names, shard counts or internal service names.

**Dispatch is batched.** Instead of one Kafka message per job, due jobs are grouped, which cut messages per cycle from **about 7,000 to 32**, a **99.5% reduction**.

> ✏️ One general sentence: what jobs are grouped by (e.g. per worker or per partition). No internal topic or service names.

**It is built to change.** The scheduler sits behind a small core interface, with generic building blocks underneath. When a major change came later, it took 2–3 lines in that interface plus an overloaded implementation, instead of edits across every caller.

**It has to survive failures.** The scheduler is distributed and fault tolerant: a node going down must not drop or double-run a job.

> ✏️ Name the general technique only (e.g. idempotent execution, acknowledgements, retries). A production incident is great if you can describe it without company specifics; otherwise skip it.

## Results

| | Before | After |
|---|---|---|
| Smallest interval | 1 hour | **1 minute** |
| Per-project cron limit | Yes | **Removed** |
| Dispatch latency | 50 ms | **5 ms** (10× faster) |
| Kafka messages per cycle | ~7,000 | **32** (−99.5%) |
| Volume | | **10M+ jobs a day** (10–20M) |

I also built an adapter between Catalyst and Zoho Cron for custom cron expressions, which reached **35% user adoption in its first 3 months**.

The feature is public: [Catalyst job scheduling docs](https://docs.catalyst.zoho.com/en/job-scheduling/getting-started/components-of-job-scheduling/).

## What I'd do differently

> ✏️ Write 2–3 honest points. Interviewers value this section most: a trade-off you'd revisit, something you'd measure earlier, a simpler design you rejected and why.

## What I took away

> ✏️ One or two lessons that carry beyond schedulers, e.g. about batching, choosing the data structure to fit the hot query, or rolling out a change to a platform other teams depend on.
