-- Primero eliminamos las restricciones existentes
ALTER TABLE IF EXISTS documentos
    DROP CONSTRAINT IF EXISTS documentos_id_transaccion_fkey;

ALTER TABLE IF EXISTS documentos
    DROP CONSTRAINT IF EXISTS documentos_transaccion_fkey;

-- Eliminamos el índice único existente si existe
ALTER TABLE IF EXISTS transacciones
    DROP CONSTRAINT IF EXISTS transacciones_id_fecha_unique;

-- Agregamos la columna fecha_transaccion si no existe
ALTER TABLE documentos
    ADD COLUMN IF NOT EXISTS fecha_transaccion TIMESTAMP WITH TIME ZONE;

-- Creamos un índice único en la tabla transacciones para la clave compuesta
ALTER TABLE transacciones
    ADD CONSTRAINT transacciones_id_fecha_unique 
    UNIQUE (id_transaccion, fecha);

-- Creamos la nueva restricción de clave foránea compuesta
ALTER TABLE documentos
    ADD CONSTRAINT documentos_transaccion_fkey 
    FOREIGN KEY (id_transaccion, fecha_transaccion) 
    REFERENCES transacciones(id_transaccion, fecha) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;