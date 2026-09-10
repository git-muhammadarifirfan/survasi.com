/**
 * @module features/peta/components
 * @description Komponen Peta GIS Sekolah Jawa Timur — Clean Flat Theme (No Liquid Glass, Matching Color Scheme, Font Poppins)
 */

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  School, 
  MapPin, 
  Search, 
  Filter, 
  AlertTriangle, 
  Building2, 
  Users, 
  Maximize2,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2
} from 'lucide-react';
import schoolDataRaw from '../../../shared/data/sekolah-map-data.json';
import CustomSelect from '../../../shared/components/CustomSelect';

export interface SchoolMapItem {
  id: string;
  npsn: string;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  alamat: string;
  latitude: number;
  longitude: number;
  hasCoordinates: boolean;
  status: 'sudah' | 'sebagian' | 'belum';
  respondenCount: number;
  totalGuru: number;
  totalSiswa: number;
  statusSekolah: string;
}

const schoolData = schoolDataRaw as SchoolMapItem[];

// Modern Sleek Pin Dot Marker (Clear & Distinct)
const createCustomMarkerIcon = (status: 'sudah' | 'sebagian' | 'belum') => {
  let colorHex = '#e11d48'; // Merah
  if (status === 'sudah') colorHex = '#10b981'; // Hijau
  if (status === 'sebagian') colorHex = '#f59e0b'; // Kuning

  const html = `
    <div style="
      position: relative;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: ${colorHex};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ffffff;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-modern-dot-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12]
  });
};

// Clean Minimalist Round Cluster Icon Generator (Perfectly Centered Circle Badge)
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 36;
  if (count > 50) size = 42;
  if (count > 200) size = 48;

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #4F46E5;
        color: #ffffff;
        border: 2.5px solid #ffffff;
        border-radius: 50%;
        font-size: ${count > 99 ? '11px' : '12px'};
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        line-height: 1;
        box-sizing: border-box;
      ">
        <span style="display: block; width: 100%; text-align: center; margin: 0; padding: 0;">${count}</span>
      </div>
    `,
    className: 'custom-sleek-cluster-icon',
    iconSize: L.point(size, size, true),
    iconAnchor: L.point(size / 2, size / 2)
  });
};

// Coordinates lookup for specific regions
const REGION_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'all': { center: [-7.6000, 112.5000], zoom: 9 },
  'Kab. Sidoarjo': { center: [-7.4478, 112.7183], zoom: 12 },
  'Kota Batu': { center: [-7.8700, 112.5270], zoom: 13 },
  'Kab. Tuban': { center: [-6.8970, 112.0450], zoom: 11 },
};

