// ===== SERVICIO WHATSAPP MEJORADO - 100% FUNCIONAL =====
class WhatsAppService {
    constructor() {
        this.config = {
            adminNumber: '59173314651',
            businessNumber: '59173220922',
            defaultMessage: '¡Hola! Quiero hacer una reserva en Cancha Ranger'
        };
    }

    async enviarReservaPropietario(reserva) {
        try {
            console.log('📱 Enviando reserva al propietario:', reserva);
            const mensaje = this.generarMensajePropietario(reserva);
            return await this.enviarMensajeDirecto(this.config.adminNumber, mensaje);
        } catch (error) {
            console.error('❌ Error enviando reserva:', error);
            return false;
        }
    }

    generarMensajePropietario(reserva) {
        let horariosTexto = '';
        reserva.horarios.forEach((grupo) => {
            const horas = grupo.length;
            horariosTexto += `• ${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${horas} hora${horas > 1 ? 's' : ''})\n`;
        });

        return `🚨 *NUEVA SOLICITUD DE RESERVA - CANCHA RANGER* 🚨

📋 *INFORMACIÓN DE LA RESERVA*
🏟️ Cancha: ${reserva.canchaNombre}
📅 Fecha: ${this.formatearFechaLegible(reserva.fecha)}
⏰ Horarios seleccionados:
${horariosTexto}
💰 Precio total: ${reserva.total} Bs
🔢 Código: ${reserva.codigoReserva}

👤 *DATOS DEL CLIENTE*
Nombre: ${reserva.usuario.nombre}
Teléfono: ${reserva.usuario.telefono}
${reserva.usuario.email ? `Email: ${reserva.usuario.email}` : ''}
${reserva.usuario.notas ? `Notas: ${reserva.usuario.notas}` : ''}

📍 *UBICACIÓN*
Calle 9 de abril entre Ejercito y Murillo Dorado

⏰ *HORA DE SOLICITUD*
${new Date().toLocaleString('es-ES')}

💡 *ACCIONES RÁPIDAS*
✅ Confirmar: "Confirmar ${reserva.codigoReserva}"
❌ Rechazar: "Rechazar ${reserva.codigoReserva}"
📞 Llamar: ${reserva.usuario.telefono}

_Reserva solicitada a través del sistema web_`;
    }

    async enviarMensajeDirecto(numero, mensaje) {
        return new Promise((resolve) => {
            try {
                const mensajeCodificado = encodeURIComponent(mensaje);
                const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;
                window.open(urlWhatsApp, '_blank');
                resolve(true);
            } catch (error) {
                console.error('❌ Error al abrir WhatsApp:', error);
                resolve(false);
            }
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

    init() {
        console.log('✅ Servicio de WhatsApp inicializado');
        return true;
    }
}