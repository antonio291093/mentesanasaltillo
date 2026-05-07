import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import {
  listProfessionals,
  getProfessional,
  createProfile,
  updateProfile,
  getMyProfile,
  addSpecialty,
  addSpecialtiesBatch,
  removeSpecialty,
  setSchedules,
} from '../controllers/professionals.controller';

const router = Router();

// ── Públicas (sin autenticación) ───────────────────────────────────────────────
router.get('/',    listProfessionals);
router.get('/:id', getProfessional);

// ── Privadas (requieren sesión de psicólogo) ───────────────────────────────────
router.use(authenticate);
router.use(requireRole('psicologo'));

router.get('/me/profile',    getMyProfile);
router.post('/me/profile',   createProfile);
router.put('/me/profile',    updateProfile);
router.put('/me/schedules',  setSchedules);

router.put('/me/specialties',                    addSpecialtiesBatch);
router.post('/me/specialties/:specialtyId',      addSpecialty);
router.delete('/me/specialties/:specialtyId',    removeSpecialty);

export default router;
