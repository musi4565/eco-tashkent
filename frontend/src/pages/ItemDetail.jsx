import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api, { imageUrl } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { categoryLabel, conditionLabel, typeLabel, TYPE_COLORS, STATUS_LABELS } from '../constants.js';

const fallback = { texnika: '💻', mebel: '🪑', kitob: '📚', kiyim: '👕', boshqa: '📦' };

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(({ data }) => {
        if (data && typeof data === 'object' && data.id) setItem(data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-5xl">🫙</p>
        <h1 className="mt-4 text-xl font-bold">Buyum topilmadi</h1>
        <Link to="/items" className="mt-4 inline-block rounded-xl bg-eco-600 px-5 py-2.5 font-semibold text-white">E'lonlarga qaytish</Link>
      </div>
    );
  }

  if (!item) return <div className="py-20 text-center text-gray-500">Yuklanmoqda...</div>;

  const isOwner = user?.id === item.owner?.id;
  const unavailable = item.status !== 'active';

  const sendRequest = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/requests', { itemId: item.id, message });
      setSuccess('So\'rovingiz yuborildi! Ega javobini "Profil → So\'rovlar" bo\'limidan kuzating.');
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/items" className="text-sm text-eco-600 hover:underline">← E'lonlarga qaytish</Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-eco-50 text-8xl">
          {item.imageUrl ? (
            <img src={imageUrl(item.imageUrl)} alt={item.title} className="h-full w-full rounded-2xl object-cover" />
          ) : (
            <span className="opacity-80">{fallback[item.category] || '📦'}</span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[item.type]}`}>{typeLabel(item.type)}</span>
            {item.type === 'charity' && <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">💛 Xayriya uchun</span>}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{STATUS_LABELS[item.status] || item.status}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{item.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {categoryLabel(item.category)} · {conditionLabel(item.condition)} · 📍 {item.district}
            {item.address ? `, ${item.address}` : ''}
          </p>
          <p className="mt-4 whitespace-pre-line text-gray-700">{item.description || 'Tavsif berilmagan.'}</p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-800">👤 Ega: {item.owner?.name}</p>
            <p className="text-sm text-gray-500">📞 {item.owner?.phone}</p>
            <p className="mt-1 text-sm text-gray-500">🏆 {item.owner?.ecoPoints} eko-ball</p>
          </div>

          {success && <p className="mt-4 rounded-xl bg-eco-50 p-3 text-sm text-eco-800">{success}</p>}
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          {isOwner ? (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 rounded-xl bg-eco-600 px-5 py-3 font-semibold text-white hover:bg-eco-700"
              >
                Profilimga o'tish
              </button>
              {item.status === 'active' && (
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/items/${item.id}`, { status: 'done' });
                      setItem({ ...item, status: 'done' });
                      setSuccess('Buyum topshirilgan deb belgilandi. +20 eko-ball va saqlangan chiqindi statistikasi qo\'shildi!');
                    } catch (err) {
                      setError(err.response?.data?.message || 'Xatolik');
                    }
                  }}
                  className="rounded-xl border border-eco-600 px-5 py-3 font-semibold text-eco-700 hover:bg-eco-50"
                >
                  ✅ Topshirildi
                </button>
              )}
            </div>
          ) : unavailable ? (
            <button disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-500">
              Bu buyum band qilingan
            </button>
          ) : (
            <button
              onClick={() => (user ? setShowModal(true) : navigate('/login'))}
              className="mt-6 w-full rounded-xl bg-eco-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-eco-700"
            >
              💬 Qiziqaman
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <form onSubmit={sendRequest} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">So'rov yuborish</h2>
            <p className="mt-1 text-sm text-gray-500">«{item.title}» — egasiga so'rovingiz yuboriladi va ega siz bilan bog'lanadi.</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Qisqacha xabar yozing (ixtiyoriy)"
              className="mt-4 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-eco-500 focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Bekor qilish
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-eco-600 py-2.5 text-sm font-semibold text-white hover:bg-eco-700">
                Yuborish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
