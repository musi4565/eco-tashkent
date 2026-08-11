import { Link } from 'react-router-dom';
import { imageUrl } from '../api.js';
import { categoryLabel, typeLabel, TYPE_COLORS } from '../constants.js';

export default function ItemCard({ item }) {
  const fallback = {
    texnika: '💻',
    mebel: '🪑',
    kitob: '📚',
    kiyim: '👕',
    boshqa: '📦',
  }[item.category] || '📦';

  return (
    <Link
      to={`/items/${item.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-eco-50 text-6xl">
        {item.imageUrl ? (
          <img src={imageUrl(item.imageUrl)} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <span className="opacity-80">{fallback}</span>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>
          {typeLabel(item.type)}
        </span>
        {item.type === 'charity' && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
            💛 Xayriya
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-eco-700">{item.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{categoryLabel(item.category)} · {item.district}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>👤 {item.owner?.name || 'Anonim'}</span>
          <span>🏆 {item.owner?.ecoPoints || 0} ball</span>
        </div>
      </div>
    </Link>
  );
}
