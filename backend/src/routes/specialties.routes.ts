import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { listSpecialties, createSpecialty, deleteSpecialty } from '../controllers/specialties.controller';

const router = Router();

router.get('/', listSpecialties);

router.use(authenticate);
router.use(requireRole('admin'));

router.post('/',       createSpecialty);
router.delete('/:id',  deleteSpecialty);

export default router;
