import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '../types';

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`,
      });
      return;
    }

    next();
  };
}
