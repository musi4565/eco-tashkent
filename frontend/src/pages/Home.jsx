import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import ItemCard from '../components/ItemCard.jsx';
import StatsBanner from '../components/StatsBanner.jsx';

const STEPS = [
  { icon: '📸', title: 'E\'lon qiling', text: 'Keraksiz buyumning rasmini yuklab, e\'lon bering' },
  { icon: '🔎', title: 'Toping', text: 'O\'zingizga kerakli buyumni lentadan yoki xaritadan toping' },
  { icon: '💬', title: 'Bog\'laning', text: '"Qiziqaman" tugmasi orqali egasi bilan bog\'laning' },
  { icon: '🌱', title: 'Yangi hayot', text: 'Buyum ikkinchi hayotga ega bo\'lsin — eko-ball oling' },
];

export default function Home() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/items', { params: { status: 'active' } })
      .then(({ data }) => setRecent(data.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-b from-eco-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <p className="mb-3 inline-block rounded-full bg-eco-100 px-4 py-1.5 text-sm font-medium text-eco-800">
            🌿 Toshkent ekotizimi · Buyumlar yangi hayotga ega bo'ladi
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Keraksiz buyumingizni{' '}
            <span className="text-eco-600">boshqalarga bering</span> — tabiatni asrang
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Texnika, mebel, kitob va kiyimlarni bepul bering, almashtiring yoki xayriya qiling.
            Yaqiningizdagi qayta ishlash punktlarini xaritadan toping.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/add" className="rounded-xl bg-eco-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-eco-700">
              + Buyum e'lon qilish
            </Link>
            <Link to="/items" className="rounded-xl border border-eco-600 bg-white px-6 py-3 font-semibold text-eco-700 transition hover:bg-eco-50">
              E'lonlarni ko'rish
            </Link>
            <Link to="/map" className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50">
              🗺️ Qayta ishlash xaritasi
            </Link>
          </div>
        </div>
      </section>

      <StatsBanner />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Qanday ishlaydi?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-eco-100 text-3xl">
                {s.icon}
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-eco-600">Qadam {i + 1}</p>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">So'nggi e'lonlar</h2>
          <Link to="/items" className="text-sm font-semibold text-eco-600 hover:text-eco-700">Barchasi →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            Hozircha e'lonlar yo'q — birinchi bo'lib e'lon bering! 🌱
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  );
}
