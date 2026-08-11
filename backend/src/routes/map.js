import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/points', async (_req, res) => {
  try {
    const points = await prisma.recyclePoint.findMany({ orderBy: { id: 'asc' } });
    res.json(points);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi: ' + err.message });
  }
});

export default router;
