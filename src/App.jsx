import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'

export default function App() {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: { background: { color: '#0d1117' }, textColor: '#e6edf3' },
      grid: { vertLines: { color: '#1e2736' }, horzLines: { color: '#1e2736' } },
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#2d3748' },
      rightPriceScale: { borderColor: '#2d3748' },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00d4aa',
      downColor: '#ff5e5e',
      borderUpColor: '#00d4aa',
      borderDownColor: '#ff5e5e',
      wickUpColor: '#00d4aa',
      wickDownColor: '#ff5e5e',
    })

    chartRef.current = { chart, series }

    fetch('/api/candles')
      .then(r => r.json())
      .then(data => {
        if (!data.length) { setError('Sem dados para 27/05/2026'); return }
        series.setData(data)
        chart.timeScale().fitContent()
      })
      .catch(() => setError('Erro ao carregar dados'))

    const onResize = () => {
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      chart.remove()
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100dvh', background: '#0d1117', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#ff5e5e', fontFamily: 'sans-serif', fontSize: 16,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
