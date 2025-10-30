// ===== SERVICIO WHATSAPP MEJORADO - NOTIFICACIONES INSTANTÁNEAS =====
class WhatsAppService {
    constructor() {
        this.config = {
            adminNumber: '59173811600', // TU NÚMERO
            businessNumber: '59173220922', // Número de la empresa
            defaultMessage: '¡Hola! Quiero hacer una reserva en Cancha Ranger'
        };
        this.notificacionesActivas = true;
    }

    // ===== NOTIFICACIÓN INSTANTÁNEA AL ADMIN =====
    async enviarNotificacionInstantanea(reserva) {
        if (!this.notificacionesActivas) return;
        
        const cancha = window.sistema?.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;
        
        const mensaje = `🚨 *NUEVA RESERVA CONFIRMADA* 🚨

🏟️ *Cancha:* ${cancha?.nombre}
👤 *Cliente:* ${reserva.usuario.nombre}
📞 *Teléfono:* ${reserva.usuario.telefono}
📧 *Email:* ${reserva.usuario.email}

📅 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total:* ${reserva.total} Bs

🔢 *Código:* ${reserva.codigoReserva}
🆔 *ID:* ${reserva.id}

📍 *Ubicación:* Calle 9 de abril entre Ejercito y Murillo Dorado
⏰ *Hora de reserva:* ${new Date().toLocaleString('es-ES')}

_Reserva confirmada automáticamente por el sistema_`;

        await this.enviarMensajeDirecto(this.config.adminNumber, mensaje);
        
        // También enviar al segundo número si existe
        if (this.config.businessNumber && this.config.businessNumber !== this.config.adminNumber) {
            await this.enviarMensajeDirecto(this.config.businessNumber, mensaje);
        }
    }

    // ===== ALERTA URGENTE PARA RESERVAS INMEDIATAS =====
    async enviarAlertaUrgente(reserva) {
        const cancha = window.sistema?.canchas.find(c => c.id === reserva.canchaId);
        const ahora = new Date();
        const fechaReserva = new Date(reserva.fecha);
        const diferenciaHoras = (fechaReserva - ahora) / (1000 * 60 * 60);
        
        // Si la reserva es para hoy o mañana, enviar alerta especial
        if (diferenciaHoras < 48) {
            const mensajeUrgente = `🔥 *RESERVA URGENTE - HOY/MAÑANA* 🔥

🏟️ ${cancha?.nombre}
👤 ${reserva.usuario.nombre}
📞 ${reserva.usuario.telefono}
📅 ${this.formatearFechaLegible(reserva.fecha)}
⏰ ${reserva.horaInicio}:00 - ${reserva.horaFin}:00

⚠️ *RESERVA PRÓXIMA - CONFIRMAR DISPONIBILIDAD*`;

            await this.enviarMensajeDirecto(this.config.adminNumber, mensajeUrgente);
        }
    }

    // ===== MÉTODO PRINCIPAL PARA ENVIAR MENSAJES =====
    async enviarMensajeDirecto(numero, mensaje) {
        try {
            const mensajeCodificado = encodeURIComponent(mensaje);
            const urlWhatsApp = `https://wa.me/${numero}?text=${mensajeCodificado}`;
            
            // Abrir en nueva pestaña (funciona en móviles y desktop)
            const ventana = window.open(urlWhatsApp, '_blank');
            
            // Cerrar automáticamente después de 3 segundos (opcional)
            setTimeout(() => {
                if (ventana && !ventana.closed) {
                    ventana.close();
                }
            }, 3000);
            
            console.log('📱 Notificación WhatsApp enviada:', { numero, mensaje });
            return true;
            
        } catch (error) {
            console.error('Error enviando WhatsApp:', error);
            return false;
        }
    }

    // ===== CONFIRMACIÓN AL CLIENTE =====
    async enviarConfirmacionCliente(reserva) {
        const cancha = window.sistema?.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;
        
        const mensaje = `✅ *RESERVA CONFIRMADA - CANCHA RANGER* ✅

¡Hola ${reserva.usuario.nombre}! Tu reserva ha sido confirmada:

🏟️ *Cancha:* ${cancha?.nombre}
📅 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total a pagar:* ${reserva.total} Bs

🔢 *Código de Reserva:* ${reserva.codigoReserva}

📍 *Ubicación:* Calle 9 de abril entre Ejercito y Murillo Dorado
📞 *Contacto:* 73811600 - 73220922
👤 *Operadora:* Lurdes Córdova

💡 *Importante:*
• Presenta este código al llegar
• Pago en efectivo en la cancha
• Llega 15 minutos antes
• Modificaciones hasta 12h antes

¡Te esperamos! 🎉`;

        await this.enviarMensajeDirecto(reserva.usuario.telefono, mensaje);
    }

    // ===== SISTEMA DE RECORDATORIOS =====
    programarRecordatorios(reserva) {
        // Recordatorio 24 horas antes
        const recordatorio24h = new Date(reserva.fecha);
        recordatorio24h.setHours(reserva.horaInicio - 24);
        
        // Recordatorio 2 horas antes (solo si es el mismo día)
        const recordatorio2h = new Date(reserva.fecha);
        recordatorio2h.setHours(reserva.horaInicio - 2);
        
        this.programarRecordatorio(recordatorio24h, reserva, '24 horas');
        this.programarRecordatorio(recordatorio2h, reserva, '2 horas');
    }

