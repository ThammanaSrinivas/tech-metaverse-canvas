Zoho Catalyst is a serverless platform: developers write functions, and Catalyst runs them. A lot of those functions run on a schedule, nightly reports, reminders, syncs, so the job scheduler sits on the critical path of every app built on it.

When we picked it up, it had two limits users kept running into:

- **The smallest interval was one hour.** Anything that had to run more often simply couldn't.
- **Each project had a cap on how many crons it could create.**

The goal was to remove both: run jobs **down to every minute, for everyone**, with **no per-project limit**, at platform scale. I led a team of three, and it took about six months.

## Why per-minute is not "just run it more often"

Going from hourly to per-minute multiplies the number of scheduling decisions by 60. Every minute the scheduler has to answer one question quickly, *which jobs are due right now?*, and hand each of them to a worker, without losing any or running any twice.

The obvious version breaks in two places:

1. **The queue floods.** Publishing every due job the moment it is due produced about **7,000 Kafka messages per scheduling cycle**, far more than the workers could take at once.
2. **Failures multiply.** At 60× the volume, a node going down or a user function failing stops being rare. It happens every day.

## The design

The scheduler is built on **Kafka** and **Redis**, and supports full **cron expressions** with an **SDK**, so developers can create and manage schedules from code.

**Only queue what the workers can take.** The biggest win was also the smallest change. Instead of pushing every due job into the pending queue, the scheduler stops submitting once the queue holds about **ten times what the workers can process**, and tops it up as they drain it. One `if` condition, and messages per cycle dropped from **about 7,000 to 32**, a **99.5% reduction**.

**Nothing is lost.** Kafka is persistent, so a scheduled job survives any node going down. A job is only done when it **acknowledges completion**; until then it can be picked up again. Developers choose **how many times to retry**, whether the cause is a node failure or a bug in their own function.

**It is built to change.** The scheduler sits behind a small core interface, with generic building blocks underneath. When we found a race condition that looked like it needed a partial re-architecture, the fix turned out to be **one `if` condition and an overloaded implementation of an existing method**: 2–3 lines in the core interface, instead of edits across every caller.

## Results

| | Before | After |
|---|---|---|
| Smallest interval | 1 hour | **1 minute**, for every user |
| Per-project cron limit | Yes | **Removed** |
| Dispatch latency | 50 ms | **5 ms** (10× faster) |
| Kafka messages per cycle | ~7,000 | **32** (−99.5%) |
| Volume | | **10M+ jobs a day** (10–20M) |

I also built an adapter between Catalyst and Zoho Cron for custom cron expressions, which reached **35% user adoption in its first 3 months**.

The feature is public: [Catalyst job scheduling docs](https://docs.catalyst.zoho.com/en/job-scheduling/getting-started/components-of-job-scheduling/).

## What made it work

**Maintainability is a feature you collect on later.** We kept the code clean and the architecture deliberately simple, and it paid off in exactly the moments that matter: when a decision changes late, or a race condition shows up in production. With a clear core interface, changing course costs a few lines, not a rewrite. I would make the same trade again, every time.

## What I took away

**The best idea can come from anywhere.** A junior engineer I was mentoring came up with an optimisation that none of us, me or four senior engineers, had thought of. It was simple, and it changed the game. Since then I listen hardest to the simplest suggestion in the room.

**Depth becomes part of you.** Going deep enough on one system to really master it changes how you think about every system after it. It stops being something you know and becomes part of how you work.

**Making people happy is the point.** Turning "you can't run this more than once an hour" into "run it every minute" made a lot of developers happy, and that is the best part of the job.

**Late nights and serendipity.** None of this happened on a schedule. There were a lot of late nights, and more than a few moments where the answer showed up by accident. You can't plan those moments, but you have to be there for them.
