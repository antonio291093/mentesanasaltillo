-- Migración: la foto del profesional ahora vive en professional_profiles.foto_url
-- Copia las fotos existentes desde user_profiles sin sobrescribir las ya guardadas.
UPDATE professional_profiles pp
SET foto_url = up.foto_url
FROM user_profiles up
WHERE up.user_id = pp.user_id
  AND pp.foto_url IS NULL;
