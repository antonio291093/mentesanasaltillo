function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variable de entorno requerida no definida: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT:          parseInt(optional('PORT', '4000'), 10),
  NODE_ENV:      optional('NODE_ENV', 'development'),
  DB_HOST:       optional('DB_HOST', 'localhost'),
  DB_PORT:       parseInt(optional('DB_PORT', '5432'), 10),
  DB_NAME:       required('DB_NAME'),
  DB_USER:       required('DB_USER'),
  DB_PASSWORD:   required('DB_PASSWORD'),
  JWT_SECRET:    required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  FRONTEND_URL:  optional('FRONTEND_URL', 'http://localhost:3000'),
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),
  EMAIL_FROM:    optional('EMAIL_FROM', 'onboarding@resend.dev'),
} as const;
