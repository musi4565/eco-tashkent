import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { REQUEST_STATUS_LABELS, STATUS_LABELS, categoryLabel } from '../constants.js';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [activeTab, setActiveTab] = useState('items');
  const [chatRequest, setChatRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  useEffect(() => {
    if (!user) return;
    api.get('/items/mine').then(({ data }) => setMyItems(Array.isArray(data) ? data : [])).catch(() => setMyItems([]));
    api.get('/requests')
      .then(({ data }) => setRequests({ sent: Array.isArray(data?.sent) ? data.sent : [], received: Array.isArray(data?.received) ? data.received : [] }))
      .catch(() => setRequests({ sent: [], received: [] }));
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const openChat = async (r) => {
    setChatRequest(r);
    const { data } = await api.get(`/requests/${r.id}/messages`);
    setMessages(data);
    setTimeout(() => chatEndRef.current?.scrollIntoView(), 50);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    const { data } = await api.post(`/requests/${chatRequest.id}/messages`, { text: chatText });
    setMessages((m) => [...m, data]);
    setChatText('');
  };

  const respond = async (r, status) => {
    const { data } = await api.patch(`/requests/${r.id}`, { status });
    setRequests((prev) => ({
      ...prev,
      received: prev.received.map((x) => (x.id === data.id ? data : x)),
    }));
    if (status === 'accepted') setActiveTab('items');
  };

  const markDone = async (item) => {
    await api.patch(`/items/${item.id}`, { status: 'done' });
    refreshUser();
    const { data } = await api.get('/items/mine');
    setMyItems(data);
  };

  const requestCard = (r, type) => (
    <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {r.item?.imageUrl ? (
          <img src={r.item.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-eco-50 text-2xl">📦</div>
        )}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{r.item?.title}</p>
          <p className="text-xs text-gray-500">
            {type === 'received' ? 'So\'rov yuborgan: ' : 'Ega: '}
            {type === 'received' ? r.requester?.name : r.item?.owner?.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{r.message || 'Xabar yo\'q'}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === 'pending' ? 'bg-amber-100 text-amber-800' : r.status === 'accepted' ? 'bg-eco-100 text-eco-800' : 'bg-red-100 text-red-700'}`}>
          {REQUEST_STATUS_LABELS[r.status] || r.status}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => openChat(r)} className="flex-1 rounded-xl border border-eco-600 py-2 text-sm font-semibold text-eco-700 hover:bg-eco-50">
          💬 Chat
        </button>
        {type === 'received' && r.status === 'pending' && (
          <>
            <button onClick={() => respond(r, 'accepted')} className="flex-1 rounded-xl bg-eco-600 py-2 text-sm font-semibold text-white hover:bg-eco-700">
              Qabul qilish
            </button>
            <button onClick={() => respond(r, 'rejected')} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Rad etish
            </button>
          </>
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: 'items', label: `Mening e'lonlarim (${myItems.length})` },
    { key: 'received', label: `Kelayotgan so'rovlar (${requests.received.length})` },
    { key: 'sent', label: `Yuborgan so'rovlarim (${requests.sent.length})` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-r from-eco-600 to-eco-800 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">👤 {user.name}</h1>
            <p className="text-sm text-eco-100">📞 {user.phone}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="rounded-xl bg-white/10 px-4 py-2">
              <p className="text-2xl font-bold">{user.ecoPoints}</p>
              <p className="text-xs text-eco-100">Eko-ball</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2">
              <p className="text-2xl font-bold">{user.savedKg || 0} kg</p>
              <p className="text-xs text-eco-100">Saqlangan chiqindi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === t.key ? 'bg-eco-600 text-white' : 'border border-gray-300 bg-white text-gray-600'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'items' && (
          <div className="space-y-3">
            {myItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                Hali e'lon qilmagansiz.
              </div>
            ) : (
              myItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-eco-50 text-3xl">📦</div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {categoryLabel(item.category)} · {item.district} ·{' '}
                      <span className={`font-semibold ${item.status === 'done' ? 'text-eco-600' : item.status === 'reserved' ? 'text-amber-600' : 'text-gray-600'}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </p>
                  </div>
                  {item.status === 'active' && (
                    <button onClick={() => markDone(item)} className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700">
                      ✅ Topshirildi
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'received' && (
          <div className="space-y-3">
            {requests.received.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                Hali so'rovlar yo'q.
              </div>
            ) : (
              requests.received.map((r) => requestCard(r, 'received'))
            )}
          </div>
        )}
        {activeTab === 'sent' && (
          <div className="space-y-3">
            {requests.sent.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                Hali so'rov yubormagansiz.
              </div>
            ) : (
              requests.sent.map((r) => requestCard(r, 'sent'))
            )}
          </div>
        )}
      </div>

      {chatRequest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={() => setChatRequest(null)}>
          <div onClick={(e) => e.stopPropagation()} className="flex h-[80vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:h-[70vh] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <p className="font-bold text-gray-900">💬 {chatRequest.item?.title}</p>
                <p className="text-xs text-gray-500">
                  {chatRequest.requester?.id === user.id
                    ? `Ega: ${chatRequest.item?.owner?.name}`
                    : `So'rovchi: ${chatRequest.requester?.name}`}
                </p>
              </div>
              <button onClick={() => setChatRequest(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">✕</button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">Xabarlar yo'q — salomlashib ko'ring!</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender.id === user.id ? 'ml-auto bg-eco-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p>{m.text}</p>
                  <p className={`mt-0.5 text-[10px] ${m.sender.id === user.id ? 'text-eco-100' : 'text-gray-400'}`}>
                    {m.sender.name} · {new Date(m.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 p-3">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Xabar yozing..."
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-eco-500 focus:outline-none"
              />
              <button type="submit" className="rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white hover:bg-eco-700">
                Yuborish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
