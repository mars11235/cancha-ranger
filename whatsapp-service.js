// ===== SERVICIO DE WHATSAPP MEJORADO - CANCHA RANGER =====
class WhatsAppService {
    constructor() {
        this.config = {
            adminNumber: '59173811600', // Número del administrador
            businessNumber: '59173220922', // Número de la empresa
            defaultMessage: '¡Hola! Quiero hacer una reserva en Cancha Ranger'
        };
    }

    // ===== RESERVAS DIRECTAS POR WHATSAPP =====
    
    // Generar enlace para reserva directa
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

    // Generar enlace para consulta rápida
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

    // Enviar notificación de nueva reserva (ya existente)
    enviarNotificacionReserva(reserva) {
        if (!window.sistema) {
            console.error('Sistema no disponible');
            return;
        }

        const cancha = window.sistema.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;
        
        const mensaje = `📅 *NUEVA RESERVA - CANCHA RANGER* 📅

🏟️ *Cancha:* ${cancha?.nombre}
👤 *Cliente:* ${reserva.usuario.nombre}
📞 *Teléfono:* ${reserva.usuario.telefono}
📧 *Email:* ${reserva.usuario.email}

📆 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total:* ${reserva.total} Bs

🔢 *Código de Reserva:* ${reserva.codigoReserva}
🆔 *ID Reserva:* ${reserva.id}

⏰ *Reserva realizada:* ${new Date(reserva.timestamp).toLocaleString('es-ES')}

_Reserva confirmada automáticamente por el sistema_`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${this.config.adminNumber}?text=${mensajeCodificado}`;
        
        window.open(urlWhatsApp, '_blank');
        console.log('📱 Notificación WhatsApp enviada al administrador');
    }

    // Enviar confirmación al cliente
    enviarConfirmacionCliente(reserva) {
        if (!window.sistema) {
            console.error('Sistema no disponible');
            return;
        }

        const cancha = window.sistema.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;
        
        const mensaje = `✅ *RESERVA CONFIRMADA - CANCHA RANGER* ✅

¡Hola ${reserva.usuario.nombre}! Tu reserva ha sido confirmada:

🏟️ *Cancha:* ${cancha?.nombre}
📆 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
⏱️ *Duración:* ${horas} hora${horas > 1 ? 's' : ''}
💰 *Total a pagar:* ${reserva.total} Bs

🔢 *Código de Reserva:* ${reserva.codigoReserva}

📍 *Ubicación:* Calle 9 de abril entre Ejercito y Murillo Dorado
📞 *Contacto:* 73811600 - 73220922

💡 *Importante:*
• Presenta este código al llegar
• Pago en efectivo en la cancha
• Llega 15 minutos antes

¡Te esperamos! 🎉`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${reserva.usuario.telefono}?text=${mensajeCodificado}`;
        
        window.open(urlWhatsApp, '_blank');
        console.log('📱 Confirmación WhatsApp enviada al cliente');
    }

    // ===== BOTONES RÁPIDOS DE WHATSAPP =====
    
    // Crear botón flotante de WhatsApp
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

    // Crear botones de WhatsApp en tarjetas de canchas
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

    // ===== FUNCIONES UTILITARIAS =====
    formatearFechaLegible(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Inicializar servicio de WhatsApp
    init() {
        this.crearBotonFlotanteWhatsApp();
        
        // Esperar a que el sistema cargue las canchas
        setTimeout(() => {
            this.agregarBotonesWhatsAppCanchas();
        }, 2000);
        
        console.log('📱 Servicio de WhatsApp inicializado');
    }
}