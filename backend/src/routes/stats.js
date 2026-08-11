import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [itemsSaved, activeUsers, ecoTotal] = await Promise.all([
      prisma.item.count({ where: { status: 'done' } }),
      prisma.user.count(),
      prisma.ecoPoint.aggregate({ _sum: { amount: true } }),
    ]);
    res.json({
      itemsSaved,
      activeUsers,
      totalEcoPoints: ecoTotal._sum.amount || 0,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

router.get('/leaderboard', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ ecoPoints: 'desc' }, { savedKg: 'desc' }],
      take: 10,
      select: { id: true, name: true, phone: true, ecoPoints: true, savedKg: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
