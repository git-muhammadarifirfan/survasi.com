import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TimeSeriesPoint } from '../../shared/data/data-source';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
}

/** Tren harian: batang = survei terkirim per hari, garis = akumulasi sekolah selesai. */
export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 8, left: -18, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} tickMargin={8} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis yAxisId="l" allowDecimals={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="r" orientation="right" allowDecimals={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} />
          <Bar yAxisId="l" dataKey="responden" name="Survei terkirim / hari" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Line yAxisId="r" type="monotone" dataKey="kumulatif" name="Akumulasi sekolah selesai" stroke="var(--status-sudah)" strokeWidth={2.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
