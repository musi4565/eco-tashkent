import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authRequired } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

const itemPublic = (i) => ({
  id: i.id,
  title: i.title,
  description: i.description,
  category: i.category,
  condition: i.condition,
  type: i.type,
  imageUrl: i.imageUrl,
  district: i.district,
  address: i.address,
  status: i.status,
  createdAt: i.createdAt,
  owner: i.owner
    ? { id: i.owner.id, name: i.owner.name, phone: i.owner.phone, ecoPoints: i.owner.ecoPoints }
    : null,
});

router.get('/', async (req, res) => {
  try {
    const { category, district, type, search, status } = req.query;
    const where = {};

    if (category && category !== 'all') where.category = category;
    if (district && district !== 'all') where.district = district;
    if (type && type !== 'all') where.type = type;
    if (status) where.status = status;
    else where.status = { not: 'deleted' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: { owner: { select: { id: true, name: true, phone: true, ecoPoints: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(itemPublic));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { ownerId: req.userId },
      include: { owner: { select: { id: true, name: true, phone: true, ecoPoints: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(itemPublic));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(req.params.id) },
      include: { owner: { select: { id: true, name: true, phone: true, ecoPoints: true } } },
    });
    if (!item) return res.status(404).json({ message: 'Buyum topilmadi' });
    res.json(itemPublic(item));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.post('/', authRequired, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, condition, type, district, address } = req.body;
    if (!title || !category || !condition || !type || !district) {
      return res.status(400).json({ message: 'Nom, kategoriya, holat, tur va tuman majburiy' });
    }
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const item = await prisma.item.create({
      data: {
        title,
        description: description || '',
        category,
        condition,
        type,
        district,
        address: address || null,
        imageUrl,
        ownerId: req.userId,
      },
      include: { owner: { select: { id: true, name: true, phone: true, ecoPoints: true } } },
    });
    res.status(201).json(itemPublic(item));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.patch('/:id', authRequired, async (req, res) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Buyum topilmadi' });
    if (item.ownerId !== req.userId) return res.status(403).json({ message: 'Ruxsat yo\'q' });

    const { status } = req.body;
    const updated = await prisma.item.update({
      where: { id: item.id },
      data: { status: status || item.status },
      include: { owner: { select: { id: true, name: true, phone: true, ecoPoints: true } } },
    });

    if (status === 'done') {
      const savedKg = Math.round(item.category === 'texnika' ? 15 : item.category === 'mebel' ? 30 : item.category === 'kitob' ? 2 : item.category === 'kiyim' ? 3 : 5);
      const points = 20;
      await prisma.$transaction([
        prisma.ecoPoint.create({
          data: { userId: item.ownerId, amount: points, reason: `Buyum topshirildi: ${item.title}` },
        }),
        prisma.user.update({
          where: { id: item.ownerId },
          data: { ecoPoints: { increment: points }, savedKg: { increment: savedKg } },
        }),
      ]);
    }

    res.json(itemPublic(updated));
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Buyum topilmadi' });
    if (item.ownerId !== req.userId) return res.status(403).json({ message: 'Ruxsat yo\'q' });
    await prisma.item.update({ where: { id: item.id }, data: { status: 'deleted' } });
    res.json({ message: 'Buyum o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
