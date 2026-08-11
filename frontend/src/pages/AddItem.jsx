import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES, CONDITIONS, TYPES, DISTRICTS } from '../constants.js';

const inputClass = 'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-eco-500 focus:outline-none';

export default function AddItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'texnika',
    condition: 'yaxshi',
    type: 'free',
    district: 'Chilonzor',
    address: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await api.post('/items', fd);
      navigate('/items');
    } catch (err) {
      setError(err.response?.data?.message || 'E\'lon joylashda xatolik');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Buyum e'lon qilish</h1>
      <p className="mb-6 text-sm text-gray-500">
        Buyum yangi egasini topsin — har bir topshirilgan buyum uchun <b>+20 eko-ball</b> olasiz.
      </p>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Rasm</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed text-sm transition ${preview ? 'border-transparent' : 'border-gray-300 text-gray-500 hover:border-eco-500 hover:text-eco-600'}`}
          >
            {preview ? (
              <img src={preview} alt="preview" className="h-full w-full rounded-xl object-cover" />
            ) : (
              <span className="text-3xl">📷 <span className="block text-sm">Rasm yuklash (ixtiyoriy, 5 MB gacha)</span></span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImage} className="hidden" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nomi *</label>
          <input value={form.title} onChange={set('title')} required placeholder="Masalan: ishlayotgan monitor" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tavsif</label>
          <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Buyum haqida ma'lumot, holati, qanday berilishi..." className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Kategoriya *</label>
            <select value={form.category} onChange={set('category')} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Holati *</label>
            <select value={form.condition} onChange={set('condition')} className={inputClass}>
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Turi *</label>
            <select value={form.type} onChange={set('type')} className={inputClass}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tuman *</label>
            <select value={form.district} onChange={set('district')} className={inputClass}>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Manzil (ixtiyoriy)</label>
          <input value={form.address} onChange={set('address')} placeholder="Ko'cha, uy raqami..." className={inputClass} />
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl bg-eco-600 py-3 font-semibold text-white shadow-sm transition hover:bg-eco-700 disabled:opacity-50"
        >
          {sending ? 'Joylanmoqda...' : '🌱 E\'lonni joylash'}
        </button>
      </form>
    </div>
  );
}
