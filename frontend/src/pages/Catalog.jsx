import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api.js';
import ItemCard from '../components/ItemCard.jsx';
import { CATEGORIES, DISTRICTS, TYPES } from '../constants.js';

const selectClass = 'rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-eco-500 focus:outline-none';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('search') || '');

  const filters = {
    category: params.get('category') || 'all',
    district: params.get('district') || 'all',
    type: params.get('type') || 'all',
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = {};
      if (filters.category !== 'all') q.category = filters.category;
      if (filters.district !== 'all') q.district = filters.district;
      if (filters.type !== 'all') q.type = filters.type;
      if (search.trim()) q.search = search.trim();
      q.status = 'active';
      const { data } = await api.get('/items', { params: q });
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.district, filters.type, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">E'lonlar lentasi</h1>

      <div className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Buyum qidirish... (masalan: monitor, kitob)"
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-eco-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className={selectClass}>
            <option value="all">Barcha kategoriyalar</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filters.district} onChange={(e) => setFilter('district', e.target.value)} className={selectClass}>
            <option value="all">Barcha tumanlar</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className={selectClass}>
            <option value="all">Barcha turlar</option>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-500">Yuklanmoqda...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          Hech narsa topilmadi. Filtrlarni o'zgartirib ko'ring. 🌱
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
