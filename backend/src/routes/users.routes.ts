import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getMe, updateMe } from '../controllers/users.controller';

const router = Router();

router.use(authenticate);

router.get('/me',    getMe);
router.patch('/me',  updateMe);

export default router;
