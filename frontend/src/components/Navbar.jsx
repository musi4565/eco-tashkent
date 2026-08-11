import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-eco-100 text-eco-800' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-eco-500 text-lg text-white">🌿</span>
          <span className="text-lg font-bold text-eco-700">Eco Tashkent</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/items" className={linkClass}>E'lonlar</NavLink>
          <NavLink to="/charity" className={linkClass}>Xayriya</NavLink>
          <NavLink to="/map" className={linkClass}>Xarita</NavLink>
          <NavLink to="/leaderboard" className={linkClass}>Reyting</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/add"
            className="hidden rounded-xl bg-eco-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-eco-700 sm:block"
          >
            + E'lon berish
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-eco-100 px-3 py-1 text-xs font-bold text-eco-800 sm:block">
                🏆 {user.ecoPoints} ball
              </span>
              <Link to="/profile" className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Chiqish
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl border border-eco-600 px-4 py-2 text-sm font-semibold text-eco-700 transition hover:bg-eco-50"
            >
              Kirish
            </Link>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
        <NavLink to="/items" className={linkClass}>E'lonlar</NavLink>
        <NavLink to="/charity" className={linkClass}>Xayriya</NavLink>
        <NavLink to="/map" className={linkClass}>Xarita</NavLink>
        <NavLink to="/leaderboard" className={linkClass}>Reyting</NavLink>
        <NavLink to="/add" className={linkClass}>+ E'lon berish</NavLink>
      </nav>
    </header>
  );
}
