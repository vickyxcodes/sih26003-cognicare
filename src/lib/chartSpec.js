/**
 * chartSpec - the Chart.js configuration for a caregiver trend line, as data.
 *
 * Separate from `TrendChart.jsx` for one reason: `node --test` cannot import a
 * JSX file, and the chart's readability rules are worth testing. Everything that
 * decides what the caregiver actually sees - a percent axis pinned to 0-100 so
 * two charts compare by eye, a difficulty axis pinned to the real tiers, thick
 * lines, large ticks, tooltips that explain both numbers in words - is here as a
 * plain object over a series, with no React and no Chart.js import.
 *
 * The component's job is then only to hand this object to a Chart instance and
 * destroy that instance again.
 */
import { TIER_MAX } from './trends.js';
import { dashboardText } from './i18n.js';

/** Same teal as the app's primary; the difficulty line reuses the warn orange. */
const SCORE_COLOUR = '#0f766e';
const LEVEL_COLOUR = '#b45309';
const INK_SOFT = '#3d4a5c';
const DOMAIN_COLOURS = ['#0f766e', '#2563eb', '#7c3aed', '#be123c', '#b45309', '#047857'];

export function chartConfig(series, { reducedMotion = false, language = 'en' } = {}) {
  const points = (series && series.points) || [];
  return {
    type: 'line',
    data: {
      labels: (series && series.labels) || [],
      datasets: [
        {
          label: dashboardText(language, 'answers'),
          data: (series && series.scores) || [],
          borderColor: SCORE_COLOUR,
          backgroundColor: 'rgba(15,118,110,0.12)',
          borderWidth: 4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: SCORE_COLOUR,
          tension: 0.25,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: dashboardText(language, 'difficultyLevel'),
          data: (series && series.tiers) || [],
          borderColor: LEVEL_COLOUR,
          borderWidth: 3,
          borderDash: [7, 5],
          pointRadius: 4,
          pointBackgroundColor: LEVEL_COLOUR,
          stepped: true, // a tier is a step the game took, not a slope
          fill: false,
          yAxisID: 'level',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 350 },
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4, right: 4, bottom: 0, left: 0 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 18, font: { size: 13 }, color: INK_SOFT, padding: 14 },
        },
        tooltip: {
          backgroundColor: '#14202e',
          titleFont: { size: 14 },
          bodyFont: { size: 14 },
          padding: 10,
          callbacks: {
            /* The full "Sat 6 Sep at 9:15 am" from timeWords, so a caregiver
             * reading a point knows which session it was. */
            title: (items) => {
              const point = points[items[0].dataIndex];
              return point ? point.when : '';
            },
            label: (item) => (item.datasetIndex === 0
              ? language === 'en'
                ? `${item.parsed.y}% of answers correct`
                : `${item.parsed.y}% ${dashboardText(language, 'answers').toLowerCase()}`
              : `${dashboardText(language, 'difficultyLevel')} ${item.parsed.y} of ${TIER_MAX}`),
          },
        },
      },
      scales: {
        /* Always the full 0-100, never auto-scaled: an axis that fits the data
         * would make a wobble between 68% and 72% look like a collapse. */
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, font: { size: 13 }, color: INK_SOFT, callback: (v) => `${v}%` },
          grid: { color: 'rgba(20,32,46,0.08)' },
          title: { display: true, text: dashboardText(language, 'answers'), font: { size: 13 }, color: INK_SOFT },
        },
        level: {
          position: 'right',
          min: 1,
          max: TIER_MAX,
          ticks: { stepSize: 1, font: { size: 13 }, color: LEVEL_COLOUR },
          grid: { drawOnChartArea: false },
          title: { display: true, text: dashboardText(language, 'difficulty'), font: { size: 13 }, color: LEVEL_COLOUR },
        },
        x: {
          ticks: { font: { size: 13 }, color: INK_SOFT, maxRotation: 0, autoSkipPadding: 12 },
          grid: { display: false },
        },
      },
    },
  };
}

/**
 * The dashboard-wide view: one score line per available bank, sharing a 0-100
 * axis so a caregiver can compare activities without confusing difficulty with
 * performance. The points are intentionally sparse by domain; Chart.js leaves
 * gaps rather than inventing values for a game that was not played that day.
 */
export function performanceChartConfig(readings, { reducedMotion = false, language = 'en' } = {}) {
  const usable = (Array.isArray(readings) ? readings : [])
    .filter((reading) => reading && reading.series && reading.series.points.length)
    .map((reading) => ({
      ...reading,
      points: reading.series.points.map((point) => ({ ...point, domain: reading.bank.domain })),
    }));
  const points = usable
    .flatMap((reading) => reading.points)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-24);
  const pointKeys = points.map((point) => `${point.domain}-${point.timestamp}`);

  return {
    type: 'line',
    data: {
      labels: points.map((point) => point.label),
      datasets: usable.map((reading, index) => ({
        label: reading.bank.name,
        data: points.map((point, pointIndex) => (
          point.domain === reading.bank.domain && pointKeys[pointIndex] === `${point.domain}-${point.timestamp}`
            ? point.score
            : null
        )),
        borderColor: DOMAIN_COLOURS[index % DOMAIN_COLOURS.length],
        backgroundColor: DOMAIN_COLOURS[index % DOMAIN_COLOURS.length],
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.25,
        spanGaps: false,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 350 },
      interaction: { mode: 'nearest', intersect: false },
      layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 16, font: { size: 13 }, color: INK_SOFT, padding: 14 },
        },
        tooltip: {
          backgroundColor: '#14202e',
          titleFont: { size: 14 },
          bodyFont: { size: 14 },
          padding: 10,
          callbacks: {
            title: (items) => points[items[0].dataIndex]?.when || '',
            label: (item) => `${item.dataset.label}: ${item.parsed.y}%`,
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, font: { size: 13 }, color: INK_SOFT, callback: (v) => `${v}%` },
          grid: { color: 'rgba(20,32,46,0.08)' },
        title: { display: true, text: dashboardText(language, 'score'), font: { size: 13 }, color: INK_SOFT },
        },
        x: {
          ticks: { font: { size: 13 }, color: INK_SOFT, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          grid: { display: false },
        },
      },
    },
  };
}
