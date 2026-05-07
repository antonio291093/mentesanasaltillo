import 'dotenv/config';
import app from './src/app';
import { env } from './src/config/env';
import pool from './src/config/database';

async function start(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida');

    app.listen(env.PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`);
      console.log(`📡 API disponible en http://localhost:${env.PORT}/api/v1`);
      console.log(`🌍 Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

start();
