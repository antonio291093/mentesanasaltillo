import { Router } from 'express';
import { body } from 'express-validator';
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

const coordenadasRules = [
  body('latitud')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número entre -90 y 90'),
  body('longitud')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número entre -180 y 180'),
  body('latitud').custom((value, { req }) => {
    const hasLat = value !== undefined && value !== null;
    const hasLng = req.body.longitud !== undefined && req.body.longitud !== null;
    if (hasLat !== hasLng) {
      throw new Error('La latitud y longitud deben enviarse juntas o ambas omitirse');
    }
    return true;
  }),
];

// ── Públicas (sin autenticación) ───────────────────────────────────────────────
router.get('/',    listProfessionals);
router.get('/:id', getProfessional);

// ── Privadas (requieren sesión de psicólogo) ───────────────────────────────────
router.use(authenticate);
router.use(requireRole('psicologo'));

router.get('/me/profile',    getMyProfile);
router.post('/me/profile',   coordenadasRules, createProfile);
router.put('/me/profile',    coordenadasRules, updateProfile);
router.put('/me/schedules',  setSchedules);

router.put('/me/specialties',                    addSpecialtiesBatch);
router.post('/me/specialties/:specialtyId',      addSpecialty);
router.delete('/me/specialties/:specialtyId',    removeSpecialty);

export default router;
