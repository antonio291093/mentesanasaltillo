import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  listProfessionals,
  getPendingProfessionals,
  verifyProfessional,
  getAllReviews,
  getStats,
  listUsers,
  toggleUserActive,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

// Profesionales
router.get('/professionals',             listProfessionals);
router.get('/professionals/pending',     getPendingProfessionals);
router.put('/professionals/:id/verify',  verifyProfessional);

// Reviews (soporta ?estado=pendiente|aprobado|rechazado)
router.get('/reviews',                   getAllReviews);

// Estadísticas
router.get('/stats',                     getStats);

// Usuarios
router.get('/users',                     listUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);

export default router;
