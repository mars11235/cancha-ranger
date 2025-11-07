// ===== SERVICIO WHATSAPP MEJORADO - 100% FUNCIONAL =====
class WhatsAppService {
    constructor() {
        this.config = {
            adminNumber: '59173314651', // Número del dueño
            businessNumber: '59173220922', // Número de la empresa
            defaultMessage: '¡Hola! Quiero hacer una reserva en Cancha Ranger'
        };
        this.notificacionesActivas = true;
    }

    // ===== ENVÍO DE RESERVA AL DUEÑO =====
    async enviarReservaPropietario(reserva) {
        if (!this.notificacionesActivas) return;
        
        const mensaje = this.generarMensajePropietario(reserva);
        return await this.enviarMensajeDirecto(this.config.adminNumber, mensaje);
    }

    generarMensajePropietario(reserva) {
        return `🚨 *NUEVA SOLICITUD DE RESERVA* 🚨

📋 *INFORMACIÓN DE LA RESERVA*
🏟️ Cancha: ${reserva.canchaNombre}
📅 Fecha: ${this.formatearFechaLegible(reserva.fecha)}
⏰ Horario: ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
💰 Precio: ${reserva.total} Bs
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

    // ===== CONFIRMACIÓN AL CLIENTE =====
    async enviarConfirmacionCliente(reserva) {
        const mensaje = this.generarMensajeConfirmacion(reserva);
        return await this.enviarMensajeDirecto(reserva.usuario.telefono, mensaje);
    }

    generarMensajeConfirmacion(reserva) {
        return `✅ *RESERVA CONFIRMADA - CANCHA RANGER* ✅

¡Hola ${reserva.usuario.nombre}! Tu reserva ha sido confirmada:

🏟️ *Cancha:* ${reserva.canchaNombre}
📅 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
⏱️ *Duración:* 1 hora
💰 *Total a pagar:* ${reserva.total} Bs

🔢 *Código de Reserva:* ${reserva.codigoReserva}

📍 *Ubicación:* Calle 9 de abril entre Ejercito y Murillo Dorado
📞 *Contacto:* 73314651-68308965
👤 *Operadora:* Lurdes Córdova

💡 *Importante:*
• Presenta este código al llegar
• Pago en efectivo en la cancha
• Llega 15 minutos antes
• Modificaciones hasta 12h antes

¡Te esperamos! 🎉`;
    }

    // ===== MÉTODO PRINCIPAL PARA ENVIAR MENSAJES =====
    async enviarMensajeDirecto(numero, mensaje) {
        try {
            const mensajeCodificado = encodeURIComponent(mensaje);
            const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;
            
            // Abrir en nueva pestaña
            const ventana = window.open(urlWhatsApp, '_blank');
            
            console.log('📱 Mensaje WhatsApp preparado:', { numero, mensaje });
            return true;
            
        } catch (error) {
            console.error('Error enviando WhatsApp:', error);
            return false;
        }
    }

    // ===== GENERAR ENLACES WHATSAPP =====
    generarEnlaceConsultaRapida(canchaId = null) {
        let mensaje = this.config.defaultMessage;
        
        if (canchaId && window.sistema) {
            const cancha = window.sistema.canchas.find(c => c.id === canchaId);
            if (cancha) {
                mensaje = `¡Hola! Estoy interesado en la *${cancha.nombre}*.\n\n• Precio: ${cancha.precio} Bs/hora\n• Tipo: ${cancha.tipo}\n• ${cancha.descripcion}\n\n¿Podrían darme más información?`;
            }
        }
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        return `https://wa.me/${this.config.businessNumber}?text=${mensajeCodificado}`;
    }

    generarEnlaceReservaDirecta(datosReserva) {
        const { cancha, fecha, horaInicio, horaFin, nombre, telefono } = datosReserva;
        const horas = horaFin - horaInicio;
        const total = horas * cancha.precio;
        
        const mensaje = `📅 *SOLICITUD DE RESERVA - CANCHA RANGER* 📅

🏟️ *Cancha de interés:* ${cancha.nombre}
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

📆 *Fecha preferida:* ${this.formatearFechaLegible(fecha)}
⏰ *Horario preferido:* ${horaInicio}:00 - ${horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total estimado:* ${total} Bs

💬 *Mensaje:* Por favor confirmen disponibilidad y procedimiento de pago.`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        return `https://wa.me/${this.config.adminNumber}?text=${mensajeCodificado}`;
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
        console.log('📱 Servicio de WhatsApp inicializado');
        
        // Crear botón flotante si no existe
        if (!document.querySelector('.whatsapp-flotante')) {
            this.crearBotonFlotanteWhatsApp();
        }
    }

    crearBotonFlotanteWhatsApp() {
        const botonWhatsApp = document.createElement('div');
        botonWhatsApp.className = 'whatsapp-flotante';
        botonWhatsApp.innerHTML = `
            <div class="whatsapp-tooltip">¿Necesitas ayuda? Escríbenos</div>
            <a href="${this.generarEnlaceConsultaRapida()}" target="_blank" class="whatsapp-link">
                <i class="fab fa-whatsapp"></i>
            </a>
        `;
        
        document.body.appendChild(botonWhatsApp);
    }
}