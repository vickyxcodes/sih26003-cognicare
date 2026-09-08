import { useEffect, useRef, useState } from 'react';
import { chartConfig } from '../lib/chartSpec.js';

/**
 * TrendChart - the only file in the app that touches Chart.js.
 *
 * Chart.js is loaded by dynamic `import()` for the same reason Firebase is: the
 * patient never opens this screen, and a chart library has no business in the
 * bundle that has to start instantly on an old tablet. Vite emits it as its own
 * chunk, which the service worker precaches like any other asset.
 *
 * What the chart looks like is not decided here - `src/lib/chartSpec.js` holds
 * the configuration as plain data so `node --test` can assert the axes, the
 * tooltips and the reduced-motion behaviour without a browser. This file is the
 * lifetime and nothing else.
 *
 * Cleanup is the part that has to be right. A Chart.js instance owns the canvas
 * and its own resize listener, so the same effect that creates one destroys it -
 * on unmount, and before every rebuild when the data changes. React runs the
 * cleanup before re-running the effect, so `chartRef` can never point at a chart
 * whose canvas has gone, and the `cancelled` flag covers the case where the
 * dynamic import resolves after the component has already left the screen.
 *
 * The chart is a picture of a reading, never the reading itself: the sentence
 * under it comes from `trends.js` and is what the caregiver is meant to take
 * away.
 */

let chartLib = null;

function loadChart() {
  if (!chartLib) {
    chartLib = import('chart.js/auto')
      .then((mod) => mod.default || mod.Chart)
      .catch((error) => {
        chartLib = null; // a failed chunk must not poison the next attempt
        throw error;
      });
  }
  return chartLib;
}

const prefersReducedMotion = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STATE = { loading: 'loading', ready: 'ready', unavailable: 'unavailable' };

export default function TrendChart({ series, caption = '', height = 260 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [state, setState] = useState(STATE.loading);
  const points = (series && series.points) || [];
  const hasData = points.length > 0;

  useEffect(() => {
    if (!hasData) return undefined;
    let cancelled = false;

    loadChart()
      .then((Chart) => {
        if (cancelled || !canvasRef.current) return;
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
        chartRef.current = new Chart(
          canvasRef.current,
          chartConfig(series, { reducedMotion: prefersReducedMotion() })
        );
        setState(STATE.ready);
      })
      .catch((error) => {
        console.warn('[CogniCare] the chart library could not be loaded', error);
        if (!cancelled) setState(STATE.unavailable);
      });

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [series, hasData]);

  if (!hasData) {
    return (
      <p className="rounded-xl2 border-2 border-dashed border-ink-soft/25 px-4 py-10 text-center text-ink-soft">
        Nothing to chart yet.
      </p>
    );
  }

  if (state === STATE.unavailable) {
    /* The numbers still have to be readable without the library: a caregiver on
     * a flaky connection gets the sessions as a list rather than a blank box. */
    return (
      <div className="rounded-xl2 border-2 border-dashed border-warn/40 bg-warn-light px-4 py-4">
        <p className="font-semibold text-ink">The chart could not be drawn on this device.</p>
        <p className="mt-1 text-ink-soft">
          The sessions themselves are fine - here they are, oldest first.
        </p>
        <ol className="mt-3 space-y-1 text-ink">
          {points.map((point) => (
            <li key={point.timestamp}>
              {point.label}: {point.score}% correct, difficulty level {point.tier} of 3
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <figure className="m-0">
      <div style={{ height: `${height}px` }} className="relative">
        <canvas ref={canvasRef} role="img" aria-label={caption || 'Session trend chart'} />
      </div>
      {caption ? <figcaption className="sr-only">{caption}</figcaption> : null}
    </figure>
  );
}
