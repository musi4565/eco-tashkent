import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.phone, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tizimga kirish</h1>
        <p className="mt-1 text-sm text-gray-500">Eko-jamiyatga xush kelibsiz! 🌿</p>

        <div className="mt-4 rounded-xl border border-eco-200 bg-eco-50 p-3 text-xs text-eco-800">
          <b>Demo akkaunt:</b> <span className="font-mono">+998900000001</span> / <span className="font-mono">demo123</span>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
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
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Parol</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-eco-500 focus:outline-none"
            />
          </div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-eco-600 py-3 font-semibold text-white shadow-sm transition hover:bg-eco-700 disabled:opacity-50"
          >
            {loading ? 'Kiritilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="font-semibold text-eco-600 hover:underline">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  );
}
