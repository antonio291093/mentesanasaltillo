import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
}

// Para rutas donde la autenticación es opcional (ej. ver perfil público)
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      // Token inválido ignorado en rutas con auth opcional
    }
  }

  next();
}