    programarRecordatorio(fecha, reserva, tipo) {
        const ahora = new Date();
        const diferencia = fecha - ahora;
        
        if (diferencia > 0) {
            setTimeout(() => {
                this.enviarRecordatorio(reserva, tipo);
            }, diferencia);
        }
    }

    async enviarRecordatorio(reserva, tipo) {
        const mensaje = `⏰ *RECORDATORIO - CANCHA RANGER* ⏰

¡Hola ${reserva.usuario.nombre}! Te recordamos tu reserva:

Tu partido es en *${tipo}*
🏟️ Cancha: ${reserva.canchaId}
📅 Fecha: ${this.formatearFechaLegible(reserva.fecha)}
⏰ Horario: ${reserva.horaInicio}:00 - ${reserva.horaFin}:00

🔢 Código: ${reserva.codigoReserva}

📍 Calle 9 de abril entre Ejercito y Murillo Dorado
📞 73811600 - 73220922

¡Te esperamos! 🎾`;

        await this.enviarMensajeDirecto(reserva.usuario.telefono, mensaje);
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

    // ===== CONFIGURACIÓN EN TIEMPO REAL =====
    toggleNotificaciones(activo) {
        this.notificacionesActivas = activo;
        console.log(`🔔 Notificaciones ${activo ? 'activadas' : 'desactivadas'}`);
    }

    // ===== BOTÓN FLOTANTE WHATSAPP =====
    crearBotonFlotanteWhatsApp() {
        // Verificar si ya existe el botón
        if (document.querySelector('.whatsapp-flotante')) {
            return;
        }

        const botonWhatsApp = document.createElement('div');
        botonWhatsApp.className = 'whatsapp-flotante';
        botonWhatsApp.innerHTML = `
            <a href="${this.generarEnlaceConsultaRapida()}" target="_blank" class="whatsapp-link">
                <i class="fab fa-whatsapp"></i>
                <span>Reservar por WhatsApp</span>
            </a>
        `;
        
        document.body.appendChild(botonWhatsApp);
        return botonWhatsApp;
    }

    // ===== BOTONES WHATSAPP EN CANCHAS =====
    agregarBotonesWhatsAppCanchas() {
        const canchasGrid = document.getElementById('canchasGrid');
        if (!canchasGrid) return;

        // Agregar botón WhatsApp a cada cancha
        document.querySelectorAll('.cancha-card-profesional').forEach((card, index) => {
            const cancha = window.sistema?.canchas[index];
            if (!cancha) return;

            // Verificar si ya existe el botón
            if (card.querySelector('.btn-whatsapp-cancha')) {
                return;
            }

            const botonWhatsApp = document.createElement('button');
            botonWhatsApp.className = 'btn-whatsapp-cancha';
            botonWhatsApp.innerHTML = `
                <i class="fab fa-whatsapp"></i>
                WhatsApp
            `;
            
            botonWhatsApp.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = this.generarEnlaceConsultaRapida(cancha.id);
                window.open(url, '_blank');
            });

            const acciones = card.querySelector('.cancha-actions');
            if (acciones) {
                acciones.appendChild(botonWhatsApp);
            }
        });
    }

    // ===== GENERAR ENLACES WHATSAPP =====
    generarEnlaceConsultaRapida(canchaId = null) {
        let mensaje = this.config.defaultMessage;
        
        if (canchaId && window.sistema) {
            const cancha = window.sistema.canchas.find(c => c.id === canchaId);
            if (cancha) {
                mensaje = `¡Hola! Estoy interesado en reservar la *${cancha.nombre}*.\n\n• Precio: ${cancha.precio} Bs/hora\n• Tipo: ${cancha.tipo}\n\n¿Podrían indicarme disponibilidad y proceso de reserva?`;
            }
        }
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        return `https://wa.me/${this.config.businessNumber}?text=${mensajeCodificado}`;
    }

    generarEnlaceReservaDirecta(datosReserva = null) {
        let mensaje = this.config.defaultMessage;
        
        if (datosReserva) {
            const { cancha, fecha, horaInicio, horaFin, nombre, telefono } = datosReserva;
            const horas = horaFin - horaInicio;
            const total = horas * cancha.precio;
            
            mensaje = `📅 *SOLICITUD DE RESERVA - CANCHA RANGER* 📅

🏟️ *Cancha de interés:* ${cancha.nombre}
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}

📆 *Fecha preferida:* ${this.formatearFechaLegible(fecha)}
⏰ *Horario preferido:* ${horaInicio}:00 - ${horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total estimado:* ${total} Bs

💬 *Mensaje:* Por favor confirmen disponibilidad y procedimiento de pago.`;
        }
        
        const mensajeCodificado = encodeURIComponent(mensaje);
        return `https://wa.me/${this.config.adminNumber}?text=${mensajeCodificado}`;
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('📱 Servicio de WhatsApp inicializado - Notificaciones activas');
        this.crearBotonFlotanteWhatsApp();
        
        // Esperar a que carguen las canchas para agregar botones
        setTimeout(() => {
            this.agregarBotonesWhatsAppCanchas();
        }, 2000);
        
        // Verificar cada 30 segundos si hay nuevas reservas pendientes de notificación
        setInterval(() => {
            this.verificarReservasPendientes();
        }, 30000);
    }

    verificarReservasPendientes() {
        // En un sistema más avanzado, podrías verificar reservas que no han sido notificadas
        console.log('🔍 Verificando reservas pendientes de notificación...');
    }
}