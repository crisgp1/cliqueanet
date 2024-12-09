CREATE TABLE public.login_history
(
    id_login_history SERIAL PRIMARY KEY,
    id_empleado INTEGER NOT NULL REFERENCES public.usuarios(id_empleado),
    fecha_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    browser VARCHAR(100),
    device VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100)
);

ALTER TABLE public.login_history OWNER TO root;

CREATE INDEX idx_login_history_id_empleado
    ON public.login_history (id_empleado);

CREATE INDEX idx_login_history_fecha_login
    ON public.login_history (fecha_login);

CREATE TRIGGER tr_aud_login_history
    AFTER INSERT OR UPDATE OR DELETE
    ON public.login_history
    FOR EACH ROW
EXECUTE PROCEDURE public.fn_registrar_auditoria();

COMMENT ON TABLE public.login_history IS 'Tabla para almacenar el historial de inicios de sesión de los usuarios';
COMMENT ON COLUMN public.login_history.id_login_history IS 'Identificador único del registro de login';
COMMENT ON COLUMN public.login_history.id_empleado IS 'ID del empleado que inició sesión';
COMMENT ON COLUMN public.login_history.fecha_login IS 'Fecha y hora del inicio de sesión';
COMMENT ON COLUMN public.login_history.ip_address IS 'Dirección IP desde donde se realizó el login';
COMMENT ON COLUMN public.login_history.user_agent IS 'User agent del navegador utilizado';
COMMENT ON COLUMN public.login_history.browser IS 'Navegador utilizado';
COMMENT ON COLUMN public.login_history.device IS 'Dispositivo utilizado';
COMMENT ON COLUMN public.login_history.country IS 'País desde donde se realizó el login';
COMMENT ON COLUMN public.login_history.city IS 'Ciudad desde donde se realizó el login';