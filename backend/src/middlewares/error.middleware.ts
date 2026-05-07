import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // Express requiere 4 parámetros para reconocer el middleware de errores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Error inesperado — no exponer stack en producción
  console.error('Error no controlado:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
}
