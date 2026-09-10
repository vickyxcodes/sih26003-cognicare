import { useEffect, useRef, useState } from 'react';
import { performanceChartConfig } from '../lib/chartSpec.js';
import { loadChart } from './TrendChart.jsx';
import { dashboardText } from '../lib/i18n.js';

const reducedMotion = () => typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PerformanceChart({ readings, language = 'en', height = 360 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);
  const hasData = (readings || []).some((reading) => reading.series.points.length);

  useEffect(() => {
    if (!hasData) return undefined;
    let cancelled = false;
    setUnavailable(false);
    loadChart()
      .then((Chart) => {
        if (cancelled || !canvasRef.current) return;
        if (chartRef.current) chartRef.current.destroy();
        chartRef.current = new Chart(
          canvasRef.current,
          performanceChartConfig(readings, { reducedMotion: reducedMotion(), language })
        );
      })
      .catch((error) => {
        console.warn('[CogniCare] the performance chart could not be loaded', error);
        if (!cancelled) setUnavailable(true);
      });
    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [readings, hasData, language]);

  if (!hasData) {
    return (
      <div className="dashboard-empty-state">
        <p className="font-semibold text-ink">{dashboardText(language, 'noCognitive')}</p>
        <p className="mt-1 text-ink-soft">{dashboardText(language, 'chartPrompt')}</p>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="dashboard-empty-state">
        <p className="font-semibold text-ink">{dashboardText(language, 'chartUnavailable')}</p>
        <p className="mt-1 text-ink-soft">{dashboardText(language, 'chartFallback')}</p>
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }} className="relative w-full">
      <canvas ref={canvasRef} role="img" aria-label={dashboardText(language, 'chartAria')} />
    </div>
  );
}
