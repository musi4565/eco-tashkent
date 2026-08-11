import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import AddItem from './pages/AddItem.jsx';
import MapPage from './pages/MapPage.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Charity from './pages/Charity.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/items" element={<Catalog />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/charity" element={<Charity />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
