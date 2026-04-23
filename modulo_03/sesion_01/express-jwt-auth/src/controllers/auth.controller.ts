import { Request, Response } from 'express';
import {
  login,
  refreshToken,
  validateUser,
} from '../services/auth.service';

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await validateUser(email, password);
    const value = await login(user);

    return res.json(value);
  } catch {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
}

export async function loginSecureHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await validateUser(email, password);
    const value = await login(user);

    res.cookie('refresh_token', value.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      access_token: value.access_token,
      user: value.user,
    });
  } catch {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
}

export async function refreshTokenHandler(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;
    const value = await refreshToken(refresh_token);

    return res.json(value);
  } catch {
    return res.status(401).json({
      message: 'Refresh token inválido o expirado',
    });
  }
}

export async function refreshTokenSecureHandler(req: Request, res: Response) {
  try {
    const token = (req as any).cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({ message: 'Refresh token no enviado' });
    }

    const value = await refreshToken(token);

    res.cookie('refresh_token', value.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      access_token: value.access_token,
    });
  } catch {
    return res.status(401).json({
      message: 'Refresh token inválido o expirado',
    });
  }
}

export async function logoutHandler(_req: Request, res: Response) {
  res.clearCookie('refresh_token');

  return res.json({
    message: 'Sesión cerrada',
  });
}