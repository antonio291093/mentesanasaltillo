import { Request, Response, NextFunction } from 'express';
import * as specialtiesService from '../services/specialties.service';

export async function listSpecialties(req: Request, res: Response, next: NextFunction) {
  try {
    const specialties = await specialtiesService.getAll();
    res.json({ success: true, data: specialties });
  } catch (err) {
    next(err);
  }
}

export async function createSpecialty(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre } = req.body as { nombre: string };
    const specialty = await specialtiesService.create(nombre);
    res.status(201).json({ success: true, data: specialty });
  } catch (err) {
    next(err);
  }
}

export async function deleteSpecialty(req: Request, res: Response, next: NextFunction) {
  try {
    await specialtiesService.remove(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
