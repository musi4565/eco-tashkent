import { useEffect, useState } from 'react';
import api from '../api.js';

export default function StatsBanner() {
  const [stats, setStats] = useState({ itemsSaved: 0, activeUsers: 0, totalEcoPoints: 0 });

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data && typeof data === 'object' && !Array.isArray(data) ? data : {}))
      .catch(() => setStats({}));
  }, []);

  const items = [
    { icon: '♻️', value: stats.itemsSaved, label: 'Jami saqlangan buyumlar' },
    { icon: '👥', value: stats.activeUsers, label: 'Faol foydalanuvchilar' },
    { icon: '🏆', value: stats.totalEcoPoints, label: 'To\'plangan eko-ball' },
  ];

  return (
    <section className="bg-eco-700">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl bg-eco-800/60 p-4 text-white">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-eco-100">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
