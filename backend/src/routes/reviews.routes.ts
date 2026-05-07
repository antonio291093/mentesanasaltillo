import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { create, update, updateStatus } from '../controllers/reviews.controller';

const router = Router();

router.post(
  '/',
  authenticate,
  requireRole('usuario'),
  create,
);

router.put(
  '/:id',
  authenticate,
  requireRole('usuario'),
  update,
);

router.put(
  '/:id/status',
  authenticate,
  requireRole('psicologo'),
  updateStatus,
);

export default router;
