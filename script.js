// ===== SISTEMA CANCHA RANGER - VERSIÓN CON CALENDARIO Y HORARIOS MÚLTIPLES =====

class SistemaCanchaRanger {
    constructor() {
        this.config = {
            horarioApertura: 14,
            horarioCierre: 22,
            precioWally: 20,
            precioFutsal: 25,
            adminNumber: '59173314651',
            businessNumber: '59173220922'
        };

        this.canchas = [
            {
                id: 1,
                nombre: "Cancha 1 Wally",
                tipo: "voleibol",
                precio: this.config.precioWally,
                imagen: "https://images.unsplash.com/photo-1592656094267-764a4512aae6?w=400&h=250&fit=crop",
                descripcion: "Cancha profesional de voleibol con medidas oficiales.",
                caracteristicas: ["Iluminación profesional", "Piso de madera", "Red profesional"],
                estado: "disponible",
                capacidad: "6v6"
            },
            {
                id: 2,
                nombre: "Cancha 2 Wally", 
                tipo: "voleibol",
                precio: this.config.precioWally,
                imagen: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=250&fit=crop",
                descripcion: "Cancha de voleibol con iluminación profesional.",
                caracteristicas: ["Iluminación LED", "Vestuarios cerca", "Marcación oficial"],
                estado: "disponible",
                capacidad: "6v6"
            },
            {
                id: 3,
                nombre: "Cancha 3 Wally",
                tipo: "voleibol", 
                precio: this.config.precioWally,
                imagen: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=400&h=250&fit=crop",
                descripcion: "Cancha competitiva de voleibol ideal para torneos y partidos.",
                caracteristicas: ["Marcación oficial", "Red profesional", "Área de descanso"],
                estado: "disponible",
                capacidad: "6v6"
            },
            {
                id: 4,
                nombre: "Cancha 4 Futsal",
                tipo: "futsal",
                precio: this.config.precioFutsal,
                imagen: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=250&fit=crop",
                descripcion: "Cancha sintetica de futsal ideal para torneos.",
                caracteristicas: ["Piso sintético", "Arcos profesionales", "Iluminación LED"],
                estado: "disponible", 
                capacidad: "10v10"
            }
        ];

        // Nuevas propiedades para calendario
        this.fechaActual = new Date();
        this.mesActual = this.fechaActual.getMonth();
        this.anoActual = this.fechaActual.getFullYear();
        
        // Estado de reserva actual mejorado
        this.reservaActual = {
            cancha: null,
            fecha: null,
            horarios: [], // Array para múltiples horarios
            datosCliente: null
        };

        this.init();
    }

    init() {
        this.inicializarFechas();
        this.inicializarEventListeners();
        this.inicializarComponentes();
        this.inicializarSistemaReservaSimple();
        console.log('🚀 Sistema Cancha Ranger - Versión con Calendario y Horarios Múltiples Inicializada');
    }

    inicializarFechas() {
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const pasadoManana = new Date(hoy);
        pasadoManana.setDate(pasadoManana.getDate() + 2);

        // Formatear fechas para mostrar
        document.getElementById('fechaHoy').textContent = hoy.getDate() + '/' + (hoy.getMonth() + 1);
        document.getElementById('fechaManana').textContent = manana.getDate() + '/' + (manana.getMonth() + 1);
        document.getElementById('fechaPasadoManana').textContent = pasadoManana.getDate() + '/' + (pasadoManana.getMonth() + 1);
        
        // Nombre del día para pasado mañana
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        document.getElementById('diaPasadoManana').textContent = dias[pasadoManana.getDay()].substring(0, 3);
    }

    // ===== CALENDARIO INTERACTIVO =====
    inicializarCalendario() {
        this.actualizarCalendario();
        
        // Event listeners para navegación del calendario
        document.getElementById('btnMesAnterior').addEventListener('click', () => {
            this.mesActual--;
            if (this.mesActual < 0) {
                this.mesActual = 11;
                this.anoActual--;
            }
            this.actualizarCalendario();
        });

        document.getElementById('btnMesSiguiente').addEventListener('click', () => {
            this.mesActual++;
            if (this.mesActual > 11) {
                this.mesActual = 0;
                this.anoActual++;
            }
            this.actualizarCalendario();
        });
    }

