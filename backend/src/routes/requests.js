import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

const requestPublic = (r) => ({
  id: r.id,
  status: r.status,
  message: r.message,
  createdAt: r.createdAt,
  item: r.item
    ? {
        id: r.item.id,
        title: r.item.title,
        imageUrl: r.item.imageUrl,
        category: r.item.category,
        district: r.item.district,
        type: r.item.type,
        owner: r.item.owner
          ? { id: r.item.owner.id, name: r.item.owner.name, phone: r.item.owner.phone }
          : null,
      }
    : null,
  requester: r.requester
    ? { id: r.requester.id, name: r.requester.name, phone: r.requester.phone }
    : null,
});

router.post('/', authRequired, async (req, res) => {
  try {
    const { itemId, message } = req.body;
    if (!itemId) return res.status(400).json({ message: 'Buyum id si majburiy' });

    const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });
    if (!item) return res.status(404).json({ message: 'Buyum topilmadi' });
    if (item.ownerId === req.userId) {
      return res.status(400).json({ message: 'O\'z buyumingizga so\'rov yubora olmaysiz' });
    }
    if (item.status !== 'active') {
      return res.status(400).json({ message: 'Bu buyum allaqachon band qilingan' });
    }

    const request = await prisma.request.create({
      data: {
        itemId: item.id,
        requesterId: req.userId,
        message: message || '',
      },
      include: {
        item: { include: { owner: { select: { id: true, name: true, phone: true } } } },
        requester: { select: { id: true, name: true, phone: true } },
      },
    });

    await prisma.item.update({ where: { id: item.id }, data: { status: 'reserved' } });
    res.status(201).json(requestPublic(request));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/', authRequired, async (req, res) => {
  try {
    const [sent, received] = await Promise.all([
      prisma.request.findMany({
        where: { requesterId: req.userId },
        include: {
          item: { include: { owner: { select: { id: true, name: true, phone: true } } } },
          requester: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.request.findMany({
        where: { item: { ownerId: req.userId } },
        include: {
          item: { include: { owner: { select: { id: true, name: true, phone: true } } } },
          requester: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    res.json({ sent: sent.map(requestPublic), received: received.map(requestPublic) });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.patch('/:id', authRequired, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await prisma.request.findUnique({
      where: { id: Number(req.params.id) },
      include: { item: true },
    });
    if (!request) return res.status(404).json({ message: 'So\'rov topilmadi' });
    if (request.item.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Ruxsat yo\'q — faqat buyum egasi javob bera oladi' });
    }

    const updated = await prisma.request.update({
      where: { id: request.id },
      data: { status },
      include: {
        item: { include: { owner: { select: { id: true, name: true, phone: true } } } },
        requester: { select: { id: true, name: true, phone: true } },
      },
    });

    if (status === 'accepted') {
      await prisma.item.update({ where: { id: request.itemId }, data: { status: 'done' } });
    } else if (status === 'rejected') {
      await prisma.item.update({ where: { id: request.itemId }, data: { status: 'active' } });
    }

    res.json(requestPublic(updated));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/:id/messages', authRequired, async (req, res) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: Number(req.params.id) },
      include: { item: true },
    });
    if (!request) return res.status(404).json({ message: 'So\'rov topilmadi' });
    if (request.requesterId !== req.userId && request.item.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    const messages = await prisma.chatMessage.findMany({
      where: { requestId: request.id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } },
    });
    res.json(messages.map((m) => ({ id: m.id, text: m.text, createdAt: m.createdAt, sender: m.sender })));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.post('/:id/messages', authRequired, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Xabar matni bo\'sh' });

    const request = await prisma.request.findUnique({
      where: { id: Number(req.params.id) },
      include: { item: true },
    });
    if (!request) return res.status(404).json({ message: 'So\'rov topilmadi' });
    if (request.requesterId !== req.userId && request.item.ownerId !== req.userId) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }

    const message = await prisma.chatMessage.create({
      data: { text, requestId: request.id, senderId: req.userId },
      include: { sender: { select: { id: true, name: true } } },
    });
    res.status(201).json({ id: message.id, text: message.text, createdAt: message.createdAt, sender: message.sender });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
