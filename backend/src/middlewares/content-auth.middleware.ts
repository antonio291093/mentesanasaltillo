import { Response, NextFunction } from 'express';
import { createHash, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { AuthenticatedRequest } from './auth.middleware';

// Compara en tiempo constante (hasheando primero para igualar longitudes)
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Autoriza la gestión de contenido (blog) a:
 *  - clientes de servicio con header `x-api-key: <CONTENT_API_KEY>` (el MCP server)
 *  - administradores con JWT (`Authorization: Bearer ...`)
 */
export function authenticateContentClient(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const apiKey = req.header('x-api-key');

  if (apiKey) {
    if (env.CONTENT_API_KEY && safeEqual(apiKey, env.CONTENT_API_KEY)) {
      next();
      return;
    }
    res.status(401).json({ success: false, error: 'API key inválida' });
    return;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const user = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET) as JwtPayload;
      if (user.role === 'admin') {
        req.user = user;
        next();
        return;
      }
      res.status(403).json({ success: false, error: 'Acceso denegado. Se requiere rol: admin' });
      return;
    } catch {
      res.status(401).json({ success: false, error: 'Token inválido o expirado' });
      return;
    }
  }

  res.status(401).json({ success: false, error: 'Se requiere API key o token de administrador' });
}
