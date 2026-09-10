import { Lightbulb, ArrowRight, ExternalLink } from 'lucide-react';

interface Recommendation {
  id: string;
  context: string;
  suggestion: string;
  actionText: string;
  actionLink: string;
}

interface RecommendationWidgetProps {
  recommendations: Recommendation[];
}

export default function RecommendationWidget({ recommendations }: RecommendationWidgetProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-surface to-accent/5 p-6 shadow-card border border-primary/20 h-full">
      <div className="flex items-center space-x-3 mb-5">
        <div className="p-2.5 bg-primary rounded-xl shadow-sm">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary font-display">Rekomendasi Pintar</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Berdasarkan hasil pengisian survei Anda</p>
        </div>
      </div>
      
      {recommendations.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-text-secondary">Silakan isi survei terlebih dahulu untuk mendapatkan rekomendasi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-border group hover:border-primary/40 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:bg-accent transition-colors" />
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">{rec.context}</p>
              <p className="text-sm text-text-primary font-medium mb-3 leading-relaxed">{rec.suggestion}</p>
              <a href={rec.actionLink} className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors">
                {rec.actionText}
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
