# 🌿 Eco Tashkent — Buyumlar almashinuvi platformasi

**Eco Tashkent** — Toshkent shahri ekologiyasi va buyumlar almashinuvi platformasi (hackathon loyihasi). Keraksiz buyumlarni (texnika, mebel, kitob, kiyim) **bepul berish**, **almashish** yoki **xayriya qilish**, hamda yaqindagi **qayta ishlash / saralash punktlari xaritasini** ko'rish imkonini beradi.

## ✨ Asosiy funksiyalar

| # | Funksiya | Tavsif |
|---|----------|--------|
| 1 | **Buyum e'lon qilish** | Rasm yuklash, kategoriya, holat, tur (bepul/almashuv/xayriya), Toshkent tumani |
| 2 | **E'lonlar lentasi + filtr** | Kategoriya/tuman/tur bo'yicha filtrlash, qidiruv paneli |
| 3 | **Interaktiv xarita** | Leaflet.js + OpenStreetMap — recycling punktlari, qabul qilinadigan materiallar |
| 4 | **Eko-ball tizimi** | Buyum topshirilganda +20 ball, top-donorlar reytingi, saqlangan chiqindi (kg) |
| 5 | **Xayriya bo'limi** | Ehtiyojmandlar uchun alohida lenta, "💛 Xayriya" belgisi |
| 6 | **Bog'lanish / chat** | "Qiziqaman" → so'rov, egasi tasdiqlaydi, ichki chat orqali yozishma |

**Qo'shimcha:** 🤖 Telegram bot — kategoriya bo'yicha obuna, yangi e'lon bildirishnomalari, inline qidiruv va "Qiziqaman" orqali so'rov yuborish.

## 🏗️ Texnologik stack

- **Frontend:** React 18 + Vite + Tailwind CSS + Leaflet.js (OpenStreetMap) — to'liq mobil-responsiv, o'zbek tilida
- **Backend:** Node.js + Express (REST API), JWT autentifikatsiya (bcrypt parol hash)
- **Ma'lumotlar bazasi:** PostgreSQL + Prisma ORM (migratsiya fayllari bilan)
- **Fayl saqlash:** mahalliy `uploads/` papka (multer)
- **Bot:** Node.js + node-telegram-bot-api (long polling)

## 📁 Loyiha strukturasi

```
eco-tashkent/
├── backend/                  # Express REST API (port 5000)
│   ├── prisma/
│   │   ├── schema.prisma     # DB sxemasi
│   │   ├── migrations/       # SQL migratsiya fayllari
│   │   └── seed.js           # Demo ma'lumotlar (recycle punktlar va h.k.)
│   ├── src/
│   │   ├── index.js          # Server
│   │   ├── lib/prisma.js     # Prisma client
│   │   ├── middleware/       # JWT auth + multer upload
│   │   └── routes/           # auth, items, requests, map, stats, bot
│   ├── uploads/              # Yuklangan rasmlar (gitignore qilingan)
│   ├── .env.example
│   └── Dockerfile
├── frontend/                 # React + Vite (port 5173)
│   ├── src/
│   │   ├── components/       # Navbar, Footer, ItemCard, StatsBanner
│   │   ├── pages/            # Home, Catalog, ItemDetail, AddItem, MapPage,
│   │   │                     #   Leaderboard, Charity, Profile, Login, Register
│   │   ├── context/          # AuthContext (JWT)
│   │   └── api.js            # Axios client
│   └── .env.example
├── bot/                      # Telegram bot
│   └── src/index.js
├── render.yaml               # Render deploy blueprint
└── README.md
```

## 🗄️ Ma'lumotlar bazasi sxemasi

| Jadval | Maydonlar |
|--------|-----------|
| `users` | id, name, phone (unique), password, eco_points, saved_kg, created_at |
| `items` | id, title, description, category, condition, type (free/exchange/charity), image_url, district, address, status, owner_id (FK), created_at |
| `recycle_points` | id, name, type (recycling/sorting), lat, lng, address, accepted_materials |
| `requests` | id, item_id (FK), requester_id (FK), status, message, created_at |
| `chat_messages` | id, request_id (FK), sender_id (FK), text, created_at |
| `eco_points` | id, user_id (FK), amount, reason, created_at |
| `telegram_users` | id, chat_id (unique), user_id (FK), username, subscribed_categories |

## 🚀 Lokal ishga tushirish

