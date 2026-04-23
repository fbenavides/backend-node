import { Request, Response } from 'express';
import { findUserById } from '../services/users.service';

export async function getProfile(req: Request, res: Response) {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  const user = await findUserById(userId);

  return res.json({
    id: user?.id ?? '',
    role: user?.role ?? '',
    name: user?.name ?? '',
    lastname: user?.lastname ?? '',
    email: user?.email ?? '',
  });
}