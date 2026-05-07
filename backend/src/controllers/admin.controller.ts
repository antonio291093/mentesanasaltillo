import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as adminService from '../services/admin.service';
import { VerificationStatus, ReviewStatus } from '../types';

export async function listProfessionals(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.estado as import('../types').VerificationStatus | undefined;
    const data = await adminService.getProfessionalsByStatus(status);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getPendingProfessionals(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPendingProfessionals();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function verifyProfessional(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, motivo } = req.body as { status: VerificationStatus; motivo?: string };
    const profile = await adminService.verifyProfessional(
      Number(req.params.id),
      status,
      req.user!.id,
      motivo,
    );
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getAllReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const estado = req.query.estado as ReviewStatus | undefined;
    const data = await adminService.getAllReviews(estado);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Gestión de usuarios (no forma parte del spec de admin pero se mantiene) ────

import pool from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.is_active, u.created_at,
              up.nombre, up.apellido
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       ORDER BY u.created_at DESC`,
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserActive(req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, email, is_active',
      [req.params.id],
    );
    if (!rows[0]) throw new AppError('Usuario no encontrado', 404);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}
