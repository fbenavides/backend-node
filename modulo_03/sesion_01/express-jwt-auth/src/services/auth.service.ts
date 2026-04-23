import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserByEmail } from './users.service';

export async function validateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new Error('Credenciales inválidas');
  }

  return user;
}

export async function login(user: any) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const access_token = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const refresh_token = jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    access_token,
    refresh_token,
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
    },
  };
}

export async function refreshToken(token: string) {
  const payload = jwt.verify(token, env.jwtRefreshSecret) as {
    sub: number;
    email: string;
    role: string;
  };

  const newPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  const access_token = jwt.sign(newPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const refresh_token = jwt.sign(newPayload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return {
    access_token,
    refresh_token,
  };
}