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

/** Same teal as the app's primary; the difficulty line reuses the warn orange. */
const SCORE_COLOUR = '#0f766e';
const LEVEL_COLOUR = '#b45309';
const INK_SOFT = '#3d4a5c';

export function chartConfig(series, { reducedMotion = false } = {}) {
  const points = (series && series.points) || [];
  return {
    type: 'line',
    data: {
      labels: (series && series.labels) || [],
      datasets: [
        {
          label: 'Answers correct',
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
          label: 'Difficulty level',
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
              ? `${item.parsed.y}% of answers correct`
              : `Difficulty level ${item.parsed.y} of ${TIER_MAX}`),
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
          title: { display: true, text: 'Answers correct', font: { size: 13 }, color: INK_SOFT },
        },
        level: {
          position: 'right',
          min: 1,
          max: TIER_MAX,
          ticks: { stepSize: 1, font: { size: 13 }, color: LEVEL_COLOUR },
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Difficulty', font: { size: 13 }, color: LEVEL_COLOUR },
        },
        x: {
          ticks: { font: { size: 13 }, color: INK_SOFT, maxRotation: 0, autoSkipPadding: 12 },
          grid: { display: false },
        },
      },
    },
  };
}
