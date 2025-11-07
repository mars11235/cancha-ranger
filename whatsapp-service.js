// ===== SERVICIO WHATSAPP MEJORADO - 100% FUNCIONAL =====
// ===== SERVICIO WHATSAPP MEJORADO - 100% FUNCIONAL =====
class WhatsAppService {
    constructor() {
        this.config = {
            adminNumber: '59173314651', // Número del dueño - FORMATO INTERNACIONAL
            businessNumber: '59173220922', // Número de la empresa
            defaultMessage: '¡Hola! Quiero hacer una reserva en Cancha Ranger'
        };
        this.notificacionesActivas = true;
    }

    // ===== ENVÍO DE RESERVA AL DUEÑO - MÉTODO PRINCIPAL =====
    async enviarReservaPropietario(reserva) {
        try {
            console.log('📱 Iniciando envío de reserva al propietario:', reserva);
            
            if (!this.validarReserva(reserva)) {
                throw new Error('Datos de reserva inválidos');
            }

            const mensaje = this.generarMensajePropietario(reserva);
            const resultado = await this.enviarMensajeDirecto(this.config.adminNumber, mensaje);
            
            if (resultado) {
                console.log('✅ Reserva enviada exitosamente al propietario');
                return true;
            } else {
                throw new Error('Error al abrir WhatsApp');
            }
            
        } catch (error) {
            console.error('❌ Error enviando reserva al propietario:', error);
            return false;
        }
    }

    // ===== VALIDACIÓN COMPLETA DE RESERVA =====
    validarReserva(reserva) {
        const camposRequeridos = [
            'canchaNombre', 'fecha', 'horarios', 'usuario', 'total', 'codigoReserva'
        ];
        
        for (let campo of camposRequeridos) {
            if (!reserva[campo]) {
                console.error(`Campo requerido faltante: ${campo}`);
                return false;
            }
        }

        if (!reserva.usuario.nombre || !reserva.usuario.telefono) {
            console.error('Datos de usuario incompletos');
            return false;
        }

        if (reserva.horarios.length === 0) {
            console.error('No hay horarios seleccionados');
            return false;
        }

        return true;
    }

    // ===== GENERAR MENSAJE PARA EL DUEÑO =====
    generarMensajePropietario(reserva) {
        let horariosTexto = '';
        reserva.horarios.forEach((grupo, index) => {
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
🆔 ID: ${reserva.id}

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

    // ===== MÉTODO PRINCIPAL PARA ENVIAR MENSAJES =====
    async enviarMensajeDirecto(numero, mensaje) {
        return new Promise((resolve) => {
            try {
                const mensajeCodificado = encodeURIComponent(mensaje);
                const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;
                
                // Abrir en nueva pestaña
                const ventana = window.open(urlWhatsApp, '_blank');
                
                if (ventana) {
                    console.log('📱 WhatsApp abierto exitosamente');
                    resolve(true);
                } else {
                    console.error('❌ No se pudo abrir WhatsApp');
                    resolve(false);
                }
                
            } catch (error) {
                console.error('❌ Error crítico al abrir WhatsApp:', error);
                resolve(false);
            }
        });
    }

    // ===== MÉTODOS UTILITARIOS =====
    formatearFechaLegible(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('✅ Servicio de WhatsApp inicializado correctamente');
        return true;
    }
}