    actualizarCalendario() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        // Actualizar header
        document.getElementById('mesActual').textContent = `${meses[this.mesActual]} ${this.anoActual}`;
        
        // Generar días del calendario
        const primerDia = new Date(this.anoActual, this.mesActual, 1);
        const ultimoDia = new Date(this.anoActual, this.mesActual + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const primerDiaSemana = primerDia.getDay();
        
        const calendarioDias = document.getElementById('calendarioDias');
        let html = '';
        
        // Días vacíos al inicio
        for (let i = 0; i < primerDiaSemana; i++) {
            html += '<div class="dia-calendario inactivo"></div>';
        }
        
        // Días del mes
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(this.anoActual, this.mesActual, dia);
            const esHoy = fechaDia.getTime() === hoy.getTime();
            const esPasado = fechaDia < hoy;
            const fechaStr = fechaDia.toISOString().split('T')[0];
            const seleccionado = this.reservaActual.fecha === fechaStr;
            
            let clase = 'dia-calendario';
            if (esHoy) clase += ' hoy';
            if (esPasado) clase += ' inactivo';
            if (seleccionado) clase += ' seleccionado';
            
            const onclick = !esPasado ? `sistema.seleccionarFechaCalendario('${fechaStr}')` : '';
            
            html += `<div class="${clase}" onclick="${onclick}">${dia}</div>`;
        }
        
