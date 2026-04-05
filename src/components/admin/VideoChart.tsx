'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { month: string; count: number }[]
}

export function VideoChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e8e8e8', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          labelStyle={{ fontWeight: 600, color: '#181818' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#BF1725"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#BF1725', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#BF1725' }}
          name="Videos"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
