import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-eco-500 text-white">🌿</span>
            <span className="font-bold text-eco-700">Eco Tashkent</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Toshkentda buyumlar almashinuvi, xayriya va qayta ishlash madaniyatini rivojlantiramiz.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-gray-800">Bo'limlar</p>
          <ul className="space-y-2 text-gray-500">
            <li><Link className="hover:text-eco-600" to="/items">E'lonlar</Link></li>
            <li><Link className="hover:text-eco-600" to="/charity">Xayriya</Link></li>
            <li><Link className="hover:text-eco-600" to="/map">Qayta ishlash xaritasi</Link></li>
            <li><Link className="hover:text-eco-600" to="/leaderboard">Top-donorlar</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-gray-800">Aloqa</p>
          <p className="text-gray-500">Telegram bot orqali bildirishnomalar oling</p>
          <p className="mt-2 text-gray-500">Hackathon loyihasi — 2026</p>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Eco Tashkent. Tabiatga g'amxo'rlik qiling ♻️
      </div>
    </footer>
  );
}
