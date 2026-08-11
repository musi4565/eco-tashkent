import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Avval tizimga kiring' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    return res.status(401).json({ message: 'Token yaroqsiz yoki muddati o\'tgan' });
  }
}
