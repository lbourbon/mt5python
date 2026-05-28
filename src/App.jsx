import { useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import './App.css'

const DATA_1D = [
  { time: '09:00', price: 28.50 },
  { time: '09:30', price: 28.75 },
  { time: '10:00', price: 29.10 },
  { time: '10:30', price: 28.90 },
  { time: '11:00', price: 29.40 },
  { time: '11:30', price: 29.80 },
  { time: '12:00', price: 29.60 },
  { time: '12:30', price: 30.10 },
  { time: '13:00', price: 30.50 },
  { time: '13:30', price: 30.20 },
  { time: '14:00', price: 30.80 },
  { time: '14:30', price: 31.00 },
  { time: '15:00', price: 30.70 },
  { time: '15:30', price: 31.20 },
  { time: '16:00', price: 31.50 },
  { time: '16:30', price: 31.30 },
  { time: '17:00', price: 31.80 },
]

const DATA_1W = [
  { time: 'Seg', price: 28.50 },
  { time: 'Ter', price: 29.20 },
  { time: 'Qua', price: 28.80 },
  { time: 'Qui', price: 30.10 },
  { time: 'Sex', price: 31.80 },
]

const DATA_1M = [
  { time: '01/05', price: 26.00 },
  { time: '05/05', price: 27.30 },
  { time: '10/05', price: 27.80 },
  { time: '15/05', price: 28.50 },
  { time: '20/05', price: 29.20 },
  { time: '25/05', price: 30.10 },
  { time: '28/05', price: 31.80 },
]

const PERIODS = [
  { label: '1D', data: DATA_1D },
  { label: '1S', data: DATA_1W },
  { label: '1M', data: DATA_1M },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1e1e2e',
        border: '1px solid #3a3a5c',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
      }}>
        <div style={{ color: '#888', marginBottom: 2 }}>{label}</div>
        <div style={{ color: '#00d4aa', fontWeight: 700 }}>
          R$ {payload[0].value.toFixed(2)}
        </div>
      </div>
    )
  }
  return null
}

function App() {
  const [activePeriod, setActivePeriod] = useState(0)

  const data = PERIODS[activePeriod].data
  const first = data[0].price
  const last = data[data.length - 1].price
  const change = last - first
  const changePct = ((change / first) * 100).toFixed(2)
  const isPositive = change >= 0

  const minPrice = Math.min(...data.map(d => d.price)) * 0.998
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.002

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f0f1a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
      padding: '0 0 32px',
    }}>
      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>PETR4 · B3</div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px' }}>
          R$ {last.toFixed(2)}
        </div>
        <div style={{
          fontSize: 14,
          color: isPositive ? '#00d4aa' : '#ff5e5e',
          marginTop: 4,
          fontWeight: 600,
        }}>
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePct}%)
        </div>
      </div>

      <div style={{ width: '100%', padding: '8px 0' }}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#00d4aa' : '#ff5e5e'} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isPositive ? '#00d4aa' : '#ff5e5e'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#00d4aa' : '#ff5e5e'}
              strokeWidth={2}
              fill="url(#colorPrice)"
              dot={false}
              activeDot={{ r: 5, fill: isPositive ? '#00d4aa' : '#ff5e5e' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: 'flex',
        gap: 8,
        padding: '0 20px',
        marginTop: 8,
      }}>
        {PERIODS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setActivePeriod(i)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              background: activePeriod === i ? (isPositive ? '#00d4aa' : '#ff5e5e') : '#1e1e2e',
              color: activePeriod === i ? '#0f0f1a' : '#888',
              transition: 'all 0.2s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: '20px 20px 0',
      }}>
        {[
          { label: 'Abertura', value: `R$ ${first.toFixed(2)}` },
          { label: 'Máxima', value: `R$ ${maxPrice.toFixed(2)}` },
          { label: 'Mínima', value: `R$ ${minPrice.toFixed(2)}` },
          { label: 'Volume', value: '42.3M' },
        ].map(item => (
          <div key={item.label} style={{
            background: '#1e1e2e',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
