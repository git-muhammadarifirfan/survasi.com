import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RadarPoint } from '../../shared/data/data-source';

interface RadarBenchmarkingChartProps {
  data: RadarPoint[];
}

export default function RadarBenchmarkingChart({ data }: RadarBenchmarkingChartProps) {
  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 10 }}
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
          <Radar 
            name="Sekolah Anda" 
            dataKey="sekolah" 
            stroke="var(--color-primary)" 
            fill="var(--color-primary)" 
            fillOpacity={0.5} 
          />
          <Radar 
            name="Rata-rata Kecamatan" 
            dataKey="kecamatan" 
            stroke="var(--color-accent)" 
            fill="var(--color-accent)" 
            fillOpacity={0.3} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
