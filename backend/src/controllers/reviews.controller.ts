import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as reviewsService from '../services/reviews.service';
import * as profService from '../services/professionals.service';
import { ReviewStatus } from '../types';

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { professional_id, calificacion, comentario } = req.body as {
      professional_id: number;
      calificacion:    number;
      comentario?:     string;
    };
    const review = await reviewsService.create(req.user!.id, Number(professional_id), { calificacion, comentario });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { calificacion, comentario } = req.body as { calificacion?: number; comentario?: string };
    const review = await reviewsService.update(req.user!.id, Number(req.params.id), { calificacion, comentario });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body as { status: ReviewStatus };
    // Obtener el ID del perfil profesional del psicólogo autenticado
    const profile = await profService.getMyProfile(req.user!.id);
    const review = await reviewsService.updateStatus(Number(req.params.id), status, profile.id);
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}
