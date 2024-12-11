import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Usuario } from './usuario.model';
import { Empleado } from './empleado.model';

// Tipos comunes de navegadores y dispositivos
export type Browser = 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Opera' | 'Other';
export type Device = 'Desktop' | 'Mobile' | 'Tablet' | 'Other';

@Table({
    tableName: 'login_history',
    timestamps: false
})
export class LoginHistory extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_login_history'
    })
    id_login_history!: number;

    @ForeignKey(() => Usuario)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'id_usuario',
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    })
    id_usuario!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: 'fecha_login'
    })
    fecha_login!: Date;

    @Column({
        type: DataType.STRING(45),
        allowNull: false,
        field: 'ip_address',
        validate: {
            isIP: true
        }
    })
    ip_address!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: 'user_agent'
    })
    user_agent!: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'browser'
    })
    browser?: Browser;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'device'
    })
    device?: Device;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'country'
    })
    country?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'city'
    })
    city?: string;

    @ForeignKey(() => Empleado)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'id_empleado',
        references: {
            model: 'empleados',
            key: 'id_empleado'
        }
    })
    id_empleado?: number;

    // Relaciones
    @BelongsTo(() => Usuario, {
        foreignKey: 'id_usuario',
        as: 'usuario'
    })
    usuario?: Usuario;

    @BelongsTo(() => Empleado, {
        foreignKey: 'id_empleado',
        as: 'empleado'
    })
    empleado?: Empleado;

    // Métodos útiles
    getLocationInfo(): { country?: string; city?: string } {
        return {
            country: this.country,
            city: this.city
        };
    }

    getDeviceInfo(): { browser?: Browser; device?: Device; userAgent: string } {
        return {
            browser: this.browser,
            device: this.device,
            userAgent: this.user_agent
        };
    }

    // Método estático para obtener el historial de accesos de un usuario
    static async getHistorialAccesos(idUsuario: number, options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }): Promise<LoginHistory[]> {
        const where: any = { id_usuario: idUsuario };

        if (options?.startDate && options?.endDate) {
            where.fecha_login = {
                [Op.between]: [options.startDate, options.endDate]
            };
        }

        return await this.findAll({
            where,
            order: [['fecha_login', 'DESC']],
            limit: options?.limit,
            include: [
                { model: Usuario, as: 'usuario' },
                { model: Empleado, as: 'empleado' }
            ]
        });
    }

    // Método estático para detectar actividad sospechosa
    static async detectarActividadSospechosa(idUsuario: number): Promise<{
        actividadSospechosa: boolean;
        razones: string[];
        accesos: LoginHistory[];
    }> {
        const ultimasHoras = 24;
        const maxAccesosPorHora = 10;
        const maxPaisesDiferentes = 3;

        const fechaLimite = new Date();
        fechaLimite.setHours(fechaLimite.getHours() - ultimasHoras);

        const accesos = await this.findAll({
            where: {
                id_usuario: idUsuario,
                fecha_login: {
                    [Op.gte]: fechaLimite
                }
            },
            order: [['fecha_login', 'DESC']]
        });

        const razones: string[] = [];

        // Verificar cantidad de accesos por hora
        const accesosPorHora = new Map<number, number>();
        accesos.forEach(acceso => {
            const hora = acceso.fecha_login.getHours();
            accesosPorHora.set(hora, (accesosPorHora.get(hora) || 0) + 1);
        });

        const excesosHora = Array.from(accesosPorHora.entries())
            .filter(([_, cantidad]) => cantidad > maxAccesosPorHora);
        
        if (excesosHora.length > 0) {
            razones.push(`Exceso de accesos por hora: ${excesosHora.map(([hora, cant]) => 
                `${cant} accesos a las ${hora}:00`).join(', ')}`);
        }

        // Verificar países diferentes
        const paises = new Set(accesos.map(a => a.country).filter(Boolean));
        if (paises.size > maxPaisesDiferentes) {
            razones.push(`Accesos desde ${paises.size} países diferentes en las últimas ${ultimasHoras} horas`);
        }

        // Verificar cambios rápidos de ubicación
        const accesosOrdenados = [...accesos].sort((a, b) => 
            a.fecha_login.getTime() - b.fecha_login.getTime());
        
        for (let i = 1; i < accesosOrdenados.length; i++) {
            const tiempoEntreAccesos = accesosOrdenados[i].fecha_login.getTime() - 
                accesosOrdenados[i-1].fecha_login.getTime();
            const minutosEntreAccesos = tiempoEntreAccesos / (1000 * 60);
            
            if (accesosOrdenados[i].country !== accesosOrdenados[i-1].country && 
                minutosEntreAccesos < 60) {
                razones.push(`Cambio rápido de ubicación: de ${accesosOrdenados[i-1].country} a ${
                    accesosOrdenados[i].country} en ${Math.round(minutosEntreAccesos)} minutos`);
            }
        }

        return {
            actividadSospechosa: razones.length > 0,
            razones,
            accesos
        };
    }

    // Método estático para obtener estadísticas de acceso
    static async getEstadisticasAcceso(options?: {
        startDate?: Date;
        endDate?: Date;
        idUsuario?: number;
    }): Promise<{
        totalAccesos: number;
        accesosPorPais: { [key: string]: number };
        accesosPorDispositivo: { [key in Device]?: number };
        accesosPorNavegador: { [key in Browser]?: number };
        promedioAccesosPorDia: number;
        horasMasActivas: { hora: number; cantidad: number }[];
    }> {
        const where: any = {};

        if (options?.startDate && options?.endDate) {
            where.fecha_login = {
                [Op.between]: [options.startDate, options.endDate]
            };
        }

        if (options?.idUsuario) {
            where.id_usuario = options.idUsuario;
        }

        const accesos = await this.findAll({ where });

        const accesosPorPais: { [key: string]: number } = {};
        const accesosPorDispositivo: { [key in Device]?: number } = {};
        const accesosPorNavegador: { [key in Browser]?: number } = {};
        const accesosPorHora: { [key: number]: number } = {};

        accesos.forEach(acceso => {
            // Por país
            if (acceso.country) {
                accesosPorPais[acceso.country] = (accesosPorPais[acceso.country] || 0) + 1;
            }

            // Por dispositivo
            if (acceso.device) {
                accesosPorDispositivo[acceso.device] = (accesosPorDispositivo[acceso.device] || 0) + 1;
            }

            // Por navegador
            if (acceso.browser) {
                accesosPorNavegador[acceso.browser] = (accesosPorNavegador[acceso.browser] || 0) + 1;
            }

            // Por hora
            const hora = acceso.fecha_login.getHours();
            accesosPorHora[hora] = (accesosPorHora[hora] || 0) + 1;
        });

        // Calcular promedio de accesos por día
        const diasTotales = options?.startDate && options?.endDate
            ? Math.ceil((options.endDate.getTime() - options.startDate.getTime()) / (1000 * 60 * 60 * 24))
            : 1;

        const horasMasActivas = Object.entries(accesosPorHora)
            .map(([hora, cantidad]) => ({ hora: parseInt(hora), cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 5);

        return {
            totalAccesos: accesos.length,
            accesosPorPais,
            accesosPorDispositivo,
            accesosPorNavegador,
            promedioAccesosPorDia: accesos.length / diasTotales,
            horasMasActivas
        };
    }
}

export default LoginHistory;