// Helper Component untuk manual zoom (tombol Zoom ke Lokasi)
function MapFlyToController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Helper Component untuk kontrol viewport & auto update pada filter & refresh
function MapController({ 
  selectedKabupaten, 
  selectedStatus,
  filteredSchools 
}: { 
  selectedKabupaten: string; 
  selectedStatus: string;
  filteredSchools: SchoolMapItem[];
}) {
  const map = useMap();
  
  React.useEffect(() => {
    // 1. Invalidate map size on load/render
    map.invalidateSize();

    // 2. Automatically adjust view based on selected kabupaten / status filter
    if (selectedKabupaten === 'all' && selectedStatus === 'all') {
      // Reset view to entire East Java region smoothly
      map.flyTo([-7.6000, 112.5000], 9, { duration: 0.8 });
    } else if (filteredSchools.length > 0) {
      if (selectedKabupaten !== 'all' && selectedStatus === 'all' && REGION_CENTERS[selectedKabupaten]) {
        // Direct center zoom if only kabupaten is selected
        const region = REGION_CENTERS[selectedKabupaten];
        map.flyTo(region.center, region.zoom, { duration: 0.8 });
      } else {
        // Fit bounds around active filtered markers (for status change or combined filter)
        const bounds = L.latLngBounds(filteredSchools.map(s => [s.latitude, s.longitude]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13, animate: true });
        }
      }
    }

    // Force Leaflet recalculation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedKabupaten, selectedStatus, filteredSchools, map]);

  return null;
}

export default function SchoolMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<SchoolMapItem | null>(null);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-7.6000, 112.5000]); // Default East Java View
  const [mapZoom, setMapZoom] = useState<number>(9);

  // Separate valid vs missing coordinate schools
  const { validSchools, missingSchools, kabupatenList } = useMemo(() => {
    const valid: SchoolMapItem[] = [];
    const missing: SchoolMapItem[] = [];
    const kabSet = new Set<string>();

    schoolData.forEach((s) => {
      kabSet.add(s.kabupaten);
      if (s.hasCoordinates) {
        valid.push(s);
      } else {
        missing.push(s);
      }
    });

    return {
      validSchools: valid,
      missingSchools: missing,
      kabupatenList: Array.from(kabSet)
    };
  }, []);

  // Filtered Schools with coordinates
  const filteredValidSchools = useMemo(() => {
    return validSchools.filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.npsn.includes(searchQuery) ||
        s.kecamatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKab = selectedKabupaten === 'all' || s.kabupaten === selectedKabupaten;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchSearch && matchKab && matchStatus;
    });
  }, [searchQuery, selectedKabupaten, selectedStatus, validSchools]);

  // Status Summary Stats
  const statusStats = useMemo(() => {
    const sudah = schoolData.filter(s => s.status === 'sudah').length;
    const sebagian = schoolData.filter(s => s.status === 'sebagian').length;
    const belum = schoolData.filter(s => s.status === 'belum').length;
    return { sudah, sebagian, belum, total: schoolData.length };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in font-sans">
      
      {/* Top Filter Bar (Clean & Responsive) */}
      <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
          <div className="relative min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Cari nama sekolah, NPSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans"
            />
          </div>

          <div className="w-full">
            <CustomSelect
              value={selectedKabupaten}
              onChange={(val) => setSelectedKabupaten(val)}
              options={[
                { value: 'all', label: 'Semua Wilayah' },
                ...kabupatenList.map(k => ({ value: k, label: k }))
              ]}
            />
          </div>

          <div className="w-full">
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'sudah', label: 'Sudah (Lengkap)' },
                { value: 'sebagian', label: 'Sebagian' },
                { value: 'belum', label: 'Belum' }
              ]}
            />
          </div>
        </div>

        {/* Missing Coordinates Trigger */}
        {missingSchools.length > 0 && (
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setShowMissingModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <AlertTriangle className="h-4 w-4 text-white shrink-0" />
              <span>{missingSchools.length} Tanpa Koordinat</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Legend Indicator Strip (Responsive Flex-Wrap) */}
      <div className="bg-surface p-3.5 rounded-2xl border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-bold text-text-primary flex items-center gap-1.5 shrink-0">
            <Filter className="h-3.5 w-3.5 text-primary" /> Status Survei:
          </span>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-text-secondary font-medium">Sudah:</span>
            <span className="font-bold text-text-primary">{statusStats.sudah}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-text-secondary font-medium">Sebagian:</span>
            <span className="font-bold text-text-primary">{statusStats.sebagian}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-text-secondary font-medium">Belum:</span>
            <span className="font-bold text-text-primary">{statusStats.belum}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-text-tertiary text-[11px] font-medium pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Menampilkan <strong className="text-text-primary">{filteredValidSchools.length}</strong> dari {statusStats.total} Sekolah</span>
        </div>
      </div>

      {/* Main Map Box & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Map Container (Responsive Height for Mobile/Tablet) */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-surface overflow-hidden shadow-card relative min-h-[420px] sm:min-h-[500px] lg:min-h-[560px]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', minHeight: '420px', zIndex: 1 }}
            className="rounded-2xl"
            whenReady={() => {
              window.dispatchEvent(new Event('resize'));
            }}
          >
            <MapController selectedKabupaten={selectedKabupaten} selectedStatus={selectedStatus} filteredSchools={filteredValidSchools} />
            <MapFlyToController center={mapCenter} zoom={mapZoom} />

            {/* OpenStreetMap Basemap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Smart Marker Cluster Group */}
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterCustomIcon}
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {filteredValidSchools.map((school) => (
                <Marker
                  key={school.id}
                  position={[school.latitude, school.longitude]}
                  icon={createCustomMarkerIcon(school.status)}
                  eventHandlers={{
                    click: () => setSelectedSchool(school)
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-1 space-y-1.5 text-slate-800 max-w-xs font-sans">
                      <div className="flex items-center justify-between gap-2 border-b pb-1">
                        <span className="text-[10px] font-mono text-slate-500">NPSN: {school.npsn}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded text-white ${
                          school.status === 'sudah' ? 'bg-emerald-600' :
                          school.status === 'sebagian' ? 'bg-amber-500' : 'bg-rose-600'
                        }`}>
                          {school.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {school.nama}
                      </h4>

                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <p>Kec. {school.kecamatan}, {school.kabupaten}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{school.alamat}</p>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-slate-200">
                        <span>Guru: <strong>{school.totalGuru}</strong></span>
                        <span>Siswa: <strong>{school.totalSiswa}</strong></span>
                        <span>Responden: <strong className="text-primary">{school.respondenCount}</strong></span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        {/* Right 1 Column / Mobile Bottom Drawer: Detail Panel */}
        <div className="space-y-3">
          {selectedSchool ? (
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-4 animate-tab-content font-sans">
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <span className="text-[10px] font-mono text-text-tertiary uppercase">NPSN: {selectedSchool.npsn}</span>
                  <h3 className="text-sm font-bold text-text-primary leading-snug">
                    {selectedSchool.nama}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Status Kuesioner:</span>
                  <span className={`font-bold text-[10px] uppercase px-3 py-1 rounded-full text-white shadow-sm ${
                    selectedSchool.status === 'sudah' ? 'bg-emerald-600' :
                    selectedSchool.status === 'sebagian' ? 'bg-amber-500' : 'bg-rose-600'
                  }`}>
                    {selectedSchool.status}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Kecamatan:</span>
                  <span className="font-semibold text-text-primary">{selectedSchool.kecamatan}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Kabupaten/Kota:</span>
                  <span className="font-semibold text-text-primary">{selectedSchool.kabupaten}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Bentuk / Status:</span>
                  <span className="font-semibold text-text-primary">SD {selectedSchool.statusSekolah}</span>
                </div>

                <div className="pt-1">
                  <span className="text-text-tertiary block mb-1">Alamat Jalan:</span>
                  <p className="text-[11px] text-text-secondary bg-background p-2.5 rounded-xl border border-border leading-relaxed">
                    {selectedSchool.alamat}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                  <span className="text-[10px] text-text-tertiary font-medium">Total Guru</span>
                  <p className="text-sm font-bold text-text-primary">{selectedSchool.totalGuru}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-background border border-border text-center">
                  <span className="text-[10px] text-text-tertiary font-medium">Total Siswa</span>
                  <p className="text-sm font-bold text-text-primary">{selectedSchool.totalSiswa}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setMapCenter([selectedSchool.latitude, selectedSchool.longitude]);
                  setMapZoom(16);
                }}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Zoom ke Lokasi Sekolah</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card text-center space-y-2.5 min-h-[160px] lg:min-h-[260px] flex flex-col items-center justify-center animate-fade-in">
              <Building2 className="h-7 w-7 text-primary opacity-60" />
              <h4 className="text-xs font-bold text-text-primary">Pilih Sekolah di Peta</h4>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Klik titik sekolah atau bulatan cluster untuk melihat rincian detail lokasi dan kuesioner.
              </p>
            </div>
          )}

          {/* Quick Stats Box */}
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card space-y-2.5 text-xs font-sans">
            <h4 className="font-bold text-text-primary uppercase tracking-wider">Cakupan Wilayah Mitra</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-text-secondary py-1 border-b border-border/50">
                <span>Kab. Sidoarjo</span>
                <span className="font-bold text-text-primary">588 SD</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary py-1 border-b border-border/50">
                <span>Kota Batu</span>
                <span className="font-bold text-text-primary">81 SD</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary py-1">
                <span>Kab. Tuban</span>
                <span className="font-bold text-text-primary">569 SD</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Missing Coordinates Checklist */}
      {showMissingModal && (
        <div className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up font-sans">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-text-primary">
                  Daftar Sekolah Belum Ada Koordinat ({missingSchools.length})
                </h3>
              </div>
              <button
                onClick={() => setShowMissingModal(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary">
              Sekolah berikut belum memiliki data Latitude & Longitude di file mentah Dapodik:
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {missingSchools.map((sch, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-background border border-border text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-text-primary">{sch.nama}</p>
                    <p className="text-[10px] text-text-tertiary">NPSN: {sch.npsn} | Kec. {sch.kecamatan}, {sch.kabupaten}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                    No Lat/Long
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowMissingModal(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Tutup Checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
