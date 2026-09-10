// GeoJSON for East Java Regencies matching Peta_Wilayah_Mitra_Jatim.pptx
export const jawaTimurGeo = {
  type: 'FeatureCollection' as const,
  features: [
    // FASE 1 & FASE 3 TARGET REGENCY (DATA AVAILABLE)
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Sidoarjo', id: 'sidoarjo', fase: 'Fase 1 & 3', hasData: true, color: '#4A57C4' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.65, -7.34], [112.82, -7.35], [112.84, -7.58], [112.62, -7.57], [112.65, -7.34]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kota Batu', id: 'batu', fase: 'Fase 1', hasData: true, color: '#6C7AE0' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.48, -7.78], [112.58, -7.75], [112.57, -7.90], [112.46, -7.88], [112.48, -7.78]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Tuban', id: 'tuban', fase: 'Fase 3', hasData: true, color: '#2FB344' },
      geometry: { type: 'Polygon' as const, coordinates: [[[111.55, -6.78], [112.18, -6.82], [112.15, -7.15], [111.60, -7.10], [111.55, -6.78]]] }
    },

    // OTHER PHASE REGIONS FROM PPTX (Fase 1, 2, 3)
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Pasuruan', id: 'pasuruan', fase: 'Fase 1', hasData: false, color: '#9099EB' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.62, -7.58], [113.05, -7.58], [113.00, -7.88], [112.60, -7.85], [112.62, -7.58]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Probolinggo', id: 'probolinggo', fase: 'Fase 1, 2 & 3', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[113.05, -7.70], [113.55, -7.70], [113.50, -8.05], [113.00, -8.00], [113.05, -7.70]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Sumenep', id: 'sumenep', fase: 'Fase 1 & 2', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[113.55, -6.85], [114.10, -6.85], [114.05, -7.15], [113.50, -7.15], [113.55, -6.85]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kota Surabaya', id: 'surabaya', fase: 'Fase 2', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.62, -7.18], [112.82, -7.18], [112.80, -7.34], [112.64, -7.34], [112.62, -7.18]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Gresik', id: 'gresik', fase: 'Fase 2', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.42, -6.90], [112.65, -6.90], [112.62, -7.28], [112.40, -7.25], [112.42, -6.90]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Jombang', id: 'jombang', fase: 'Fase 2', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.12, -7.35], [112.42, -7.35], [112.38, -7.72], [112.10, -7.68], [112.12, -7.35]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Mojokerto', id: 'mojokerto', fase: 'Fase 2', hasData: false, color: '#F5A623' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.32, -7.30], [112.62, -7.30], [112.58, -7.65], [112.30, -7.62], [112.32, -7.30]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Lumajang', id: 'lumajang', fase: 'Fase 3', hasData: false, color: '#2FB344' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.95, -8.00], [113.35, -8.00], [113.30, -8.35], [112.90, -8.30], [112.95, -8.00]]] }
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Kab. Malang', id: 'malang', fase: 'Kawasan', hasData: false, color: '#E8E9F5' },
      geometry: { type: 'Polygon' as const, coordinates: [[[112.35, -7.70], [112.95, -7.70], [112.90, -8.35], [112.30, -8.30], [112.35, -7.70]]] }
    }
  ]
};

export default jawaTimurGeo;
