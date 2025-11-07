
// ===== SISTEMA CANCHA RANGER - VERSIÓN CORREGIDA Y COMPLETA =====

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
                imagen: "cancha1.jpg",
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
                imagen: "cancha2.jpg",
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
                imagen: "cancha3.jpg",
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
                imagen: "futsal1.jpg",
                descripcion: "Cancha sintetica de futsal ideal para torneos.",
                caracteristicas: ["Piso sintético", "Arcos profesionales", "Iluminación LED"],
                estado: "disponible", 
                capacidad: "10v10"
            }
        ];

        // Estado de reserva actual
        this.reservaActual = {
            cancha: null,
            fecha: null,
            horarios: [],
            datosCliente: null
        };

        // Calendario
        this.fechaActual = new Date();
        this.mesActual = this.fechaActual.getMonth();
        this.anoActual = this.fechaActual.getFullYear();

         // SISTEMA ADMIN - AGREGAR ESTO
    this.adminCredentials = {
        usuario: 'admin',
        password: 'CanchaRanger2025'
    };
    
    this.estadosReserva = {
        PENDIENTE: 'pendiente',
        CONFIRMADA: 'confirmada', 
        CANCELADA: 'cancelada'
    };

        this.init();
    }

   init() {
    console.log('🚀 Sistema Cancha Ranger Inicializado');
    this.inicializarFechas();
    this.inicializarEventListeners();
    this.inicializarComponentes();
    this.inicializarSistemaReservaSimple();
    // No necesitas llamar a inicializarSistemaAdmin() porque ya está en el constructor
}

    inicializarFechas() {
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        const pasadoManana = new Date(hoy);
        pasadoManana.setDate(pasadoManana.getDate() + 2);

        // Formatear fechas para mostrar
        if (document.getElementById('fechaHoy')) {
            document.getElementById('fechaHoy').textContent = hoy.getDate() + '/' + (hoy.getMonth() + 1);
        }
        if (document.getElementById('fechaManana')) {
            document.getElementById('fechaManana').textContent = manana.getDate() + '/' + (manana.getMonth() + 1);
        }
        if (document.getElementById('fechaPasadoManana')) {
            document.getElementById('fechaPasadoManana').textContent = pasadoManana.getDate() + '/' + (pasadoManana.getMonth() + 1);
        }
        
        // Nombre del día para pasado mañana
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        if (document.getElementById('diaPasadoManana')) {
            document.getElementById('diaPasadoManana').textContent = dias[pasadoManana.getDay()].substring(0, 3);
        }
    }

    inicializarEventListeners() {
        // Filtros de canchas
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = e.target.dataset.tipo;
                this.filtrarCanchas(tipo);
                
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
        
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                if (navMenu) navMenu.classList.toggle('active');
            });
        }

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
                    
                    if (hamburger) hamburger.classList.remove('active');
                    if (navMenu) navMenu.classList.remove('active');
                }
            });
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header-profesional');
            if (window.scrollY > 100) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }

    inicializarComponentes() {
        this.generarHTMLCanchas();
        this.generarCanchasRapidas();
        this.actualizarEstadoTiempoReal();
        this.inicializarCalendario();
    }

    // ===== CALENDARIO INTERACTIVO =====
    inicializarCalendario() {
        this.actualizarCalendario();
        
        const btnMesAnterior = document.getElementById('btnMesAnterior');
        const btnMesSiguiente = document.getElementById('btnMesSiguiente');

        if (btnMesAnterior) {
            btnMesAnterior.addEventListener('click', () => {
                this.mesActual--;
                if (this.mesActual < 0) {
                    this.mesActual = 11;
                    this.anoActual--;
                }
                this.actualizarCalendario();
            });
        }

        if (btnMesSiguiente) {
            btnMesSiguiente.addEventListener('click', () => {
                this.mesActual++;
                if (this.mesActual > 11) {
                    this.mesActual = 0;
                    this.anoActual++;
                }
                this.actualizarCalendario();
            });
        }
    }

    actualizarCalendario() {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        const mesActualElement = document.getElementById('mesActual');
        if (mesActualElement) {
            mesActualElement.textContent = `${meses[this.mesActual]} ${this.anoActual}`;
        }
        
        const calendarioDias = document.getElementById('calendarioDias');
        if (!calendarioDias) return;

        const primerDia = new Date(this.anoActual, this.mesActual, 1);
        const ultimoDia = new Date(this.anoActual, this.mesActual + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const primerDiaSemana = primerDia.getDay();
        
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
        this.reservaActual.horarios = [];
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
        
        const fechaInfo = document.getElementById('fechaSeleccionadaInfo');
        if (fechaInfo) {
            fechaInfo.textContent = this.formatearFechaLegible(this.reservaActual.fecha);
        }
        
        this.actualizarResumenHorarios();
    }

    toggleHorario(hora) {
        const index = this.reservaActual.horarios.indexOf(hora);
        
        if (index === -1) {
            this.reservaActual.horarios.push(hora);
            this.reservaActual.horarios.sort((a, b) => a - b);
        } else {
            this.reservaActual.horarios.splice(index, 1);
        }
        
        this.inicializarHorariosMultiples();
        this.mostrarNotificacion(`⏰ ${hora}:00 ${index === -1 ? 'agregado' : 'removido'}`, 'success');
    }

    esHorarioConsecutivo(hora) {
        if (!this.reservaActual.horarios.includes(hora)) return false;
        
        const horarios = this.reservaActual.horarios;
        const index = horarios.indexOf(hora);
        
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

   // Método auxiliar para agrupar horarios
agruparHorariosConsecutivos(horarios = null) {
    const horariosAUsar = horarios || this.reservaActual.horarios || [];
    const horariosOrdenados = [...horariosAUsar].sort((a, b) => a - b);
    const grupos = [];
    let grupoActual = [];
    
    horariosOrdenados.forEach((hora, index) => {
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

  avanzarPasoSimple(paso) {
    console.log(`🔄 Avanzando al paso ${paso}`);
    
    // Validación para paso 2
    if (paso === 2) {
        if (!this.reservaActual.cancha || !this.reservaActual.fecha) {
            this.mostrarNotificacion('❌ Selecciona cancha y fecha primero', 'error');
            return;
        }
    }
    
    // Validación para paso 3
    if (paso === 3) {
        if (this.reservaActual.horarios.length === 0) {
            this.mostrarNotificacion('❌ Selecciona al menos un horario', 'error');
            return;
        }
    }

    // Ocultar todos los pasos y mostrar el actual
    document.querySelectorAll('.reserva-paso-simple').forEach(p => {
        p.classList.remove('active');
    });
    
    const pasoActual = document.getElementById(`pasoSimple${paso}`);
    if (pasoActual) {
        pasoActual.classList.add('active');
        
        if (paso === 2) {
            this.inicializarHorariosMultiples();
        } else if (paso === 3) {
            this.actualizarResumenFinal();
        }
    }
}

    retrocederPasoSimple(paso) {
    console.log(`🔙 Retrocediendo al paso ${paso}`);
    
    // Ocultar todos los pasos
    document.querySelectorAll('.reserva-paso-simple').forEach(pasoElement => {
        pasoElement.classList.remove('active');
    });
    
    // Mostrar el paso anterior
    const pasoAnterior = document.getElementById(`pasoSimple${paso}`);
    if (pasoAnterior) {
        pasoAnterior.classList.add('active');
        
        // Ejecutar acciones específicas del paso
        if (paso === 2) {
            this.inicializarHorariosMultiples();
        }
        
        console.log(`✅ Retrocedido al paso ${paso} correctamente`);
    } else {
        console.error(`❌ No se encontró el paso ${paso} para retroceder`);
    }
}

    validarPaso1() {
        return this.reservaActual.cancha && this.reservaActual.fecha;
    }

    validarDatosCliente() {
    // Buscar inputs en el DOM
    const nombreInput = document.getElementById('nombreSimple');
    const telefonoInput = document.getElementById('telefonoSimple');
    const emailInput = document.getElementById('emailSimple');
    const notasInput = document.getElementById('notasSimple');

    if (!nombreInput || !telefonoInput) {
        console.error('❌ No se encontraron los campos del formulario');
        return false;
    }

    const nombre = nombreInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : '';
    const notas = notasInput ? notasInput.value.trim() : '';

    if (!nombre || !telefono) {
        this.mostrarNotificacion('❌ Nombre y teléfono son obligatorios', 'error');
        return false;
    }

    if (telefono.length < 8) {
        this.mostrarNotificacion('❌ El teléfono debe tener al menos 8 dígitos', 'error');
        return false;
    }

    // Guardar datos en reserva actual
    this.reservaActual.datosCliente = {
        nombre,
        telefono,
        email,
        notas
    };

    return true;
}

    actualizarResumenFinal() {
    const contenedor = document.getElementById('resumenFinal');
    if (!contenedor) {
        console.error('❌ No se encontró el contenedor del resumen final');
        return;
    }

    // Verificar que tengamos los datos necesarios
    if (!this.reservaActual.cancha || !this.reservaActual.fecha || this.reservaActual.horarios.length === 0) {
        contenedor.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Faltan datos necesarios para la reserva
            </div>
        `;
        return;
    }

    const horariosAgrupados = this.agruparHorariosConsecutivos();
    const total = horariosAgrupados.reduce((sum, grupo) => {
        return sum + (grupo.length * this.reservaActual.cancha.precio);
    }, 0);

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
        <div class="resumen-item resumen-total">
            <strong>Total a pagar:</strong>
            <span>${total} Bs</span>
        </div>
        <div class="confirmacion-info">
            <i class="fas fa-info-circle"></i>
            Completa tus datos arriba y confirma la reserva
        </div>
    `;
    
    console.log('✅ Resumen final actualizado');
}

    async confirmarReservaWhatsApp() {
    try {
        console.log('🔄 Iniciando confirmación de reserva...');
        
        // Validar datos del cliente
        if (!this.validarDatosCliente()) {
            this.mostrarNotificacion('❌ Completa correctamente tus datos', 'error');
            return;
        }

        if (this.reservaActual.horarios.length === 0) {
            this.mostrarNotificacion('❌ Selecciona al menos un horario', 'error');
            return;
        }

        // Generar reserva completa
        const reserva = this.generarReservaCompleta();
        
        // Mostrar confirmación al usuario
        this.mostrarConfirmacionReserva(reserva);
        
        // ENVIAR AL DUEÑO - PARTE CRÍTICA
        await this.enviarReservaAlDueño(reserva);
        
    } catch (error) {
        console.error('❌ Error en confirmación de reserva:', error);
        this.mostrarNotificacion('❌ Error al procesar la reserva', 'error');
    }
}

    enviarReservaWhatsApp(reserva) {
        const mensaje = this.generarMensajeWhatsApp(reserva);
        const url = `https://wa.me/${this.config.adminNumber}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(url, '_blank');
        this.mostrarConfirmacionReserva(reserva);
        
        setTimeout(() => {
            this.reiniciarSistemaReserva();
        }, 2000);
    }

    // ===== GENERAR RESERVA COMPLETA =====
// ===== GENERAR RESERVA COMPLETA - VERSIÓN MEJORADA =====
generarReservaCompleta() {
    const horariosAgrupados = this.agruparHorariosConsecutivos();
    const total = horariosAgrupados.reduce((sum, grupo) => {
        return sum + (grupo.length * this.reservaActual.cancha.precio);
    }, 0);

    return {
        id: this.generarId(),
        canchaId: this.reservaActual.cancha.id,
        canchaNombre: this.reservaActual.cancha.nombre,
        fecha: this.reservaActual.fecha,
        horarios: horariosAgrupados,
        usuario: this.reservaActual.datosCliente || {},
        total: total,
        codigoReserva: this.generarCodigoReserva(),
        estado: 'pendiente', // Estado por defecto
        timestamp: new Date().toISOString()
    };
}

// ===== ENVIAR RESERVA AL DUEÑO - MÉTODO PRINCIPAL =====
async enviarReservaAlDueño(reserva) {
    try {
        console.log('📤 Enviando reserva al dueño...', reserva);
        
        // Verificar que el servicio WhatsApp esté disponible
        if (!window.whatsappService) {
            throw new Error('Servicio de WhatsApp no disponible');
        }

        // Enviar reserva al dueño/propietario
        const resultado = await window.whatsappService.enviarReservaPropietario(reserva);
        
        if (resultado) {
            console.log('✅ Reserva enviada exitosamente al dueño');
            // Guardar en localStorage
            this.guardarReservaEnHistorial(reserva);
            
            // Reiniciar sistema después de 3 segundos
            setTimeout(() => {
                this.reiniciarSistemaReserva();
            }, 3000);
        } else {
            throw new Error('No se pudo enviar la reserva al dueño');
        }
        
    } catch (error) {
        console.error('❌ Error enviando reserva al dueño:', error);
        throw error;
    }
}

// ===== GUARDAR EN HISTORIAL =====
// ===== GUARDAR EN HISTORIAL - VERSIÓN MEJORADA =====
guardarReservaEnHistorial(reserva) {
    try {
        // Asegurar que la reserva tenga todos los campos necesarios
        const reservaCompleta = {
            id: reserva.id || this.generarId(),
            canchaId: reserva.canchaId,
            canchaNombre: reserva.canchaNombre,
            fecha: reserva.fecha,
            horarios: reserva.horarios || [],
            usuario: reserva.usuario || {},
            total: reserva.total || 0,
            codigoReserva: reserva.codigoReserva || this.generarCodigoReserva(),
            estado: reserva.estado || 'pendiente',
            timestamp: reserva.timestamp || new Date().toISOString()
        };

        const historial = JSON.parse(localStorage.getItem('canchaRanger_reservas') || '[]');
        historial.push(reservaCompleta);
        localStorage.setItem('canchaRanger_reservas', JSON.stringify(historial));
        
        console.log('💾 Reserva guardada en historial:', reservaCompleta);
        return true;
        
    } catch (error) {
        console.error('❌ Error guardando en historial:', error);
        return false;
    }
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
        if (!modalBody) return;
        
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
        
        document.querySelectorAll('.cancha-rapida-btn').forEach(btn => {
            btn.classList.remove('seleccionada');
        });
        
        document.getElementById('nombreSimple').value = '';
        document.getElementById('telefonoSimple').value = '';
        document.getElementById('emailSimple').value = '';
        document.getElementById('notasSimple').value = '';
        
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
        if (!modalBody) return;

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

        const estadoHTML = this.canchas.map(cancha => {
            const reservasHoy = Math.random() > 0.7 ? 1 : 0;
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
    verificarDisponibilidadHora(fecha, hora) {
        if (!this.reservaActual.cancha) return true;

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


// ===== SISTEMA DE ADMINISTRACIÓN =====
inicializarSistemaAdmin() {
    // Credenciales del administrador
    this.adminCredentials = {
        usuario: 'admin',
        password: 'CanchaRanger2025'
    };
    
    // Estados de reserva
    this.estadosReserva = {
        PENDIENTE: 'pendiente',
        CONFIRMADA: 'confirmada', 
        CANCELADA: 'cancelada'
    };
}

// Mostrar modal de login admin
mostrarLoginAdmin() {
    document.getElementById('loginAdminModal').style.display = 'block';
}

// Acceder al panel admin
accederPanelAdmin() {
    const usuario = document.getElementById('adminUsuario').value;
    const password = document.getElementById('adminPassword').value;
    
    if (usuario === this.adminCredentials.usuario && password === this.adminCredentials.password) {
        document.getElementById('loginAdminModal').style.display = 'none';
        this.mostrarPanelAdmin();
        this.mostrarNotificacion('✅ Acceso concedido al panel de administración', 'success');
    } else {
        this.mostrarNotificacion('❌ Usuario o contraseña incorrectos', 'error');
    }
}

// Mostrar panel de administración
mostrarPanelAdmin() {
    this.actualizarEstadisticasAdmin();
    this.cargarReservasAdmin();
    document.getElementById('panelAdmin').style.display = 'block';
}

// Actualizar estadísticas
actualizarEstadisticasAdmin() {
    const reservas = this.obtenerTodasLasReservas();
    const hoy = new Date().toISOString().split('T')[0];
    
    const totalReservas = reservas.length;
    const reservasHoy = reservas.filter(r => r.fecha === hoy).length;
    const ingresosTotales = reservas.reduce((sum, r) => sum + r.total, 0);
    
    document.getElementById('totalReservas').textContent = totalReservas;
    document.getElementById('reservasHoy').textContent = reservasHoy;
    document.getElementById('ingresosTotales').textContent = ingresosTotales + ' Bs';
}

// Cargar todas las reservas
// Cargar todas las reservas - VERSIÓN CORREGIDA
// Cargar todas las reservas - VERSIÓN COMPLETAMENTE CORREGIDA
cargarReservasAdmin(filtroEstado = 'todas', filtroFecha = '') {
    try {
        const reservas = this.obtenerTodasLasReservas();
        const listaReservas = document.getElementById('listaReservas');
        
        console.log('📊 Reservas encontradas:', reservas);

        // Si no hay reservas
        if (!reservas || reservas.length === 0) {
            listaReservas.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No hay reservas en el sistema</p>
                    <small>Crea algunas reservas desde el formulario principal</small>
                </div>
            `;
            return;
        }

        // Aplicar filtros
        let reservasFiltradas = reservas.filter(reserva => {
            if (!reserva) return false;
            
            // Filtrar por estado
            if (filtroEstado !== 'todas') {
                const estadoReserva = reserva.estado || 'pendiente';
                if (estadoReserva !== filtroEstado) return false;
            }
            
            // Filtrar por fecha
            if (filtroFecha && reserva.fecha !== filtroFecha) {
                return false;
            }
            
            return true;
        });

        // Ordenar por fecha más reciente
        reservasFiltradas.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp) : new Date(0);
            const timeB = b.timestamp ? new Date(b.timestamp) : new Date(0);
            return timeB - timeA;
        });

        if (reservasFiltradas.length === 0) {
            listaReservas.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>No hay reservas que coincidan con los filtros</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        reservasFiltradas.forEach(reserva => {
            if (!reserva) return;
            
            // CORRECCIÓN: Manejo seguro de horarios
            const horarios = reserva.horarios || [];
            let horariosTexto = 'Horarios no disponibles';
            
            if (horarios.length > 0 && Array.isArray(horarios[0])) {
                // Formato nuevo (array de arrays)
                horariosTexto = horarios.map(grupo => {
                    if (Array.isArray(grupo) && grupo.length > 0) {
                        return `${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${grupo.length}h)`;
                    }
                    return 'Horario inválido';
                }).join(', ');
            } else if (horarios.length > 0) {
                // Formato antiguo (array de números)
                const grupos = this.agruparHorariosConsecutivos(horarios);
                horariosTexto = grupos.map(grupo => 
                    `${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${grupo.length}h)`
                ).join(', ');
            }
            
            const estado = reserva.estado || 'pendiente';
            const total = reserva.total || 0;
            const usuario = reserva.usuario || { nombre: 'No disponible', telefono: 'No disponible' };
            const canchaNombre = reserva.canchaNombre || 'Cancha no especificada';
            const codigoReserva = reserva.codigoReserva || 'Sin código';
            const fechaReserva = reserva.fecha ? this.formatearFechaLegible(reserva.fecha) : 'No especificada';
            const timestamp = reserva.timestamp ? new Date(reserva.timestamp).toLocaleString('es-ES') : 'Fecha no disponible';
            
            html += `
                <div class="reserva-item">
                    <div class="reserva-header">
                        <div>
                            <span class="reserva-codigo">${codigoReserva}</span>
                            <span class="reserva-estado estado-${estado}">
                                ${estado.toUpperCase()}
                            </span>
                        </div>
                        <small>${timestamp}</small>
                    </div>
                    
                    <div class="reserva-info">
                        <div class="reserva-info-item">
                            <span class="reserva-label">Cancha</span>
                            <span class="reserva-value">${canchaNombre}</span>
                        </div>
                        <div class="reserva-info-item">
                            <span class="reserva-label">Fecha</span>
                            <span class="reserva-value">${fechaReserva}</span>
                        </div>
                        <div class="reserva-info-item">
                            <span class="reserva-label">Horarios</span>
                            <span class="reserva-value">${horariosTexto}</span>
                        </div>
                        <div class="reserva-info-item">
                            <span class="reserva-label">Cliente</span>
                            <span class="reserva-value">${usuario.nombre}</span>
                        </div>
                        <div class="reserva-info-item">
                            <span class="reserva-label">Teléfono</span>
                            <span class="reserva-value">${usuario.telefono}</span>
                        </div>
                        <div class="reserva-info-item">
                            <span class="reserva-label">Total</span>
                            <span class="reserva-value">${total} Bs</span>
                        </div>
                    </div>
                    
                    <div class="reserva-actions">
                        ${estado !== 'confirmada' ? `
                            <button class="btn btn-success btn-sm" onclick="sistema.confirmarReservaAdmin('${reserva.id}')">
                                <i class="fas fa-check"></i> Confirmar
                            </button>
                        ` : ''}
                        
                        ${estado !== 'cancelada' ? `
                            <button class="btn btn-error btn-sm" onclick="sistema.cancelarReservaAdmin('${reserva.id}')">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        ` : ''}
                        
                        ${usuario.telefono && usuario.telefono !== 'No disponible' ? `
                            <button class="btn btn-secondary btn-sm" onclick="sistema.llamarCliente('${usuario.telefono}')">
                                <i class="fas fa-phone"></i> Llamar
                            </button>
                        ` : ''}
                        
                        <button class="btn btn-error btn-sm" onclick="sistema.eliminarReservaAdmin('${reserva.id}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            `;
        });
        
        listaReservas.innerHTML = html;
        console.log('✅ Reservas cargadas correctamente:', reservasFiltradas.length);
        
    } catch (error) {
        console.error('❌ Error crítico en cargarReservasAdmin:', error);
        const listaReservas = document.getElementById('listaReservas');
        listaReservas.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                Error al cargar las reservas: ${error.message}
            </div>
        `;
    }
}

// Obtener todas las reservas
obtenerTodasLasReservas() {
    try {
        return JSON.parse(localStorage.getItem('canchaRanger_reservas') || '[]');
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
}

// Confirmar reserva
confirmarReservaAdmin(reservaId) {
    const reservas = this.obtenerTodasLasReservas();
    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
    
    if (reservaIndex !== -1) {
        reservas[reservaIndex].estado = 'confirmada';
        localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservas));
        
        this.mostrarNotificacion('✅ Reserva confirmada exitosamente', 'success');
        this.cargarReservasAdmin();
        this.actualizarEstadisticasAdmin();
        
        // Aquí podrías enviar WhatsApp de confirmación al cliente
    }
}

// Cancelar reserva  
cancelarReservaAdmin(reservaId) {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;
    
    const reservas = this.obtenerTodasLasReservas();
    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
    
    if (reservaIndex !== -1) {
        reservas[reservaIndex].estado = 'cancelada';
        localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservas));
        
        this.mostrarNotificacion('✅ Reserva cancelada exitosamente', 'success');
        this.cargarReservasAdmin();
        this.actualizarEstadisticasAdmin();
    }
}

// Eliminar reserva
eliminarReservaAdmin(reservaId) {
    if (!confirm('¿Estás seguro de que quieres ELIMINAR permanentemente esta reserva?')) return;
    
    const reservas = this.obtenerTodasLasReservas();
    const reservasFiltradas = reservas.filter(r => r.id !== reservaId);
    
    localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservasFiltradas));
    
    this.mostrarNotificacion('✅ Reserva eliminada exitosamente', 'success');
    this.cargarReservasAdmin();
    this.actualizarEstadisticasAdmin();
}

// Llamar al cliente
llamarCliente(telefono) {
    window.open(`tel:${telefono}`, '_self');
}

// Exportar reservas
exportarReservas() {
    const reservas = this.obtenerTodasLasReservas();
    const csv = this.convertirReservasACSV(reservas);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-cancha-ranger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    this.mostrarNotificacion('📊 Reservas exportadas exitosamente', 'success');
}

// Convertir a CSV
convertirReservasACSV(reservas) {
    const headers = ['Código', 'Cancha', 'Fecha', 'Horarios', 'Cliente', 'Teléfono', 'Total', 'Estado', 'Fecha Solicitud'];
    const rows = reservas.map(reserva => [
        reserva.codigoReserva,
        reserva.canchaNombre,
        reserva.fecha,
        reserva.horarios.map(g => `${g[0]}:00-${g[g.length-1]+1}:00`).join(';'),
        reserva.usuario.nombre,
        reserva.usuario.telefono,
        reserva.total + ' Bs',
        reserva.estado || 'pendiente',
        new Date(reserva.timestamp).toLocaleString('es-ES')
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}




// ===== SISTEMA DE ADMINISTRACIÓN =====

// Mostrar modal de login admin
mostrarLoginAdmin() {
    document.getElementById('loginAdminModal').style.display = 'block';
}

// Acceder al panel admin
accederPanelAdmin() {
    const usuario = document.getElementById('adminUsuario').value;
    const password = document.getElementById('adminPassword').value;
    
    if (usuario === this.adminCredentials.usuario && password === this.adminCredentials.password) {
        document.getElementById('loginAdminModal').style.display = 'none';
        this.mostrarPanelAdmin();
        this.mostrarNotificacion('✅ Acceso concedido al panel de administración', 'success');
    } else {
        this.mostrarNotificacion('❌ Usuario o contraseña incorrectos', 'error');
    }
}

// Mostrar panel de administración
mostrarPanelAdmin() {
    this.actualizarEstadisticasAdmin();
    this.cargarReservasAdmin();
    document.getElementById('panelAdmin').style.display = 'block';
}

// Actualizar estadísticas
actualizarEstadisticasAdmin() {
    const reservas = this.obtenerTodasLasReservas();
    const hoy = new Date().toISOString().split('T')[0];
    
    const totalReservas = reservas.length;
    const reservasHoy = reservas.filter(r => r.fecha === hoy).length;
    const ingresosTotales = reservas.reduce((sum, r) => sum + (r.total || 0), 0);
    
    document.getElementById('totalReservas').textContent = totalReservas;
    document.getElementById('reservasHoy').textContent = reservasHoy;
    document.getElementById('ingresosTotales').textContent = ingresosTotales + ' Bs';
}

// Cargar todas las reservas
cargarReservasAdmin(filtroEstado = 'todas', filtroFecha = '') {
    const reservas = this.obtenerTodasLasReservas();
    const listaReservas = document.getElementById('listaReservas');
    
    // Aplicar filtros
    let reservasFiltradas = reservas;
    
    if (filtroEstado !== 'todas') {
        reservasFiltradas = reservasFiltradas.filter(r => (r.estado || 'pendiente') === filtroEstado);
    }
    
    if (filtroFecha) {
        reservasFiltradas = reservasFiltradas.filter(r => r.fecha === filtroFecha);
    }
    
    // Ordenar por fecha más reciente
    reservasFiltradas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (reservasFiltradas.length === 0) {
        listaReservas.innerHTML = `
            <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No hay reservas que coincidan con los filtros</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    reservasFiltradas.forEach(reserva => {
        const horariosTexto = reserva.horarios.map(grupo => 
            `${grupo[0]}:00 - ${grupo[grupo.length - 1] + 1}:00 (${grupo.length}h)`
        ).join(', ');
        
        const estado = reserva.estado || 'pendiente';
        
        html += `
            <div class="reserva-item">
                <div class="reserva-header">
                    <div>
                        <span class="reserva-codigo">${reserva.codigoReserva}</span>
                        <span class="reserva-estado estado-${estado}">
                            ${estado.toUpperCase()}
                        </span>
                    </div>
                    <small>${new Date(reserva.timestamp).toLocaleString('es-ES')}</small>
                </div>
                
                <div class="reserva-info">
                    <div class="reserva-info-item">
                        <span class="reserva-label">Cancha</span>
                        <span class="reserva-value">${reserva.canchaNombre}</span>
                    </div>
                    <div class="reserva-info-item">
                        <span class="reserva-label">Fecha</span>
                        <span class="reserva-value">${this.formatearFechaLegible(reserva.fecha)}</span>
                    </div>
                    <div class="reserva-info-item">
                        <span class="reserva-label">Horarios</span>
                        <span class="reserva-value">${horariosTexto}</span>
                    </div>
                    <div class="reserva-info-item">
                        <span class="reserva-label">Cliente</span>
                        <span class="reserva-value">${reserva.usuario.nombre}</span>
                    </div>
                    <div class="reserva-info-item">
                        <span class="reserva-label">Teléfono</span>
                        <span class="reserva-value">${reserva.usuario.telefono}</span>
                    </div>
                    <div class="reserva-info-item">
                        <span class="reserva-label">Total</span>
                        <span class="reserva-value">${reserva.total} Bs</span>
                    </div>
                </div>
                
                <div class="reserva-actions">
                    ${estado !== 'confirmada' ? `
                        <button class="btn btn-success btn-sm" onclick="sistema.confirmarReservaAdmin('${reserva.id}')">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                    ` : ''}
                    
                    ${estado !== 'cancelada' ? `
                        <button class="btn btn-error btn-sm" onclick="sistema.cancelarReservaAdmin('${reserva.id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-secondary btn-sm" onclick="sistema.llamarCliente('${reserva.usuario.telefono}')">
                        <i class="fas fa-phone"></i> Llamar
                    </button>
                    
                    <button class="btn btn-error btn-sm" onclick="sistema.eliminarReservaAdmin('${reserva.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    listaReservas.innerHTML = html;
}

// Obtener todas las reservas
obtenerTodasLasReservas() {
    try {
        return JSON.parse(localStorage.getItem('canchaRanger_reservas') || '[]');
    } catch (error) {
        console.error('Error obteniendo reservas:', error);
        return [];
    }
}

// Confirmar reserva
confirmarReservaAdmin(reservaId) {
    const reservas = this.obtenerTodasLasReservas();
    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
    
    if (reservaIndex !== -1) {
        reservas[reservaIndex].estado = 'confirmada';
        localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservas));
        
        this.mostrarNotificacion('✅ Reserva confirmada exitosamente', 'success');
        this.cargarReservasAdmin();
        this.actualizarEstadisticasAdmin();
    }
}

// Cancelar reserva  
cancelarReservaAdmin(reservaId) {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;
    
    const reservas = this.obtenerTodasLasReservas();
    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
    
    if (reservaIndex !== -1) {
        reservas[reservaIndex].estado = 'cancelada';
        localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservas));
        
        this.mostrarNotificacion('✅ Reserva cancelada exitosamente', 'success');
        this.cargarReservasAdmin();
        this.actualizarEstadisticasAdmin();
    }
}

// Eliminar reserva
eliminarReservaAdmin(reservaId) {
    if (!confirm('¿Estás seguro de que quieres ELIMINAR permanentemente esta reserva?')) return;
    
    const reservas = this.obtenerTodasLasReservas();
    const reservasFiltradas = reservas.filter(r => r.id !== reservaId);
    
    localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservasFiltradas));
    
    this.mostrarNotificacion('✅ Reserva eliminada exitosamente', 'success');
    this.cargarReservasAdmin();
    this.actualizarEstadisticasAdmin();
}

