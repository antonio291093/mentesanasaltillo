import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import professionalsRoutes from './routes/professionals.routes';
import specialtiesRoutes from './routes/specialties.routes';
import reviewsRoutes from './routes/reviews.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ── Seguridad y parsers ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/users`,         usersRoutes);
app.use(`${API}/professionals`, professionalsRoutes);
app.use(`${API}/specialties`,   specialtiesRoutes);
app.use(`${API}/reviews`,       reviewsRoutes);
app.use(`${API}/admin`,         adminRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get(`${API}/health`, (_req, res) => {
  res.json({ success: true, message: 'API funcionando correctamente' });
});

// ── Ruta no encontrada ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ── Manejador global de errores (debe ir al final) ────────────────────────────
app.use(errorHandler);

export default app;
