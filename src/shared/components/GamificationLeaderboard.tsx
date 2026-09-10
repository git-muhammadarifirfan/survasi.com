import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';
import type { KecamatanStat } from '../../shared/data/data-source';

interface GamificationLeaderboardProps {
  data: KecamatanStat[];
}

export default function GamificationLeaderboard({ data }: GamificationLeaderboardProps) {
  // Sort by rate descending
  const sorted = [...data].sort((a, b) => b.rate - a.rate);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse(); // Worst at the top of bottom list

  return (
    <div className="rounded-2xl bg-surface p-6 shadow-card border border-border mt-5 h-full">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary font-display">Leaderboard Kecamatan</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Berdasarkan tingkat respons sekolah</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-status-sudah flex items-center mb-3">
            <TrendingUp className="h-3 w-3 mr-1" /> Top 3 Terbaik
          </h4>
          <div className="space-y-2">
            {top3.map((k, idx) => (
              <div key={k.kecamatan} className="flex items-center justify-between p-2 rounded-xl bg-status-sudah/5 border border-status-sudah/10">
                <div className="flex items-center space-x-3">
                  <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-800' :
                    'bg-amber-600 text-amber-50'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{k.kecamatan}</p>
                    <p className="text-[10px] text-text-secondary">{k.kabupaten}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{k.rate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-status-belum flex items-center mb-3">
            <TrendingDown className="h-3 w-3 mr-1" /> 3 Terbawah (Butuh Atensi)
          </h4>
          <div className="space-y-2">
            {bottom3.map((k, idx) => (
              <div key={k.kecamatan} className="flex items-center justify-between p-2 rounded-xl bg-status-belum/5 border border-status-belum/10">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 rounded-full bg-status-belum/10 flex items-center justify-center text-status-belum font-bold text-xs">
                    !
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{k.kecamatan}</p>
                    <p className="text-[10px] text-text-secondary">{k.kabupaten}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-status-belum">{k.rate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
