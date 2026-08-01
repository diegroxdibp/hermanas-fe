import { RecurrenceFrequency } from '../enums/recurrence-frequency.enum';

// Backend serializes RecurrenceFrequency as the raw Java enum name
// ('WEEKLY'/'BIWEEKLY'/'MONTHLY'), not the Portuguese label - normalize before comparing/displaying.
export function normalizeRecurrenceFrequency(freq: string | null | undefined): RecurrenceFrequency {
  if (freq === 'BIWEEKLY' || freq === RecurrenceFrequency.BIWEEKLY) return RecurrenceFrequency.BIWEEKLY;
  if (freq === 'MONTHLY' || freq === RecurrenceFrequency.MONTHLY) return RecurrenceFrequency.MONTHLY;
  return RecurrenceFrequency.WEEKLY;
}

// Backend expects the raw RecurrenceFrequency enum name, not the Portuguese label.
export function toBackendRecurrenceFrequency(freq: RecurrenceFrequency): 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' {
  if (freq === RecurrenceFrequency.BIWEEKLY) return 'BIWEEKLY';
  if (freq === RecurrenceFrequency.MONTHLY) return 'MONTHLY';
  return 'WEEKLY';
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun,1=Mon...
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

function weeksBetween(a: Date, b: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.round((mondayOf(b).getTime() - mondayOf(a).getTime()) / msPerWeek);
}

function weekdayIndexInMonth(date: Date): number {
  return Math.floor((date.getDate() - 1) / 7);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isLastOccurrenceOfWeekdayInMonth(date: Date): boolean {
  return date.getDate() + 7 > daysInMonth(date);
}

/**
 * Mirrors the backend's RecurrenceMatcher.occursOn exactly: decides whether a
 * recurring availability/appointment anchored on `anchorDate` actually occurs
 * on `candidateDate`. Callers must already have confirmed the weekday matches.
 */
export function occursOnDate(
  freq: RecurrenceFrequency | string | null | undefined,
  anchorDate: Date,
  candidateDate: Date,
): boolean {
  const normalized = freq == null ? RecurrenceFrequency.WEEKLY : normalizeRecurrenceFrequency(freq as string);
  if (normalized === RecurrenceFrequency.WEEKLY) return true;

  if (normalized === RecurrenceFrequency.BIWEEKLY) {
    return weeksBetween(anchorDate, candidateDate) % 2 === 0;
  }

  // MONTHLY: same "nth weekday of month" position as the anchor, clamped for
  // the "5th occurrence" case since not every month has one.
  const anchorIndex = weekdayIndexInMonth(anchorDate);
  const candidateIndex = weekdayIndexInMonth(candidateDate);
  if (anchorIndex <= 3) {
    return candidateIndex === anchorIndex;
  }
  return candidateIndex >= 4 && isLastOccurrenceOfWeekdayInMonth(candidateDate);
}

/**
 * Walks week-by-week from `firstCandidate` (already on the target weekday, on
 * or after the range start) up to `until`, keeping only the dates where the
 * pattern actually occurs. Used to build "upcoming sessions" lists.
 */
export function generateOccurrences(
  freq: RecurrenceFrequency | string | null | undefined,
  anchorDate: Date,
  firstCandidate: Date,
  until: Date,
  maxCount: number,
): Date[] {
  const dates: Date[] = [];
  let candidate = new Date(firstCandidate);
  while (candidate <= until && dates.length < maxCount) {
    if (occursOnDate(freq, anchorDate, candidate)) {
      dates.push(new Date(candidate));
    }
    candidate = new Date(candidate);
    candidate.setDate(candidate.getDate() + 7);
  }
  return dates;
}
