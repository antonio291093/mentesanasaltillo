import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { env } from '../config/env';
import { LoginDto, RegisterDto, AuthTokens, AuthResponse, JwtPayload } from '../types';
import { AppError } from '../middlewares/error.middleware';
import { sendWelcomeUser, sendWelcomeProfessional } from './email.service';

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const { email, password, nombre, apellido, role = 'usuario' } = dto;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if ((existing.rowCount ?? 0) > 0) {
    throw new AppError('El correo electrónico ya está registrado', 409);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, password_hash, role],
    );
    const user = rows[0];

    await client.query(
      'INSERT INTO user_profiles (user_id, nombre, apellido) VALUES ($1, $2, $3)',
      [user.id, nombre, apellido],
    );

    await client.query('COMMIT');

    const response: AuthResponse = {
      tokens: buildTokens({ id: user.id, email: user.email, role: user.role }),
      user:   { id: user.id, email: user.email, role: user.role, nombre, apellido },
    };

    if (role === 'usuario') {
      sendWelcomeUser(email, nombre).catch(
        (err) => console.error('[Email] sendWelcomeUser error:', err),
      );
    } else if (role === 'psicologo') {
      sendWelcomeProfessional(email, nombre).catch(
        (err) => console.error('[Email] sendWelcomeProfessional error:', err),
      );
    }

    return response;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { email, password } = dto;

  // Unimos con user_profiles para devolver nombre/apellido en la respuesta
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.role, u.is_active,
            up.nombre, up.apellido
     FROM users u
     JOIN user_profiles up ON up.user_id = u.id
     WHERE u.email = $1`,
    [email],
  );
  const user = rows[0];

  // Mismo mensaje tanto si el email no existe como si la contraseña es incorrecta,
  // para no revelar qué dato falló (enumeración de usuarios).
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  if (!user.is_active) {
    throw new AppError('Cuenta suspendida. Contacta al administrador.', 403);
  }

  return {
    tokens: buildTokens({ id: user.id, email: user.email, role: user.role }),
    user:   { id: user.id, email: user.email, role: user.role, nombre: user.nombre, apellido: user.apellido },
  };
}

export function refreshAccessToken(refreshToken: string): { accessToken: string } {
  const payload = verifyToken(refreshToken);
  const accessToken = jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
  return { accessToken };
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Token inválido o expirado', 401);
  }
}

function buildTokens(payload: JwtPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
}
