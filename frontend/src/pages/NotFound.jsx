import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-6xl">🍃</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">404 — Sahifa topilmadi</h1>
      <p className="mt-2 text-gray-500">Siz izlagan sahifa mavjud emas yoki ko'chirilgan.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-eco-600 px-6 py-3 font-semibold text-white hover:bg-eco-700">
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