// Llamar al cliente
llamarCliente(telefono) {
    window.open(`tel:${telefono}`, '_self');
}

// Exportar reservas
exportarReservas() {
    const reservas = this.obtenerTodasLasReservas();
    const csv = this.convertirReservasACSV(reservas);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-cancha-ranger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    this.mostrarNotificacion('📊 Reservas exportadas exitosamente', 'success');
}

// Convertir a CSV
convertirReservasACSV(reservas) {
    const headers = ['Código', 'Cancha', 'Fecha', 'Horarios', 'Cliente', 'Teléfono', 'Total', 'Estado', 'Fecha Solicitud'];
    const rows = reservas.map(reserva => [
        reserva.codigoReserva,
        reserva.canchaNombre,
        reserva.fecha,
        reserva.horarios.map(g => `${g[0]}:00-${g[g.length-1]+1}:00`).join(';'),
        reserva.usuario.nombre,
        reserva.usuario.telefono,
        reserva.total + ' Bs',
        reserva.estado || 'pendiente',
        new Date(reserva.timestamp).toLocaleString('es-ES')
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Limpiar reservas antiguas
limpiarReservasAntiguas() {
    if (!confirm('¿Eliminar reservas de hace más de 30 días? Esta acción no se puede deshacer.')) return;
    
    const reservas = this.obtenerTodasLasReservas();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    
    const reservasActualizadas = reservas.filter(reserva => {
        const fechaReserva = new Date(reserva.timestamp);
        return fechaReserva > fechaLimite;
    });
    
    localStorage.setItem('canchaRanger_reservas', JSON.stringify(reservasActualizadas));
    
    this.mostrarNotificacion('🧹 Reservas antiguas eliminadas', 'success');
    this.cargarReservasAdmin();
    this.actualizarEstadisticasAdmin();
}

}


// ===== FUNCIONES GLOBALES PARA HTML =====
function avanzarPasoSimple(paso) {
    if (sistema) sistema.avanzarPasoSimple(paso);
}

function retrocederPasoSimple(paso) {
    if (sistema) sistema.retrocederPasoSimple(paso);
}

function confirmarReservaWhatsApp() {
    if (sistema) sistema.confirmarReservaWhatsApp();
}

function abrirGoogleMaps() {
    if (sistema) sistema.abrirGoogleMaps();
}

// ===== FUNCIONES GLOBALES ADMIN =====
function mostrarLoginAdmin() {
    if (sistema) sistema.mostrarLoginAdmin();
}

function accederPanelAdmin() {
    if (sistema) sistema.accederPanelAdmin();
}

function filtrarReservas() {
    if (sistema) {
        const estado = document.getElementById('filtroEstado').value;
        const fecha = document.getElementById('filtroFecha').value;
        sistema.cargarReservasAdmin(estado, fecha);
    }
}

function exportarReservas() {
    if (sistema) sistema.exportarReservas();
}

function limpiarReservasAntiguas() {
    if (sistema) sistema.limpiarReservasAntiguas();
}


// ===== INICIALIZACIÓN GLOBAL =====
let sistema;

document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaCanchaRanger();
    
    if (typeof WhatsAppService !== 'undefined') {
        window.whatsappService = new WhatsAppService();
        window.whatsappService.init();
    }
});

// ===== FUNCIONES GLOBALES PARA HTML =====
function avanzarPasoSimple(paso) {
    if (sistema) sistema.avanzarPasoSimple(paso);
}

function retrocederPasoSimple(paso) {
    if (sistema) sistema.retrocederPasoSimple(paso);
}

function confirmarReservaWhatsApp() {
    if (sistema) sistema.confirmarReservaWhatsApp();
}

function abrirGoogleMaps() {
    if (sistema) sistema.abrirGoogleMaps();
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

// ===== FUNCIONES GLOBALES ADMIN =====
function mostrarLoginAdmin() {
    if (sistema) sistema.mostrarLoginAdmin();
}

function accederPanelAdmin() {
    if (sistema) sistema.accederPanelAdmin();
}

function filtrarReservas() {
    if (sistema) {
        const estado = document.getElementById('filtroEstado').value;
        const fecha = document.getElementById('filtroFecha').value;
        sistema.cargarReservasAdmin(estado, fecha);
    }
}

function exportarReservas() {
    if (sistema) sistema.exportarReservas();
}