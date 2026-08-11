import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  ecoPoints: u.ecoPoints,
  savedKg: u.savedKg,
  createdAt: u.createdAt,
});

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Ism, telefon va parol majburiy' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Parol kamida 6 belgidan iborat bo\'lishi kerak' });
    }
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return res.status(409).json({ message: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, phone, password: hash } });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Telefon va parol majburiy' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ message: 'Telefon yoki parol noto\'g\'ri' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Telefon yoki parol noto\'g\'ri' });

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        _count: { select: { items: true } },
      },
    });
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json({ user: { ...publicUser(user), itemCount: user._count.items } });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
