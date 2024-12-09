-- Ejemplo 1: Consulta de transacciones con detalles completos
SELECT 
    t.id_transaccion,
    t.fecha,
    c.nombre as cliente,
    c.telefono as tel_cliente,
    v.marca,
    v.modelo,
    v.anio,
    v.precio,
    v.num_serie,
    tt.nombre as tipo_transaccion,
    u.nombre as empleado_responsable
FROM transacciones t
JOIN clientes c ON t.id_cliente = c.id_cliente
JOIN vehiculos v ON t.id_vehiculo = v.id_vehiculo
JOIN tipos_transaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
JOIN usuarios u ON t.id_usuario = u.id_empleado;

-- Ejemplo 2: Ventas con comisiones de empleados
SELECT 
    v.id_venta,
    t.fecha,
    ve.comision,
    ve.porcentaje_comision,
    u.nombre as empleado,
    c.nombre as cliente,
    vh.marca,
    vh.modelo,
    vh.precio
FROM ventas v
JOIN transacciones t ON v.id_transaccion = t.id_transaccion
JOIN venta_empleados ve ON v.id_venta = ve.id_venta
JOIN usuarios u ON ve.id_empleado = u.id_empleado
JOIN clientes c ON t.id_cliente = c.id_cliente
JOIN vehiculos vh ON t.id_vehiculo = vh.id_vehiculo;

-- Ejemplo 3: Citas con detalles completos
SELECT 
    ct.id_cita,
    ct.fecha,
    ct.hora,
    ct.lugar,
    ct.tipo_cita,
    co.nombre as contacto_nombre,
    co.telefono as contacto_telefono,
    u.nombre as empleado_asignado,
    v.marca,
    v.modelo
FROM citas ct
JOIN contactos co ON ct.id_contacto = co.id_contacto
JOIN citas_empleados ce ON ct.id_cita = ce.id_cita
JOIN usuarios u ON ce.id_empleado = u.id_empleado
LEFT JOIN vehiculos v ON ct.id_vehiculo = v.id_vehiculo;

-- Ejemplo 4: Reporte de créditos con detalles de cliente y vehículo
SELECT 
    cr.id_credito,
    cr.cantidad,
    cr.comentarios,
    c.nombre as cliente,
    c.telefono,
    t.fecha as fecha_transaccion,
    v.marca,
    v.modelo,
    v.precio
FROM creditos cr
JOIN clientes c ON cr.id_cliente = c.id_cliente
JOIN transacciones t ON t.id_credito = cr.id_credito
JOIN vehiculos v ON t.id_vehiculo = v.id_vehiculo;

-- Ejemplo 5: Documentos con relaciones completas
SELECT 
    d.id_documento,
    d.tipo_documento,
    d.url,
    d.fecha_subida,
    COALESCE(c.nombre, 'N/A') as cliente,
    COALESCE(u.nombre, 'N/A') as empleado,
    COALESCE(v.marca || ' ' || v.modelo, 'N/A') as vehiculo,
    COALESCE(t.id_transaccion::text, 'N/A') as transaccion
FROM documentos d
LEFT JOIN clientes c ON d.id_cliente = c.id_cliente
LEFT JOIN usuarios u ON d.id_empleado = u.id_empleado
LEFT JOIN vehiculos v ON d.id_vehiculo = v.id_vehiculo
LEFT JOIN transacciones t ON d.id_transaccion = t.id_transaccion;

-- Ejemplo 6: Reporte de nómina con detalles de comisiones
SELECT 
    n.id_nomina,
    n.fecha_pago,
    u.nombre as empleado,
    n.salario_base,
    n.comisiones,
    n.otras_percepciones,
    n.deducciones,
    n.total_pago,
    COUNT(ve.id_venta) as num_ventas_periodo
FROM nomina n
JOIN usuarios u ON n.id_empleado = u.id_empleado
LEFT JOIN venta_empleados ve ON u.id_empleado = ve.id_empleado
GROUP BY n.id_nomina, n.fecha_pago, u.nombre, n.salario_base, 
         n.comisiones, n.otras_percepciones, n.deducciones, n.total_pago;

-- Ejemplo 7: Consignaciones con detalles completos
SELECT 
    cs.id_consignacion,
    cs.nombre_consignatario,
    cs.apellidos_consignatario,
    cs.telefono_consignatario,
    v.marca,
    v.modelo,
    v.anio,
    v.precio,
    v.num_serie,
    COUNT(ct.id_contacto) as num_contactos_relacionados
FROM consignaciones cs
JOIN vehiculos v ON cs.id_vehiculo = v.id_vehiculo
LEFT JOIN contactos ct ON cs.id_consignacion = ct.id_consignacion
GROUP BY cs.id_consignacion, cs.nombre_consignatario, cs.apellidos_consignatario,
         cs.telefono_consignatario, v.marca, v.modelo, v.anio, v.precio, v.num_serie;