### Talablar
- Node.js 18+
- PostgreSQL 14+ (lokal yoki bepul bulutli: Neon, Supabase, Railway)

### 1. PostgreSQL sozlash (lokal)
```bash
# PostgreSQL o'rnatilgandan so'ng:
psql -U postgres
CREATE DATABASE eco_tashkent;
\q
```
Yoki bepul bulutli: [Neon](https://neon.tech) / [Supabase](https://supabase.com) — connection string oling.

### 2. Backend sozlash
```bash
cd backend
cp .env.example .env    # DATABASE_URL, JWT_SECRET ni to'ldiring
npm install
npx prisma migrate deploy   # migratsiyalarni qo'llash
npm run seed                # recycle punktlar + demo ma'lumot
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

### 4. Telegram bot (ixtiyoriy)
```bash
# @BotFather da bot yarating va token oling
cd bot
cp .env.example .env        # TELEGRAM_BOT_TOKEN ni yozing
npm install
npm run dev
```

Yoki barchasini birdan (root):
```bash
npm run install:all
npm run dev
```

### Demo hisob
```
Telefon: +998900000001
Parol:   demo123
```

## 📡 API endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish (JWT) |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| GET | `/api/items` | E'lonlar (`category`, `district`, `type`, `search`, `status` parametrlari) |
| GET | `/api/items/mine` | Mening e'lonlarim (auth) |
| POST | `/api/items` | E'lon qo'shish (multipart, auth) |
| PATCH | `/api/items/:id` | Status o'zgartirish (auth, faqat ega) |
| POST | `/api/requests` | "Qiziqaman" so'rovi (auth) |
| GET | `/api/requests` | Yuborgan + qabul qilingan so'rovlar (auth) |
| PATCH | `/api/requests/:id` | So'rovni qabul/rad etish (auth) |
| GET/POST | `/api/requests/:id/messages` | Ichki chat |
| GET | `/api/map/points` | Recycling punktlari |
| GET | `/api/stats` | Statistika banner |
| GET | `/api/stats/leaderboard` | Top-donorlar |
| POST | `/api/bot/link` | Telegram ↔ sayt hisobini bog'lash |

## 🤖 Telegram bot komandalari

| Tugma | Vazifasi |
|-------|----------|
| `/start` | Tanishtiruv va asosiy menyu |
| `🔎 Buyum qidirish` | Kategoriya bo'yicha inline qidiruv |
| `💬 Qiziqaman` | E'lon egasiga so'rov yuborish |
| `🔔 Obuna bo'lish` | Kategoriyalar bo'yicha yangi e'lon bildirishnomalari |
| `🔗 Hisobni bog'lash` | `/link telefon parol` — buyumingizga kelgan so'rovlar botga ham keladi |
| `🌐 Saytga o'tish` | Platforma manzili |

## 🔐 Xavfsizlik

- Barcha secretlar (DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN) **.env** fayllarda — `.env` `.gitignore`ga kiritilgan
- **`.env.example`** fayllari GitHub'ga push qilinadi (bo'sh namunaviy qiymatlar bilan)
- Parollar bcrypt bilan hash qilinadi, API JWT token bilan himoyalanadi

## 🚀 Deploy (bepul hosting)

### Vazifa 1: PostgreSQL + Backend — Railway yoki Render
**Render (blueprint):** `render.yaml` fayli repo ildizida — `eco-tashkent-api` (Docker), `eco-tashkent-web` (static) va bepul `eco-tashkent-db` (PostgreSQL) avtomatik yaratiladi.

**Railway:** `backend/` papkasini yangi loyiha sifatida ulang → Railway DATABASE_URL ni avtomatik sozlaydi. `.env` o'rniga platformaning **Environment Variables** bo'limiga yozing.

### Vazifa 2: Frontend — Vercel yoki Netlify
```bash
# Vercel (frontend/ papkasi)
cd frontend && npx vercel
# Build: npm run build, Output: dist
```
`VITE_API_URL` ni backend URL'iga o'rnating (masalan: `https://eco-tashkent-api.onrender.com`).

> ⚠️ Secret'larni kodga yozmang — har doim hosting platformasining "Environment Variables" bo'limidan foydalaning.

## 📸 Skrinshotlar

*(Sahifalar skrinshotlarini shu yerga qo'shing: bosh sahifa, katalog, xarita, profil)*

## 📄 Litsenziya

Hackathon loyihasi — ochiq foydalanish uchun. 2026
