import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.phone, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Ro'yxatdan o'tish</h1>
        <p className="mt-1 text-sm text-gray-500">Eko-jamiyatga qo'shiling — ball to'plang 🌿</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Ismingiz</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Aziz Karimov"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-eco-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Telefon raqami</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+998 90 000 00 00"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-eco-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Parol (kamida 6 belgi)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
              required
              minLength={6}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-eco-500 focus:outline-none"
            />
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-eco-600 py-3 font-semibold text-white shadow-sm transition hover:bg-eco-700 disabled:opacity-50"
          >
            {loading ? 'Yaratilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Hisobingiz bormi?{' '}
          <Link to="/login" className="font-semibold text-eco-600 hover:underline">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
