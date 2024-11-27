-- Insertar usuario administrador
INSERT INTO usuarios (
    nombre,
    tipo_identificacion,
    num_identificacion,
    fecha_nacimiento,
    telefono,
    correo,
    domicilio,
    fecha_contratacion,
    rol,
    password
) VALUES (
    'Administrador Sistema',
    'INE',
    'ADMIN001',
    '1990-01-01',
    '5555555555',
    'admin@cliqueanet.com',
    'Dirección Administrativa 123',
    '2024-01-01',
    'Administrador',
    '$2b$10$XkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X'
);

-- Insertar usuario vendedor
INSERT INTO usuarios (
    nombre,
    tipo_identificacion,
    num_identificacion,
    fecha_nacimiento,
    telefono,
    correo,
    domicilio,
    fecha_contratacion,
    rol,
    password
) VALUES (
    'Vendedor Demo',
    'INE',
    'VEND001',
    '1995-01-01',
    '5555555556',
    'vendedor@cliqueanet.com',
    'Dirección Ventas 123',
    '2024-01-01',
    'Ventas',
    '$2b$10$YkHH4mJ4kH3zqX4ZqZhZ8O5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5Y'
);

-- Insertar cliente de prueba
INSERT INTO clientes (
    nombre,
    tipo_identificacion,
    num_identificacion,
    fecha_nacimiento,
    telefono,
    correo,
    domicilio,
    tenencia
) VALUES (
    'Cliente Demo',
    'INE',
    'CLI001',
    '1985-01-01',
    '5555555557',
    'cliente@ejemplo.com',
    'Dirección Cliente 123',
    'Vigente'
);

-- Insertar vehículo de prueba
INSERT INTO vehiculos (
    marca,
    modelo,
    año,
    precio,
    num_serie,
    color,
    num_motor,
    num_factura,
    placas,
    tarjeta_circulacion
) VALUES (
    'Toyota',
    'Corolla',
    2024,
    350000.00,
    'SERIE001',
    'Blanco',
    'MOTOR001',
    'FACT001',
    'ABC123',
    'TARJ001'
);