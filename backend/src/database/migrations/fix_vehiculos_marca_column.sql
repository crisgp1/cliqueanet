-- Primero eliminamos la vista
DROP VIEW IF EXISTS vw_documentos_vehiculos;

-- Luego realizamos las modificaciones en la tabla vehiculos
ALTER TABLE "vehiculos" ALTER COLUMN "marca" TYPE VARCHAR(50);
ALTER TABLE "vehiculos" ALTER COLUMN "marca" SET NOT NULL;

-- Recreamos la vista con la misma estructura pero adaptada a los cambios
CREATE VIEW vw_documentos_vehiculos AS
SELECT 
    d.*,
    v.marca,
    v.modelo,
    v.anio,
    v.num_serie
FROM documentos d
JOIN vehiculos v ON d.id_vehiculo = v.id_vehiculo;

-- Añadimos un comentario para documentar el cambio
COMMENT ON VIEW vw_documentos_vehiculos IS 'Vista que muestra los documentos junto con la información básica del vehículo asociado';