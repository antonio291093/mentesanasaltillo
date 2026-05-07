-- Dar permisos completos a sms_user sobre todo en el schema public
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sms_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sms_user;

-- Para tablas y secuencias que se creen en el futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO sms_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO sms_user;
