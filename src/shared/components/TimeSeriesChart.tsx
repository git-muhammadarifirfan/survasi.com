import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TimeSeriesPoint } from '../../shared/data/data-source';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} 
            tickMargin={10} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-surface)', 
              borderColor: 'var(--color-border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-card)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Line 
            type="monotone" 
            name="Lengkap (Selesai)"
            dataKey="sudah" 
            stroke="var(--status-sudah)" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            name="Sebagian (Proses)"
            dataKey="sebagian" 
            stroke="var(--status-sebagian)" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
