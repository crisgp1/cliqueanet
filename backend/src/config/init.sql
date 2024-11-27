-- Tipo enum para categoría de multimedia
CREATE TYPE categoria_multimedia AS ENUM ('Estado_cuenta', 'Nomina', 'Otro');

-- Tipo enum para tipo de transacción
CREATE TYPE tipo_transaccion AS ENUM ('Venta', 'Apartado', 'Credito', 'Traspaso', 'Cambio');

-- Tipo enum para roles de usuario
CREATE TYPE rol_usuario AS ENUM ('Administrador', 'Ventas', 'RRHH', 'Gerente_general', 'Capturista');

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Tabla usuarios
CREATE TABLE usuarios (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_identificacion VARCHAR(50) NOT NULL,
    num_identificacion VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    domicilio VARCHAR(200) NOT NULL,
    fecha_contratacion DATE NOT NULL,
    rol rol_usuario NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_identificacion VARCHAR(50) NOT NULL,
    num_identificacion VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    domicilio VARCHAR(200) NOT NULL,
    tenencia VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla vehículos
CREATE TABLE vehiculos (
    id_vehiculo SERIAL PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año INTEGER NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    num_serie VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(50) NOT NULL,
    num_motor VARCHAR(50) NOT NULL UNIQUE,
    num_factura VARCHAR(50) UNIQUE,
    placas VARCHAR(20) UNIQUE,
    tarjeta_circulacion VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla créditos
CREATE TABLE creditos (
    id_credito SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla multimedia
CREATE TABLE multimedia (
    id_multimedia SERIAL PRIMARY KEY,
    id_credito INTEGER NOT NULL REFERENCES creditos(id_credito),
    url VARCHAR(200) NOT NULL,
    categoria categoria_multimedia NOT NULL,
    mes INTEGER CHECK (mes >= 1 AND mes <= 12),
    año INTEGER CHECK (año >= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla transacciones
CREATE TABLE transacciones (
    id_transaccion SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_empleado),
    id_cliente INTEGER NOT NULL REFERENCES clientes(id_cliente),
    id_vehiculo INTEGER NOT NULL REFERENCES vehiculos(id_vehiculo),
    id_credito INTEGER REFERENCES creditos(id_credito),
    tipo_transaccion tipo_transaccion NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla nómina
CREATE TABLE nomina (
    id_nomina SERIAL PRIMARY KEY,
    id_empleado INTEGER NOT NULL REFERENCES usuarios(id_empleado),
    fecha_pago DATE NOT NULL,
    salario_base DECIMAL(10,2) NOT NULL,
    comisiones DECIMAL(10,2) DEFAULT 0,
    otras_percepciones DECIMAL(10,2) DEFAULT 0,
    deducciones DECIMAL(10,2) DEFAULT 0,
    total_pago DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla ventas
CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    id_transaccion INTEGER NOT NULL REFERENCES transacciones(id_transaccion),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para ventas y empleados (relación muchos a muchos)
CREATE TABLE venta_empleados (
    id_venta INTEGER NOT NULL REFERENCES ventas(id_venta),
    id_empleado INTEGER NOT NULL REFERENCES usuarios(id_empleado),
    comision DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_venta, id_empleado)
);

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at
    BEFORE UPDATE ON vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creditos_updated_at
    BEFORE UPDATE ON creditos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_multimedia_updated_at
    BEFORE UPDATE ON multimedia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transacciones_updated_at
    BEFORE UPDATE ON transacciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nomina_updated_at
    BEFORE UPDATE ON nomina
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at
    BEFORE UPDATE ON ventas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_venta_empleados_updated_at
    BEFORE UPDATE ON venta_empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();