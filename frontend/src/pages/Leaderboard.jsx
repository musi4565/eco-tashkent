import { useEffect, useState } from 'react';
import api from '../api.js';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/stats/leaderboard').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Top-donorlar reytingi</h1>
      <p className="mb-6 text-sm text-gray-500">
        Eng ko'p buyum topshirgan va eko-ball to'plagan foydalanuvchilar. Buyum topshirganingiz sayin +20 ball olasiz!
      </p>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          Reyting hali bo'sh — birinchi bo'ling! 🌱
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u, i) => (
            <div
              key={u.id}
              className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm ${i === 0 ? 'border-eco-400 bg-eco-50' : 'border-gray-200'}`}
            >
              <span className="w-10 text-center text-2xl">{MEDALS[i] || <span className="text-lg font-bold text-gray-400">{i + 1}</span>}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500">📞 {u.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-eco-700">{u.ecoPoints} ball</p>
                <p className="text-xs text-gray-500">♻️ {u.savedKg} kg chiqindi saqlangan</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
