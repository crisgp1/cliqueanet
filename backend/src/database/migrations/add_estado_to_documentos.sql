-- Primero creamos el tipo enum si no existe
DO $$ BEGIN
    CREATE TYPE estado_documento AS ENUM ('pendiente', 'aprobado', 'rechazado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregamos la columna estado si no existe
ALTER TABLE documentos
ADD COLUMN IF NOT EXISTS estado estado_documento NOT NULL DEFAULT 'pendiente';

-- Agregamos un índice para mejorar las búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado);