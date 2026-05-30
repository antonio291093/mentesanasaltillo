-- Migración: soporte de ubicación geográfica en professional_profiles
-- Agrega latitud y longitud (nullable) para fijar el pin del profesional en un mapa.
ALTER TABLE professional_profiles
    ADD COLUMN IF NOT EXISTS latitud  DECIMAL(9,6),
    ADD COLUMN IF NOT EXISTS longitud DECIMAL(9,6);
