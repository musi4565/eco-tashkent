import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import api from '../api.js';

const TASHKENT = [41.3111, 69.2797];

const MATERIAL_ICONS = {
  'plastik': '🥤',
  'qog\'oz': '📄',
  'shisha': '🍾',
  'batareyka': '🔋',
  'kiyim': '👕',
  'texnika': '💻',
};

const MATERIAL_LABELS = {
  'plastik': 'Plastik',
  'qog\'oz': 'Qog\'oz',
  'shisha': 'Shisha',
  'batareyka': 'Batareyka',
  'kiyim': 'Kiyim',
  'texnika': 'Texnika',
};

export default function MapPage() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [points, setPoints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map('eco-map').setView(TASHKENT, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    api.get('/map/points').then(({ data }) => setPoints(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const filtered = typeFilter === 'all' ? points : points.filter((p) => p.type === typeFilter);
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const divIcon = L.divIcon({
      className: '',
      html: `<div style="font-size:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))">${typeFilter === 'all' ? '♻️' : '📍'}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    filtered.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: divIcon }).addTo(mapRef.current);
      marker.on('click', () => setSelected(p));
      markersRef.current.push(marker);
    });
  }, [points, typeFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Qayta ishlash / saralash punktlari</h1>
      <p className="mb-4 text-sm text-gray-500">Toshkentdagi recycling va sorting punktlari — har bir nuqtada nima qabul qilinishini bilib oling.</p>

      <div className="mb-4 flex gap-2">
        {[
          { value: 'all', label: '♻️ Barchasi' },
          { value: 'recycling', label: 'Qayta ishlash' },
          { value: 'sorting', label: 'Saralash' },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${typeFilter === t.value ? 'bg-eco-600 text-white' : 'border border-gray-300 bg-white text-gray-600 hover:border-eco-500'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div id="eco-map" className="h-96 w-full lg:col-span-2" style={{ zIndex: 10 }} />

        <div className="space-y-3">
          {selected ? (
            <div className="rounded-2xl border border-eco-200 bg-eco-50 p-4">
              <h2 className="font-bold text-gray-900">♻️ {selected.name}</h2>
              <p className="mt-1 text-sm text-gray-600">
                <span className="rounded-full bg-eco-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {selected.type === 'recycling' ? 'Qayta ishlash' : 'Saralash'}
                </span>
              </p>
              <p className="mt-2 text-sm text-gray-600">📍 {selected.address}</p>
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-gray-500">Qabul qilinadi:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.acceptedMaterials.map((m) => (
                    <span key={m} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
                      {MATERIAL_ICONS[m] || '📦'} {MATERIAL_LABELS[m] || m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
              Xaritadagi nuqtani bosing — <br />o'sha punkt haqida ma'lumot chiqadi.
            </div>
          )}

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {points.filter((p) => typeFilter === 'all' || p.type === typeFilter).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  if (mapRef.current) mapRef.current.setView([p.lat, p.lng], 14);
                }}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left text-sm transition hover:border-eco-500"
              >
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">
                  {p.type === 'recycling' ? 'Qayta ishlash' : 'Saralash'} · {p.acceptedMaterials.map((m) => MATERIAL_LABELS[m] || m).join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
