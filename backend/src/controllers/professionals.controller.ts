import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as profService from '../services/professionals.service';
import { CreateProfessionalDto, UpdateProfessionalDto, SetSchedulesDto, ProfessionalsFilter } from '../types';
import { AppError } from '../middlewares/error.middleware';

export async function listProfessionals(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: ProfessionalsFilter = {
      especialidad: req.query.especialidad ? Number(req.query.especialidad) : undefined,
      modalidad:    req.query.modalidad as ProfessionalsFilter['modalidad'],
      precio_max:   req.query.precio_max ? Number(req.query.precio_max) : undefined,
      ciudad:       req.query.ciudad as string | undefined,
      page:         req.query.page ? Number(req.query.page) : 1,
      limit:        req.query.limit ? Number(req.query.limit) : 12,
    };
    const result = await profService.getProfessionals(filter);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getProfessional(req: Request, res: Response, next: NextFunction) {
  try {
    const professional = await profService.getProfessionalById(Number(req.params.id));
    res.json({ success: true, data: professional });
  } catch (err) {
    next(err);
  }
}

export async function createProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const dto: CreateProfessionalDto = req.body;
    const profile = await profService.createProfessionalProfile(req.user!.id, dto);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const dto: UpdateProfessionalDto = req.body;
    const profile = await profService.updateProfessionalProfile(req.user!.id, dto);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await profService.getMyProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

export async function addSpecialty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await profService.getMyProfile(req.user!.id);
    await profService.addSpecialty(profile.id, Number(req.params.specialtyId));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// Asigna múltiples especialidades en una sola llamada: body { specialtyIds: number[] }
export async function addSpecialtiesBatch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { specialtyIds } = req.body as { specialtyIds: unknown };
    if (!Array.isArray(specialtyIds) || specialtyIds.length === 0) {
      throw new AppError('Se requiere un arreglo de IDs de especialidades', 400);
    }
    const profile = await profService.getMyProfile(req.user!.id);
    await profService.addSpecialties(profile.id, (specialtyIds as number[]));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeSpecialty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await profService.getMyProfile(req.user!.id);
    await profService.removeSpecialty(profile.id, Number(req.params.specialtyId));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function setSchedules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const dto: SetSchedulesDto = req.body;
    const profile = await profService.getMyProfile(req.user!.id);
    await profService.setSchedules(profile.id, dto);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
