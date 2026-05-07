import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh } from '../controllers/auth.controller';

const router = Router();

const registerRules = [
  body('email')
    .isEmail().withMessage('El correo electrónico no es válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido')
    .trim().notEmpty().withMessage('El apellido es requerido'),
];

const loginRules = [
  body('email')
    .isEmail().withMessage('El correo electrónico no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.post('/refresh',                refresh);

export default router;
