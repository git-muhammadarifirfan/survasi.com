import { AlertTriangle } from 'lucide-react';

interface Anomaly {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface AnomalyWidgetProps {
  anomalies: Anomaly[];
}

export default function AnomalyWidget({ anomalies }: AnomalyWidgetProps) {
  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card border border-border mt-5 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-status-belum/10 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-status-belum" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary font-display">Sistem Peringatan Dini</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Deteksi anomali data otomatis</p>
        </div>
      </div>
      
      {anomalies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-status-sudah/10 flex items-center justify-center mb-3">
            <span className="text-status-sudah text-xl">✓</span>
          </div>
          <p className="text-sm font-medium text-text-primary">Tidak ada anomali terdeteksi</p>
          <p className="text-xs text-text-secondary mt-1">Kualitas data survei saat ini sangat baik</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map(anomaly => (
            <div key={anomaly.id} className="p-3 rounded-xl border border-status-belum/20 bg-status-belum/5 flex gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  anomaly.severity === 'high' ? 'bg-status-belum animate-pulse' : 
                  anomaly.severity === 'medium' ? 'bg-accent' : 'bg-status-sebagian'
                }`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">{anomaly.title}</h4>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">{anomaly.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
