/**
 * @module features/peta/pages
 * @description Halaman Peta Geospasial Interaktif Kecamatan & Titik Lokasi Sekolah Jawa Timur
 */

import React, { useState } from 'react';
import { Map, School as SchoolIcon, Sparkles } from 'lucide-react';
import SchoolMap from '../components/SchoolMap';

export default function KecamatanMapPage() {
  const [activeTab, setActiveTab] = useState<'schools' | 'overview'>('schools');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Production Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-5 rounded-2xl border border-border shadow-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
              Peta Geospasial GIS
            </span>
            <span className="text-xs text-text-tertiary">| Jawa Timur</span>
          </div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            Peta Persebaran Titik Lokasi Sekolah
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary bg-background px-3.5 py-2 rounded-xl border border-border">
          <SchoolIcon className="h-4 w-4 text-primary" />
          <span className="font-semibold">Pemetaan Geografis Sekolah</span>
        </div>
      </div>

      {/* Main Content Render */}
      <SchoolMap />
    </div>
  );
}