        calendarioDias.innerHTML = html;
    }

    seleccionarFechaCalendario(fechaStr) {
        this.reservaActual.fecha = fechaStr;
        this.reservaActual.horarios = []; // Reset horarios al cambiar fecha
        this.actualizarCalendario();
        this.actualizarResumenRapido();
        this.mostrarNotificacion(`📅 Fecha seleccionada: ${this.formatearFechaLegible(fechaStr)}`, 'success');
    }

    // ===== HORARIOS MÚLTIPLES =====
    inicializarHorariosMultiples() {
        const contenedor = document.getElementById('horariosMultiples');
        if (!contenedor || !this.reservaActual.fecha) return;

        let html = '';
        for (let hora = this.config.horarioApertura; hora < this.config.horarioCierre; hora++) {
            const disponible = this.verificarDisponibilidadHora(this.reservaActual.fecha, hora);
            const seleccionado = this.reservaActual.horarios.includes(hora);
            const esConsecutivo = this.esHorarioConsecutivo(hora);
            
            let clase = 'horario-multiple';
            if (!disponible) clase += ' no-disponible';
            if (seleccionado) clase += ' seleccionado';
            if (esConsecutivo) clase += ' consecutivo';
            
            const onclick = disponible ? `sistema.toggleHorario(${hora})` : '';
            
            html += `
                <div class="${clase}" onclick="${onclick}">
                    ${hora}:00 - ${hora + 1}:00
                </div>
            `;
        }
        
        contenedor.innerHTML = html;
        
        // Actualizar información de fecha
        const fechaInfo = document.getElementById('fechaSeleccionadaInfo');
        if (fechaInfo) {
            fechaInfo.textContent = this.formatearFechaLegible(this.reservaActual.fecha);
        }
        
        this.actualizarResumenHorarios();
    }

    toggleHorario(hora) {
        const index = this.reservaActual.horarios.indexOf(hora);
        
        if (index === -1) {
            // Agregar horario
            this.reservaActual.horarios.push(hora);
            this.reservaActual.horarios.sort((a, b) => a - b);
        } else {
            // Remover horario
            this.reservaActual.horarios.splice(index, 1);
        }
        
        this.inicializarHorariosMultiples();
        this.mostrarNotificacion(`⏰ ${hora}:00 ${index === -1 ? 'agregado' : 'removido'}`, 'success');
    }

    esHorarioConsecutivo(hora) {
        if (!this.reservaActual.horarios.includes(hora)) return false;
        
        // Verificar si es parte de una secuencia consecutiva
        const horarios = this.reservaActual.horarios;
        const index = horarios.indexOf(hora);
        
        // Verificar si tiene vecinos consecutivos
        const tieneAnterior = index > 0 && horarios[index - 1] === hora - 1;
        const tieneSiguiente = index < horarios.length - 1 && horarios[index + 1] === hora + 1;
        
        return tieneAnterior || tieneSiguiente;
    }

    actualizarResumenHorarios() {
        const contenedor = document.getElementById('resumenHorarios');
        if (!contenedor) return;

        if (this.reservaActual.horarios.length > 0) {
            let total = 0;
            const horariosAgrupados = this.agruparHorariosConsecutivos();
            
            let html = '<div class="resumen-horarios-contenido">';
            
            horariosAgrupados.forEach(grupo => {
                const horas = grupo.length;
                const precioGrupo = horas * (this.reservaActual.cancha?.precio || 0);
                total += precioGrupo;
                
                html += `
                    <div class="horario-seleccionado-item">
                        <div>
                            <strong>${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00</strong>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                ${horas} hora${horas > 1 ? 's' : ''} • ${precioGrupo} Bs
                            </div>
                        </div>
                        <button class="btn-eliminar-horario" onclick="sistema.eliminarGrupoHorarios([${grupo}])">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            
            html += `
                <div class="total-horarios">
                    <span>Total:</span>
                    <span>${total} Bs</span>
                </div>
            </div>`;
            
            contenedor.innerHTML = html;
        } else {
            contenedor.innerHTML = `
                <div class="resumen-vacio">
                    <i class="fas fa-info-circle"></i>
                    Selecciona al menos un horario
                </div>
            `;
        }
    }

    agruparHorariosConsecutivos() {
        const horarios = [...this.reservaActual.horarios].sort((a, b) => a - b);
        const grupos = [];
        let grupoActual = [];
        
        horarios.forEach((hora, index) => {
            if (grupoActual.length === 0) {
                grupoActual.push(hora);
            } else if (hora === grupoActual[grupoActual.length - 1] + 1) {
                grupoActual.push(hora);
            } else {
                grupos.push([...grupoActual]);
                grupoActual = [hora];
            }
        });
        
        if (grupoActual.length > 0) {
            grupos.push(grupoActual);
        }
        
        return grupos;
    }

    eliminarGrupoHorarios(horarios) {
        this.reservaActual.horarios = this.reservaActual.horarios.filter(
            h => !horarios.includes(h)
        );
        this.inicializarHorariosMultiples();
    }

    // ===== SISTEMA DE RESERVA SIMPLE =====
    inicializarSistemaReservaSimple() {
        this.inicializarCalendario();
        // Establecer fecha por defecto (hoy)
        const hoyStr = new Date().toISOString().split('T')[0];
        this.seleccionarFechaCalendario(hoyStr);
    }

    generarCanchasRapidas() {
        const contenedor = document.getElementById('canchasRapidas');
        if (!contenedor) return;

        const canchasHTML = this.canchas.map(cancha => `
            <div class="cancha-rapida-btn" onclick="sistema.seleccionarCanchaRapida(${cancha.id})">
                <div class="cancha-nombre">${cancha.nombre}</div>
                <div class="cancha-precio">${cancha.precio} Bs/hora</div>
                <div class="cancha-tipo">${cancha.tipo}</div>
            </div>
        `).join('');

        contenedor.innerHTML = canchasHTML;
    }

    seleccionarCanchaRapida(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        this.reservaActual.cancha = cancha;
        
        // Actualizar UI
        document.querySelectorAll('.cancha-rapida-btn').forEach(btn => {
            btn.classList.remove('seleccionada');
        });
        
        const botones = document.querySelectorAll('.cancha-rapida-btn');
        if (botones[canchaId - 1]) {
            botones[canchaId - 1].classList.add('seleccionada');
        }

        this.mostrarNotificacion(`✅ ${cancha.nombre} seleccionada`, 'success');
        this.actualizarResumenRapido();
    }

    actualizarResumenRapido() {
        const contenedor = document.getElementById('resumenRapido');
        if (!contenedor) return;

        if (this.reservaActual.cancha && this.reservaActual.fecha) {
            contenedor.innerHTML = `
                <div class="resumen-contenido">
                    <div class="resumen-item">
                        <span>Cancha:</span>
                        <span>${this.reservaActual.cancha.nombre}</span>
                    </div>
                    <div class="resumen-item">
                        <span>Fecha:</span>
                        <span>${this.formatearFechaLegible(this.reservaActual.fecha)}</span>
                    </div>
                    <div class="resumen-item">
                        <span>Precio por hora:</span>
                        <span>${this.reservaActual.cancha.precio} Bs</span>
                    </div>
                </div>
            `;
        } else {
            contenedor.innerHTML = `
                <div class="resumen-vacio">
                    <i class="fas fa-info-circle"></i>
                    Selecciona cancha y fecha para continuar
                </div>
            `;
        }
    }

    // ===== CONFIRMACIÓN MEJORADA =====
    avanzarPasoSimple(paso) {
        // Validaciones antes de avanzar
        if (paso === 2 && !this.validarPaso1()) {
            this.mostrarNotificacion('❌ Selecciona cancha y fecha primero', 'error');
            return;
        }

        if (paso === 3 && (!this.validarPaso2() || this.reservaActual.horarios.length === 0)) {
            this.mostrarNotificacion('❌ Completa tus datos y selecciona al menos un horario', 'error');
            return;
        }

        // Ocultar todos los pasos
        document.querySelectorAll('.reserva-paso-simple').forEach(paso => {
            paso.classList.remove('active');
        });
        
        // Mostrar paso actual
        document.getElementById(`pasoSimple${paso}`).classList.add('active');

        // Inicializar componentes específicos del paso
        if (paso === 2) {
            this.inicializarHorariosMultiples();
        } else if (paso === 3) {
            this.actualizarResumenFinal();
        }
    }

    retrocederPasoSimple(paso) {
        this.avanzarPasoSimple(paso);
    }

    validarPaso1() {
        return this.reservaActual.cancha && this.reservaActual.fecha;
    }

    validarPaso2() {
        const nombre = document.getElementById('nombreSimple').value;
        const telefono = document.getElementById('telefonoSimple').value;
        
        if (!nombre || !telefono) {
            return false;
        }

        if (telefono.length < 8) {
            this.mostrarNotificacion('❌ El teléfono debe tener al menos 8 dígitos', 'error');
            return false;
        }

        return true;
    }

    actualizarResumenFinal() {
        const contenedor = document.getElementById('resumenFinal');
        if (!contenedor) return;

        const nombre = document.getElementById('nombreSimple').value;
        const telefono = document.getElementById('telefonoSimple').value;
        const email = document.getElementById('emailSimple').value;
        const notas = document.getElementById('notasSimple').value;
        
        const horariosAgrupados = this.agruparHorariosConsecutivos();
        const total = horariosAgrupados.reduce((sum, grupo) => {
            return sum + (grupo.length * this.reservaActual.cancha.precio);
        }, 0);

        this.reservaActual.datosCliente = {
            nombre,
            telefono,
            email,
            notas
        };

        let horariosHTML = '';
        horariosAgrupados.forEach(grupo => {
            const horas = grupo.length;
            horariosHTML += `
                <div class="resumen-item">
                    <strong>Horario:</strong>
                    <span>${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${horas} hora${horas > 1 ? 's' : ''})</span>
                </div>
            `;
        });

        contenedor.innerHTML = `
            <div class="resumen-item">
                <strong>Cancha:</strong>
                <span>${this.reservaActual.cancha.nombre}</span>
            </div>
            <div class="resumen-item">
                <strong>Fecha:</strong>
                <span>${this.formatearFechaLegible(this.reservaActual.fecha)}</span>
            </div>
            ${horariosHTML}
            <div class="resumen-item">
                <strong>Cliente:</strong>
                <span>${nombre}</span>
            </div>
            <div class="resumen-item">
                <strong>Teléfono:</strong>
                <span>${telefono}</span>
            </div>
            ${email ? `<div class="resumen-item">
                <strong>Email:</strong>
                <span>${email}</span>
            </div>` : ''}
            ${notas ? `<div class="resumen-item">
                <strong>Notas:</strong>
                <span>${notas}</span>
            </div>` : ''}
            <div class="resumen-item resumen-total">
                <strong>Total a pagar:</strong>
                <span>${total} Bs</span>
            </div>
        `;
    }

    confirmarReservaWhatsApp() {
        if (!this.validarPaso2()) {
            this.mostrarNotificacion('❌ Completa correctamente tus datos', 'error');
            return;
        }

        if (this.reservaActual.horarios.length === 0) {
            this.mostrarNotificacion('❌ Selecciona al menos un horario', 'error');
            return;
        }

        // Crear objeto de reserva mejorado
        const horariosAgrupados = this.agruparHorariosConsecutivos();
        const total = horariosAgrupados.reduce((sum, grupo) => {
            return sum + (grupo.length * this.reservaActual.cancha.precio);
        }, 0);

        const reserva = {
            id: this.generarId(),
            canchaId: this.reservaActual.cancha.id,
            canchaNombre: this.reservaActual.cancha.nombre,
            fecha: this.reservaActual.fecha,
            horarios: horariosAgrupados,
            usuario: this.reservaActual.datosCliente,
            total: total,
            codigoReserva: this.generarCodigoReserva(),
            timestamp: new Date().toISOString()
        };

        // Enviar por WhatsApp
        this.enviarReservaWhatsApp(reserva);
    }

    enviarReservaWhatsApp(reserva) {
        const mensaje = this.generarMensajeWhatsApp(reserva);
        const url = `https://wa.me/${this.config.adminNumber}?text=${encodeURIComponent(mensaje)}`;
        
        // Abrir WhatsApp
        window.open(url, '_blank');
        
        // Mostrar confirmación
        this.mostrarConfirmacionReserva(reserva);
        
        // Reiniciar sistema después de 2 segundos
        setTimeout(() => {
            this.reiniciarSistemaReserva();
        }, 2000);
    }

    generarMensajeWhatsApp(reserva) {
        let horariosTexto = '';
        reserva.horarios.forEach((grupo, index) => {
            const horas = grupo.length;
            horariosTexto += `• ${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${horas} hora${horas > 1 ? 's' : ''})\n`;
        });

        return `🏐 *NUEVA RESERVA - CANCHA RANGER* 🏐

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

_Reserva solicitada a través del sistema web_`;
    }

    mostrarConfirmacionReserva(reserva) {
        const modalBody = document.getElementById('confirmacionBody');
        
        modalBody.innerHTML = `
            <div class="text-center">
                <div class="success-icon" style="font-size: 4rem; color: var(--success-color); margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: var(--success-color); margin-bottom: 1rem;">¡Solicitud Enviada!</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Se abrirá WhatsApp para que envíes la solicitud al administrador.
                </p>
                
                <div style="background: var(--secondary-color); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem; text-align: left;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Cancha:</strong>
                        <span>${reserva.canchaNombre}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Fecha:</strong>
                        <span>${this.formatearFechaLegible(reserva.fecha)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Total:</strong>
                        <span style="color: var(--primary-color); font-weight: bold;">${reserva.total} Bs</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <strong>Código:</strong>
                        <span style="background: var(--primary-color); color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: bold;">${reserva.codigoReserva}</span>
                    </div>
                </div>
                
                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--border-radius-sm); padding: 1rem; margin-bottom: 1.5rem;">
                    <p style="margin: 0; color: var(--info-color); font-size: 0.9rem;">
                        <i class="fas fa-info-circle"></i> 
                        El administrador confirmará tu reserva por WhatsApp en unos minutos.
                    </p>
                </div>
                
                <button class="btn btn-primary" onclick="document.getElementById('confirmacionModal').style.display='none'">
                    <i class="fas fa-check"></i> Entendido
                </button>
            </div>
        `;
        
        document.getElementById('confirmacionModal').style.display = 'block';
    }

    reiniciarSistemaReserva() {
        this.reservaActual = {
            cancha: null,
            fecha: null,
            horarios: [],
            datosCliente: null
        };
        
        // Resetear UI
        document.querySelectorAll('.cancha-rapida-btn').forEach(btn => {
            btn.classList.remove('seleccionada');
        });
        
        // Resetear formulario
        document.getElementById('nombreSimple').value = '';
        document.getElementById('telefonoSimple').value = '';
        document.getElementById('emailSimple').value = '';
        document.getElementById('notasSimple').value = '';
        
        // Volver al paso 1
        this.avanzarPasoSimple(1);
        this.actualizarCalendario();
        this.actualizarResumenRapido();
        
        this.mostrarNotificacion('✅ Sistema reiniciado. ¡Puedes hacer otra reserva!', 'success');
    }

    // ===== SISTEMA DE CANCHAS =====
    generarHTMLCanchas() {
        const canchasGrid = document.getElementById('canchasGrid');
        if (!canchasGrid) return;

        canchasGrid.innerHTML = this.canchas.map(cancha => `
            <div class="cancha-card-profesional" data-tipo="${cancha.tipo}">
                <div class="cancha-imagen-container">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" class="cancha-imagen" onerror="this.src='https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?w=400&h=250&fit=crop'">
                    <div class="cancha-badge">${cancha.tipo}</div>
                    <div class="cancha-overlay">
                        <button class="btn-ver-detalles" onclick="sistema.mostrarDetallesCancha(${cancha.id})">
                            <i class="fas fa-info-circle"></i> Ver Detalles
                        </button>
                    </div>
                </div>
                <div class="cancha-info-profesional">
                    <h3>${cancha.nombre}</h3>
                    <p class="cancha-descripcion">${cancha.descripcion}</p>
                    
                    <div class="cancha-caracteristicas-profesional">
                        ${cancha.caracteristicas.map(caract => `
                            <span class="caracteristica-tag">
                                <i class="fas fa-check"></i> ${caract}
                            </span>
                        `).join('')}
                    </div>
                    
                    <div class="cancha-meta-info">
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${cancha.capacidad}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-bolt"></i>
                            <span class="estado ${cancha.estado}">${cancha.estado}</span>
                        </div>
                    </div>
                    
                    <div class="cancha-precio-profesional">
                        <span class="precio">${cancha.precio} Bs</span>
                        <span class="periodo">/ hora</span>
                    </div>
                    
                    <div class="cancha-actions">
                        <button class="btn-reservar-profesional" onclick="sistema.reservarCanchaDesdeCard(${cancha.id})">
                            <i class="fas fa-calendar-plus"></i>
                            Reservar Esta Cancha
                        </button>
                        <button class="btn-whatsapp-cancha" onclick="sistema.consultarCanchaWhatsApp(${cancha.id})">
                            <i class="fab fa-whatsapp"></i>
                            Consultar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filtrarCanchas(tipo) {
        const canchas = document.querySelectorAll('.cancha-card-profesional');
        
        canchas.forEach(cancha => {
            if (tipo === 'todas' || cancha.dataset.tipo === tipo) {
                cancha.style.display = 'block';
            } else {
                cancha.style.display = 'none';
            }
        });
    }

    reservarCanchaDesdeCard(canchaId) {
        this.seleccionarCanchaRapida(canchaId);
        
        // Scroll a la sección de reservas
        document.getElementById('reservas').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    consultarCanchaWhatsApp(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        const mensaje = `¡Hola! Estoy interesado en la *${cancha.nombre}*.\n\n• Precio: ${cancha.precio} Bs/hora\n• Tipo: ${cancha.tipo}\n• ${cancha.descripcion}\n\n¿Podrían darme más información?`;
        const url = `https://wa.me/${this.config.businessNumber}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(url, '_blank');
    }

    mostrarDetallesCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        const modalBody = document.getElementById('detallesCanchaBody');
        modalBody.innerHTML = `
            <div class="detalles-cancha-container">
                <div class="detalles-imagen">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" onerror="this.src='https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?w=600&h=400&fit=crop'">
                </div>
                <div class="detalles-info">
                    <div class="detalles-meta">
                        <span class="tipo-badge">${cancha.tipo}</span>
                        <span class="precio-badge">${cancha.precio} Bs/hora</span>
                        <span class="capacidad-badge">${cancha.capacidad}</span>
                    </div>
                    
                    <h3>${cancha.nombre}</h3>
                    <p class="detalles-descripcion">${cancha.descripcion}</p>
                    
                    <div class="detalles-caracteristicas">
                        <h4><i class="fas fa-star"></i> Características</h4>
                        <ul>
                            ${cancha.caracteristicas.map(caract => `
                                <li><i class="fas fa-check"></i> ${caract}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="detalles-acciones">
                        <button class="btn btn-primary" onclick="sistema.reservarCanchaDesdeCard(${cancha.id}); document.getElementById('detallesModal').style.display='none'">
                            <i class="fas fa-calendar-plus"></i> Reservar Esta Cancha
                        </button>
                        <button class="btn btn-secondary" onclick="sistema.consultarCanchaWhatsApp(${cancha.id})">
                            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detallesModal').style.display = 'block';
    }

    // ===== ESTADO EN TIEMPO REAL =====
    actualizarEstadoTiempoReal() {
        const estadoCanchas = document.getElementById('estadoCanchas');
        if (!estadoCanchas) return;

        // Simular estado (en un sistema real esto vendría de una base de datos)
        const estadoHTML = this.canchas.map(cancha => {
            const reservasHoy = Math.random() > 0.7 ? 1 : 0; // Simulación
            const estado = reservasHoy > 0 ? 'ocupado' : 'disponible';
            
            return `
                <div class="estado-cancha-item">
                    <div class="cancha-nombre">${cancha.nombre}</div>
                    <div class="estado ${estado}">${estado.toUpperCase()}</div>
                    <div class="reservas-hoy">${reservasHoy} reserva(s) hoy</div>
                </div>
            `;
        }).join('');

        estadoCanchas.innerHTML = estadoHTML;
    }

    // ===== FUNCIONES UTILITARIAS =====
    inicializarEventListeners() {
        // Filtros de canchas
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.tipo;
                this.filtrarCanchas(tipo);
                
                // Actualizar estado de botones
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Cerrar modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Menú hamburguesa
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Cerrar menú móvil
                    hamburger?.classList.remove('active');
                    navMenu?.classList.remove('active');
                }
            });
        });
    }

    inicializarComponentes() {
        this.generarHTMLCanchas();
        this.generarCanchasRapidas();
        this.actualizarEstadoTiempoReal();
    }

    verificarDisponibilidadHora(fecha, hora) {
        if (!this.reservaActual.cancha) return true;

        // Simulación de disponibilidad (en sistema real verificaría en base de datos)
        const reservasSimuladas = [
            { canchaId: 1, fecha: this.reservaActual.fecha, horaInicio: 16, horaFin: 18 },
            { canchaId: 2, fecha: this.reservaActual.fecha, horaInicio: 18, horaFin: 20 }
        ];

        const conflicto = reservasSimuladas.some(reserva => 
            reserva.canchaId === this.reservaActual.cancha.id &&
            reserva.fecha === fecha &&
            hora >= reserva.horaInicio && 
            hora < reserva.horaFin
        );

        return !conflicto;
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

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generarCodigoReserva() {
        return 'CR' + Date.now().toString(36).toUpperCase().substr(-6);
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${tipo === 'error' ? 'var(--error-color)' : tipo === 'success' ? 'var(--success-color)' : 'var(--info-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${tipo === 'error' ? 'exclamation-triangle' : tipo === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    abrirGoogleMaps() {
        const direccion = "Calle 9 de abril entre Ejercito y Murillo Dorado";
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
        window.open(url, '_blank');
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
let sistema;

document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaCanchaRanger();
    
    // Inicializar servicios
    if (typeof WhatsAppService !== 'undefined') {
        window.whatsappService = new WhatsAppService();
    }
});

// ===== FUNCIONES GLOBALES PARA HTML =====
function avanzarPasoSimple(paso) {
    sistema.avanzarPasoSimple(paso);
}

function retrocederPasoSimple(paso) {
    sistema.retrocederPasoSimple(paso);
}

function confirmarReservaWhatsApp() {
    sistema.confirmarReservaWhatsApp();
}

function abrirGoogleMaps() {
    sistema.abrirGoogleMaps();
}

// Agregar estilos CSS para las notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);