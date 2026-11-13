/**
 * Timezone helpers for QueueLess.
 * Standard campus timezone is Asia/Kolkata (IST: UTC+5:30).
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

export const formatToIST = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

export const getISTMidnightUTC = (date: Date = new Date()): Date => {
  const istString = date.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE }); // YYYY-MM-DD
  const [year, month, day] = istString.split('-').map(Number);
  // IST is UTC + 5:30. Midnight IST = (previous day 18:30 UTC)
  // For canonical date grouping, we use UTC Date set to YYYY-MM-DD 00:00:00Z
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const isAfterDeadline = (deadline: Date, now: Date = new Date()): boolean => {
  return now.getTime() > deadline.getTime();
};
