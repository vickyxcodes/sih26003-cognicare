/**
 * caregiverMetrics - the view model for the caregiver dashboard.
 *
 * It deliberately consumes the existing session rows and BANKS metadata. No
 * values are invented here: an empty history stays empty, and every domain in
 * the result comes from the same data-driven bank list used by the games.
 */
import { BANKS } from '../data/banks.js';
import { buildSeries, compareRecent, describeTrend, TREND } from './trends.js';

const average = (values) => (values.length
  ? Math.round(values.reduce((total, value) => total + value, 0) / values.length)
  : null);

export const trendWords = {
  [TREND.up]: 'Improving',
  [TREND.down]: 'Declining',
  [TREND.steady]: 'Stable',
  [TREND.single]: 'Building history',
  [TREND.none]: 'No activity yet',
};

export function buildDomainMetrics(sessions, banks = BANKS, { now = Date.now() } = {}) {
  return banks.map((bank) => {
    const history = buildSeries(sessions, bank.domain, { limit: Infinity, now });
    const series = buildSeries(sessions, bank.domain, { now });
    const reading = describeTrend(series, { label: bank.name, now });
    const scores = history.points.map((point) => point.score);
    const latest = history.points[history.points.length - 1] || null;
    return {
      bank,
      series,
      reading,
      latest: latest ? latest.score : null,
      average: average(scores),
      best: scores.length ? Math.max(...scores) : null,
      sessions: history.total,
      allPoints: history.points,
      lastPlayed: latest ? latest.when : null,
      trend: reading.direction,
      trendLabel: trendWords[reading.direction],
    };
  });
}

export function buildOverallMetric(domainMetrics) {
  const points = domainMetrics
    .flatMap((metric) => metric.allPoints.map((point) => ({ ...point, domain: metric.bank.domain })))
    .sort((a, b) => a.timestamp - b.timestamp);
  const scores = points.map((point) => point.score);
  const trend = compareRecent(scores);
  return {
    latest: scores.length ? scores[scores.length - 1] : null,
    average: average(scores),
    recent: scores.length ? average(scores.slice(-3)) : null,
    sessions: scores.length,
    trend: trend.direction,
    trendLabel: trendWords[trend.direction],
  };
}

export function buildRecentActivity({ sessions = [], reminderRows = [], banks = BANKS, now = Date.now(), limit = 10 } = {}) {
  const names = new Map(banks.map((bank) => [bank.domain, bank.name]));
  const sessionRows = sessions
    .filter((row) => row && names.has(row.domain) && Number.isFinite(Number(row.timestamp)))
    .map((row) => ({
      id: `session-${row.id}`,
      kind: 'session',
      title: names.get(row.domain),
      detail: `${row.score}% score`,
      timestamp: Number(row.timestamp),
      when: row.timestamp ? new Date(row.timestamp) : null,
      source: row,
    }));
  const reminderLabels = { medicine: 'Medicine reminder', hydration: 'Water reminder', appointment: 'Appointment reminder' };
  const reminderRowsMapped = reminderRows
    .filter((row) => row && reminderLabels[row.type] && Number.isFinite(Number(row.timestamp)))
    .map((row) => ({
      id: `reminder-${row.id}`,
      kind: 'reminder',
      title: reminderLabels[row.type],
      detail: row.status === 'dismissed' ? 'Recorded as completed' : 'Recorded as missed',
      status: row.status,
      timestamp: Number(row.timestamp),
      when: row.timestamp ? new Date(row.timestamp) : null,
      source: row,
    }));
  return [...sessionRows, ...reminderRowsMapped]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((row) => ({ ...row, when: formatActivityTime(row.timestamp, now) }));
}

function formatActivityTime(timestamp, now) {
  const distance = Math.max(0, now - timestamp);
  if (distance < 60 * 1000) return 'Just now';
  if (distance < 60 * 60 * 1000) return `${Math.floor(distance / 60000)} min ago`;
  if (distance < 24 * 60 * 60 * 1000) return `${Math.floor(distance / 3600000)} hr ago`;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}
