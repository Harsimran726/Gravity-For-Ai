import {BACKGROUND_INTERVAL_MINUTES} from './background-schedule';

// Checked after scheduler authentication and before any database or mailbox work.
export function backgroundPause(now = new Date()) {
  const resumeAt = Date.parse(process.env.BACKGROUND_PAUSED_UNTIL || '');
  if (!Number.isFinite(resumeAt) || now.getTime() >= resumeAt) return null;
  return { paused: true, processed: 0, sent: false, resumeAt: new Date(resumeAt).toISOString(), message: 'Background processing is paused until the database billing period resets.' };
}

// The existing two-minute cron can remain enabled: arrivals outside the first
// two minutes of each 20-minute window return without database queries.
export function backgroundSchedule(now = new Date()) {
  const interval = BACKGROUND_INTERVAL_MINUTES * 60_000;
  const windowStart = Math.floor(now.getTime() / interval) * interval;
  if (now.getTime() - windowStart < 2 * 60_000) return null;
  return { deferred: true, processed: 0, sent: false, resumeAt: new Date(windowStart + interval).toISOString(), message: 'Waiting for the next background processing window.' };
}
