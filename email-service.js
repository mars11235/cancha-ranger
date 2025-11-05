// ===== SERVICIO DE EMAIL - CANCHA RANGER =====
class EmailService {
    constructor() {
        this.config = {
            serviceId: 'service_cancharanger',
            templateId: 'template_reservas',
            publicKey: 'tu_public_key_aqui'
        };
    }

    // Enviar email de confirmación al usuario
    async enviarConfirmacionUsuario(reserva, cancha) {
        const horas = reserva.horaFin - reserva.horaInicio;
        const total = reserva.total;
        
        const templateParams = {
            to_email: reserva.usuario.email,
            to_name: reserva.usuario.nombre,
            from_name: 'Cancha Ranger',
            subject: `Confirmación de Reserva - ${reserva.codigoReserva}`,
            reserva_codigo: reserva.codigoReserva,
            reserva_fecha: this.formatearFechaLegible(reserva.fecha),
            reserva_horario: `${reserva.horaInicio}:00 - ${reserva.horaFin}:00`,
            reserva_duracion: `${horas} hora${horas > 1 ? 's' : ''}`,
            reserva_total: `${total} Bs`,
            cancha_nombre: cancha.nombre,
            cancha_tipo: cancha.tipo,
            cliente_nombre: reserva.usuario.nombre,
            cliente_telefono: reserva.usuario.telefono,
            politicas_cancelacion: 'Puedes modificar o cancelar tu reserva hasta 12 horas antes del horario programado sin costo alguno.',
            contacto_telefono1: '73314651',
            contacto_telefono2: '68308965',
            contacto_operadora: 'Lurdes Córdova',
            contacto_ubicacion: 'Calle 9 de abril entre Ejercito y Murillo Dorado'
        };

        try {
            // Simulación de envío de email - En producción conectar con EmailJS o similar
            await this.simularEnvioEmail(templateParams);
            console.log('📧 Email de confirmación enviado:', templateParams);
            return true;
        } catch (error) {
            console.error('Error enviando email:', error);
            return false;
        }
    }

    // Enviar notificación al administrador
    async enviarNotificacionAdmin(reserva, cancha) {
        const templateParams = {
            to_email: 'admin@cancharanger.com',
            to_name: 'Administrador Cancha Ranger',
            from_name: 'Sistema de Reservas',
            subject: `Nueva Reserva - ${reserva.codigoReserva}`,
            reserva_codigo: reserva.codigoReserva,
            reserva_fecha: this.formatearFechaLegible(reserva.fecha),
            reserva_horario: `${reserva.horaInicio}:00 - ${reserva.horaFin}:00`,
            cancha_nombre: cancha.nombre,
            cliente_nombre: reserva.usuario.nombre,
            cliente_email: reserva.usuario.email,
            cliente_telefono: reserva.usuario.telefono,
            reserva_total: `${reserva.total} Bs`,
            timestamp: new Date().toLocaleString('es-ES')
        };

        try {
            await this.simularEnvioEmail(templateParams);
            console.log('🔔 Notificación al admin enviada:', templateParams);
            return true;
        } catch (error) {
            console.error('Error enviando notificación admin:', error);
            return false;
        }
    }

    // Enviar email de cancelación
    async enviarCancelacionUsuario(reserva, cancha) {
        const templateParams = {
            to_email: reserva.usuario.email,
            to_name: reserva.usuario.nombre,
            from_name: 'Cancha Ranger',
            subject: `Cancelación de Reserva - ${reserva.codigoReserva}`,
            reserva_codigo: reserva.codigoReserva,
            reserva_fecha: this.formatearFechaLegible(reserva.fecha),
            reserva_horario: `${reserva.horaInicio}:00 - ${reserva.horaFin}:00`,
            cancha_nombre: cancha.nombre,
            mensaje: 'Tu reserva ha sido cancelada exitosamente.',
            contacto_telefono1: '73811600',
            contacto_telefono2: '73220922'
        };

        try {
            await this.simularEnvioEmail(templateParams);
            console.log('📧 Email de cancelación enviado:', templateParams);
            return true;
        } catch (error) {
            console.error('Error enviando email de cancelación:', error);
            return false;
        }
    }

    // Enviar email de modificación
    async enviarModificacionUsuario(reservaOriginal, reservaModificada, cancha) {
        const templateParams = {
            to_email: reservaModificada.usuario.email,
            to_name: reservaModificada.usuario.nombre,
            from_name: 'Cancha Ranger',
            subject: `Modificación de Reserva - ${reservaModificada.codigoReserva}`,
            reserva_codigo: reservaModificada.codigoReserva,
            fecha_original: this.formatearFechaLegible(reservaOriginal.fecha),
            horario_original: `${reservaOriginal.horaInicio}:00 - ${reservaOriginal.horaFin}:00`,
            fecha_nueva: this.formatearFechaLegible(reservaModificada.fecha),
            horario_nuevo: `${reservaModificada.horaInicio}:00 - ${reservaModificada.horaFin}:00`,
            cancha_nombre: cancha.nombre,
            total_original: `${reservaOriginal.total} Bs`,
            total_nuevo: `${reservaModificada.total} Bs`,
            contacto_telefono1: '73811600',
            contacto_telefono2: '73220922'
        };

        try {
            await this.simularEnvioEmail(templateParams);
            console.log('📧 Email de modificación enviado:', templateParams);
            return true;
        } catch (error) {
            console.error('Error enviando email de modificación:', error);
            return false;
        }
    }

    // Simular envío de email (en producción usar EmailJS, SendGrid, etc.)
    async simularEnvioEmail(params) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('✉️ Email simulado enviado:', {
                    to: params.to_email,
                    subject: params.subject
                });
                resolve(true);
            }, 1000);
        });
    }

    formatearFechaLegible(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}