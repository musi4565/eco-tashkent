import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const router = Router();

router.post('/link', async (req, res) => {
  try {
    const { phone, password, chatId, username } = req.body;
    if (!phone || !password || !chatId) {
      return res.status(400).json({ message: 'Telefon, parol va chatId majburiy' });
    }
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Parol noto\'g\'ri' });

    const tgUser = await prisma.telegramUser.upsert({
      where: { chatId: BigInt(chatId) },
      update: { userId: user.id, username: username || null },
      create: { chatId: BigInt(chatId), userId: user.id, username: username || null },
    });
    res.json({ ok: true, user: { id: user.id, name: user.name, ecoPoints: user.ecoPoints } });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/new-items', async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const items = await prisma.item.findMany({
      where: { createdAt: { gt: since } },
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(
      items.map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        district: i.district,
        type: i.type,
        ownerId: i.ownerId,
        createdAt: i.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/new-requests', async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const requests = await prisma.request.findMany({
      where: { createdAt: { gt: since } },
      include: {
        item: { select: { id: true, title: true, ownerId: true, category: true, district: true } },
        requester: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json(
      requests.map((r) => ({
        id: r.id,
        itemId: r.item.id,
        title: r.item.title,
        ownerId: r.item.ownerId,
        requesterName: r.requester.name,
        message: r.message,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/subscribers', async (_req, res) => {
  try {
    const users = await prisma.telegramUser.findMany({
      select: { chatId: true, subscribedCategories: true, userId: true },
    });
    res.json(
      users.map((u) => ({
        chatId: u.chatId.toString(),
        subscribedCategories: u.subscribedCategories,
        userId: u.userId,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.patch('/subscribers/:chatId', async (req, res) => {
  try {
    const chatId = BigInt(req.params.chatId);
    const { categories } = req.body;
    const tgUser = await prisma.telegramUser.update({
      where: { chatId },
      data: { subscribedCategories: Array.isArray(categories) ? categories : [] },
    });
    res.json({ ok: true, subscribedCategories: tgUser.subscribedCategories });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
