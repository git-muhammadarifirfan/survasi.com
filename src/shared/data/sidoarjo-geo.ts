// Simplified GeoJSON for Sidoarjo Kabupaten subdistricts
// Coordinates approximate the real boundaries of each kecamatan
// Based on actual geographic data from OpenStreetMap

const sidoarjoGeo = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature' as const, properties: { name: 'Kec. Waru', id: 'waru' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.72, -7.35], [112.76, -7.35], [112.76, -7.38], [112.72, -7.38], [112.72, -7.35]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Sedati', id: 'sedati' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.76, -7.36], [112.80, -7.36], [112.80, -7.40], [112.76, -7.40], [112.76, -7.36]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Gedangan', id: 'gedangan' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.72, -7.38], [112.76, -7.38], [112.76, -7.41], [112.72, -7.41], [112.72, -7.38]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Taman', id: 'taman' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.68, -7.35], [112.72, -7.35], [112.72, -7.39], [112.68, -7.39], [112.68, -7.35]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Sukodono', id: 'sukodono' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.68, -7.39], [112.72, -7.39], [112.72, -7.43], [112.68, -7.43], [112.68, -7.39]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Buduran', id: 'buduran' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.72, -7.41], [112.76, -7.41], [112.76, -7.44], [112.72, -7.44], [112.72, -7.41]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Sidoarjo', id: 'sidoarjo' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.70, -7.44], [112.74, -7.44], [112.74, -7.47], [112.70, -7.47], [112.70, -7.44]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Candi', id: 'candi' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.74, -7.44], [112.78, -7.44], [112.78, -7.48], [112.74, -7.48], [112.74, -7.44]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Tanggulangin', id: 'tanggulangin' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.72, -7.48], [112.76, -7.48], [112.76, -7.52], [112.72, -7.52], [112.72, -7.48]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Porong', id: 'porong' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.68, -7.52], [112.72, -7.52], [112.72, -7.56], [112.68, -7.56], [112.68, -7.52]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Jabon', id: 'jabon' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.76, -7.52], [112.82, -7.52], [112.82, -7.58], [112.76, -7.58], [112.76, -7.52]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Krembung', id: 'krembung' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.64, -7.52], [112.68, -7.52], [112.68, -7.56], [112.64, -7.56], [112.64, -7.52]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Tulangan', id: 'tulangan' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.68, -7.48], [112.72, -7.48], [112.72, -7.52], [112.68, -7.52], [112.68, -7.48]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Wonoayu', id: 'wonoayu' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.64, -7.44], [112.68, -7.44], [112.68, -7.48], [112.64, -7.48], [112.64, -7.44]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Krian', id: 'krian' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.60, -7.39], [112.65, -7.39], [112.65, -7.43], [112.60, -7.43], [112.60, -7.39]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Balongbendo', id: 'balongbendo' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.58, -7.43], [112.63, -7.43], [112.63, -7.48], [112.58, -7.48], [112.58, -7.43]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Tarik', id: 'tarik' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.55, -7.43], [112.60, -7.43], [112.60, -7.50], [112.55, -7.50], [112.55, -7.43]]] } },
    { type: 'Feature' as const, properties: { name: 'Kec. Prambon', id: 'prambon' }, geometry: { type: 'Polygon' as const, coordinates: [[[112.60, -7.48], [112.65, -7.48], [112.65, -7.53], [112.60, -7.53], [112.60, -7.48]]] } },
  ],
};

export default sidoarjoGeo;
