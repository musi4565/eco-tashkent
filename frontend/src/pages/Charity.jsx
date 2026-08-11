import { useEffect, useState } from 'react';
import api from '../api.js';
import ItemCard from '../components/ItemCard.jsx';

export default function Charity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/items', { params: { type: 'charity', status: 'active' } })
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-amber-100 to-eco-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">💛 Xayriya bo'limi</h1>
        <p className="mt-1 text-sm text-gray-700">
          Ehtiyojmand oilalar va tashkilotlar uchun ajratilgan e'lonlar. Har bir berilgan buyum — kimgadir yangi imkoniyat.
        </p>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="py-16 text-center text-gray-500">Yuklanmoqda...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            Hozircha xayriya e'lonlari yo'q. Bepul e'lon berishda "Xayriya" turini tanlang! 🌱
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
