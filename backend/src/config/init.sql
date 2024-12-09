-- Create login_history table
CREATE TABLE IF NOT EXISTS public.login_history (
    id_login_history SERIAL PRIMARY KEY,
    id_empleado INTEGER NOT NULL REFERENCES public.usuarios(id_empleado),
    fecha_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    browser VARCHAR(100),
    device VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100)
);

-- Add indexes
CREATE INDEX idx_login_history_id_empleado ON public.login_history(id_empleado);
CREATE INDEX idx_login_history_fecha_login ON public.login_history(fecha_login);

-- Add audit trigger
CREATE TRIGGER tr_aud_login_history
    AFTER INSERT OR UPDATE OR DELETE
    ON public.login_history
    FOR EACH ROW
EXECUTE PROCEDURE public.fn_registrar_auditoria();

-- Grant permissions
ALTER TABLE public.login_history OWNER TO root;