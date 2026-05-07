import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as usersService from '../services/users.service';
import { UpdateUserProfileDto } from '../types';

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserWithProfile(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const dto: UpdateUserProfileDto = req.body;
    const profile = await usersService.updateUserProfile(req.user!.id, dto);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
