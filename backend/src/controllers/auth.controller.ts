import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as authService from '../services/auth.service';
import { RegisterDto, LoginDto } from '../types';

// Extrae errores de express-validator y responde 422 si los hay
function checkValidation(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as { path: string }).path : 'general', mensaje: e.msg })),
    });
    return false;
  }
  return true;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  if (!checkValidation(req, res)) return;

  try {
    const dto: RegisterDto = req.body;
    const result = await authService.register(dto);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  if (!checkValidation(req, res)) return;

  try {
    const dto: LoginDto = req.body;
    const result = await authService.login(dto);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'El refreshToken es requerido' });
      return;
    }
    const result = authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
