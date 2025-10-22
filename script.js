// ===== SISTEMA PROFESIONAL CANCHA RANGER - VERSIÓN MEJORADA Y RESPONSIVA =====

class SistemaCanchaRanger {
    constructor() {
        this.config = {
            horarioApertura: 14,
            horarioCierre: 22,
            precioWally: 20,
            precioFutsal: 25,
            tiempoMinimoReserva: 1,
            tiempoCancelacion: 12, // 12 horas para modificar/cancelar
            adminCredentials: {
                usuario: 'admin',
                password: 'CanchaRanger2025!'
            }
        };

        this.canchas = [
            {
                id: 1,
                nombre: "Cancha 1 Wally",
                tipo: "Voleibol",
                precio: this.config.precioWally,
                imagen: "cancha1.jpg",
                descripcion: "Cancha profesional de voleibol con medidas oficiales.",
                caracteristicas: [],
                estado: "disponible",
                capacidad: "6v6"
            },
            {
                id: 2,
                nombre: "Cancha 2 Wally",
                tipo: "Voleibol",
                precio: this.config.precioWally,
                imagen: "cancha2.jpg",
                descripcion: "Cancha de voleibol con iluminación profesional.",
                caracteristicas: [],
                estado: "disponible",
                capacidad: "6v6"
            },
            {
                id: 3,
                nombre: "Cancha 3 Wally",
                tipo: "Voleibol",
                precio: this.config.precioWally,
                imagen: "cancha3.jpg",
                descripcion: "Cancha competitiva de voleibol ideal para torneos y partidos.",
                caracteristicas: [],
                estado: "disponible",
                capacidad: "6v6"
            },
            
              {
                id: 3,
                nombre: "Cancha 4 Futsal",
                tipo: "Futsal",
                precio: this.config.precioFutsal,
                imagen: "futsal.jpg",
                descripcion: "Cancha sintetica de futsal ideal para torneos.",
                caracteristicas: [],
                estado: "disponible",
                capacidad: "10v10"
            },

        ];

        this.state = {
            reservas: this.cargarDatos('reservas') || [],
            usuarios: this.cargarDatos('usuarios') || [],
            usuarioActual: this.cargarDatos('usuarioActual') || null,
            canchaSeleccionada: null,
            fechaSeleccionada: null,
            horaInicioSeleccionada: null,
            horaFinSeleccionada: null,
            mesActual: new Date().getMonth(),
            añoActual: new Date().getFullYear(),
            filtroHorario: 'today',
            isLoading: false,
            reservaEditando: null // Para modificación de reservas
        };

        // Inicializar servicio de email
        this.emailService = new EmailService();

        this.init();
    }

    // ===== INICIALIZACIÓN =====
    init() {
        this.inicializarDatos();
        this.inicializarEventListeners();
        this.inicializarComponentes();
        this.actualizarInterfaz();
        this.iniciarActualizacionTiempoReal();
        
        console.log('🚀 Sistema Cancha Ranger inicializado correctamente');
    }

    inicializarDatos() {
        if (this.state.reservas.length === 0) {
            this.crearDatosEjemplo();
        }
    }

    crearDatosEjemplo() {
        const hoy = new Date();
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);

        const reservasEjemplo = [
            {
                id: this.generarId(),
                canchaId: 1,
                fecha: this.formatearFechaISO(hoy),
                horaInicio: 16,
                horaFin: 18,
                usuario: {
                    nombre: "Juan Pérez",
                    email: "juan@ejemplo.com",
                    telefono: "73811600"
                },
                estado: "confirmada",
                total: 40,
                timestamp: new Date().toISOString(),
                codigoReserva: this.generarCodigoReserva(),
                pagado: true
            },
            {
                id: this.generarId(),
                canchaId: 2,
                fecha: this.formatearFechaISO(manana),
                horaInicio: 18,
                horaFin: 20,
                usuario: {
                    nombre: "María García",
                    email: "maria@ejemplo.com",
                    telefono: "73220922"
                },
                estado: "confirmada",
                total: 40,
                timestamp: new Date().toISOString(),
                codigoReserva: this.generarCodigoReserva(),
                pagado: false
            }
        ];

        this.state.reservas = reservasEjemplo;
        this.guardarDatos('reservas', this.state.reservas);
    }

    // ===== GESTIÓN DE DATOS =====
    cargarDatos(clave) {
        try {
            const datos = localStorage.getItem(`canchaRanger_${clave}`);
            return datos ? JSON.parse(datos) : null;
        } catch (error) {
            console.error(`Error cargando ${clave}:`, error);
            return null;
        }
    }

    guardarDatos(clave, datos) {
        try {
            localStorage.setItem(`canchaRanger_${clave}`, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error(`Error guardando ${clave}:`, error);
            this.mostrarNotificacion('Error guardando datos', 'error');
            return false;
        }
    }

    // ===== GESTIÓN DE USUARIOS =====
    async registrarUsuario(datosUsuario) {
        this.setLoading(true);

        try {
            // Validaciones
            if (!this.validarEmail(datosUsuario.email)) {
                throw new Error('El formato del email es inválido');
            }

            if (!this.validarTelefono(datosUsuario.telefono)) {
                throw new Error('El formato del teléfono es inválido');
            }

            if (datosUsuario.password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Verificar si el usuario ya existe
            if (this.state.usuarios.find(u => u.email === datosUsuario.email)) {
                throw new Error('Este email ya está registrado');
            }

            const nuevoUsuario = {
                id: this.generarId(),
                ...datosUsuario,
                fechaRegistro: new Date().toISOString(),
                reservas: [],
                activo: true
            };

            this.state.usuarios.push(nuevoUsuario);
            this.guardarDatos('usuarios', this.state.usuarios);

            // Iniciar sesión automáticamente
            this.iniciarSesion(nuevoUsuario);

            this.mostrarNotificacion(`¡Cuenta creada exitosamente! Bienvenido ${datosUsuario.nombre}`, 'success');
            return true;

        } catch (error) {
            this.mostrarNotificacion(error.message, 'error');
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    async iniciarSesion(credenciales) {
        this.setLoading(true);

        try {
            const usuario = this.state.usuarios.find(u => 
                u.email === credenciales.email && 
                u.password === credenciales.password &&
                u.activo !== false
            );

            if (usuario) {
                this.state.usuarioActual = usuario;
                this.guardarDatos('usuarioActual', usuario);
                this.actualizarInterfaz();
                this.mostrarNotificacion(`¡Bienvenido ${usuario.nombre}!`, 'success');
                
                // Cerrar modal después de login exitoso
                document.getElementById('loginModal').style.display = 'none';
                return true;
            } else {
                throw new Error('Credenciales incorrectas o cuenta inactiva');
            }
        } catch (error) {
            this.mostrarNotificacion(error.message, 'error');
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    cerrarSesion() {
        this.state.usuarioActual = null;
        this.guardarDatos('usuarioActual', null);
        this.actualizarInterfaz();
        this.mostrarNotificacion('Sesión cerrada correctamente', 'info');
    }

    // ===== SISTEMA DE RESERVAS =====
    seleccionarCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) {
            this.mostrarNotificacion('Cancha no encontrada', 'error');
            return;
        }

        this.state.canchaSeleccionada = cancha;
        
        // Actualizar UI de selección
        document.querySelectorAll('.cancha-item-lista').forEach(item => {
            item.classList.remove('seleccionada');
        });
        const itemSeleccionado = document.querySelector(`.cancha-item-lista[data-id="${canchaId}"]`);
        if (itemSeleccionado) {
            itemSeleccionado.classList.add('seleccionada');
        }

        this.actualizarProgresoReserva(1);
        this.actualizarCalendario();
        this.mostrarResumenReserva();

        // Scroll suave a la sección de reservas
        document.getElementById('reservas')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    seleccionarFecha(fecha) {
        if (!this.validarFechaFutura(fecha)) {
            this.mostrarNotificacion('No puedes reservar fechas pasadas', 'error');
            return;
        }

        this.state.fechaSeleccionada = fecha;
        
        // Actualizar UI
        document.querySelectorAll('.dia-calendario').forEach(dia => {
            dia.classList.remove('seleccionado');
        });
        const diaSeleccionado = document.querySelector(`.dia-calendario[data-fecha="${fecha}"]`);
        if (diaSeleccionado) {
            diaSeleccionado.classList.add('seleccionado');
        }

        this.actualizarProgresoReserva(2);
        this.actualizarSelectorHoras();
        this.mostrarResumenReserva();
    }

    seleccionarHora(hora) {
        if (!this.state.horaInicioSeleccionada) {
            this.state.horaInicioSeleccionada = hora;
            document.querySelectorAll('.hora-slot').forEach(h => h.classList.remove('seleccionado'));
            const horaElemento = document.querySelector(`.hora-slot[data-hora="${hora}"]`);
            if (horaElemento) horaElemento.classList.add('seleccionado');
        } else if (!this.state.horaFinSeleccionada && hora > this.state.horaInicioSeleccionada) {
            this.state.horaFinSeleccionada = hora;
            
            // Seleccionar todas las horas entre inicio y fin
            for (let i = this.state.horaInicioSeleccionada; i < this.state.horaFinSeleccionada; i++) {
                const horaElemento = document.querySelector(`.hora-slot[data-hora="${i}"]`);
                if (horaElemento && !horaElemento.classList.contains('ocupado')) {
                    horaElemento.classList.add('seleccionado');
                }
            }
            
            this.actualizarProgresoReserva(3);
        } else {
            // Resetear selección
            document.querySelectorAll('.hora-slot').forEach(h => h.classList.remove('seleccionado'));
            this.state.horaInicioSeleccionada = hora;
            this.state.horaFinSeleccionada = null;
            const horaElemento = document.querySelector(`.hora-slot[data-hora="${hora}"]`);
            if (horaElemento) horaElemento.classList.add('seleccionado');
        }

        this.actualizarInfoHoraSeleccion();
        this.mostrarResumenReserva();
    }

    async confirmarReserva(datosUsuario = null) {
        this.setLoading(true);

        try {
            const usuario = datosUsuario || this.state.usuarioActual;
            if (!usuario) {
                throw new Error('Debes iniciar sesión o completar tus datos');
            }

            // Validaciones finales
            if (!this.validarReservaCompleta()) {
                throw new Error('Completa todos los datos de la reserva');
            }

            if (!this.verificarDisponibilidad()) {
                throw new Error('Lo sentimos, este horario ya no está disponible');
            }

            // Crear reserva
            const reserva = this.crearReserva(usuario);
            
            // Procesar reserva
            this.procesarReserva(reserva);

            // Enviar emails de confirmación
            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            await this.emailService.enviarConfirmacionUsuario(reserva, cancha);
            await this.emailService.enviarNotificacionAdmin(reserva, cancha);

            // Notificaciones
            this.mostrarConfirmacionReserva(reserva);

            // Resetear sistema
            this.resetearSistemaReservas();

            return reserva;

        } catch (error) {
            this.mostrarNotificacion(error.message, 'error');
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    crearReserva(usuario) {
        const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
        const total = horas * this.state.canchaSeleccionada.precio;

        return {
            id: this.generarId(),
            canchaId: this.state.canchaSeleccionada.id,
            fecha: this.state.fechaSeleccionada,
            horaInicio: this.state.horaInicioSeleccionada,
            horaFin: this.state.horaFinSeleccionada,
            usuario: usuario,
            estado: "confirmada",
            total: total,
            timestamp: new Date().toISOString(),
            codigoReserva: this.generarCodigoReserva(),
            pagado: false
        };
    }

    procesarReserva(reserva) {
        this.state.reservas.push(reserva);
        this.guardarDatos('reservas', this.state.reservas);

        // Actualizar usuario si está registrado
        if (this.state.usuarioActual?.id) {
            const usuarioIndex = this.state.usuarios.findIndex(u => u.id === this.state.usuarioActual.id);
            if (usuarioIndex !== -1) {
                if (!this.state.usuarios[usuarioIndex].reservas) {
                    this.state.usuarios[usuarioIndex].reservas = [];
                }
                this.state.usuarios[usuarioIndex].reservas.push(reserva.id);
                this.guardarDatos('usuarios', this.state.usuarios);
            }
        }
    }

    // ===== MÉTODOS NUEVOS PARA GESTIÓN DE RESERVAS =====

    // Obtener reservas del usuario actual
    obtenerReservasUsuario() {
        if (!this.state.usuarioActual) return [];
        
        return this.state.reservas
            .filter(reserva => reserva.usuario.email === this.state.usuarioActual.email)
            .sort((a, b) => new Date(b.fecha + 'T' + b.horaInicio + ':00') - new Date(a.fecha + 'T' + a.horaInicio + ':00'));
    }

    // Verificar si una reserva puede ser modificada/cancelada (12 horas antes)
    puedeModificarCancelar(reserva) {
        const ahora = new Date();
        const fechaReserva = new Date(reserva.fecha + 'T' + reserva.horaInicio + ':00');
        const diferenciaHoras = (fechaReserva - ahora) / (1000 * 60 * 60);
        
        return diferenciaHoras > this.config.tiempoCancelacion;
    }

    // Cancelar reserva
    async cancelarReservaUsuario(reservaId) {
        this.setLoading(true);

        try {
            const reservaIndex = this.state.reservas.findIndex(r => r.id === reservaId);
            if (reservaIndex === -1) {
                throw new Error('Reserva no encontrada');
            }

            const reserva = this.state.reservas[reservaIndex];

            // Verificar si puede cancelar
            if (!this.puedeModificarCancelar(reserva)) {
                throw new Error('No puedes cancelar la reserva. Solo se permite hasta 12 horas antes del horario programado.');
            }

            // Verificar que el usuario es el propietario
            if (reserva.usuario.email !== this.state.usuarioActual.email) {
                throw new Error('No tienes permiso para cancelar esta reserva');
            }

            // Cambiar estado a cancelada
            this.state.reservas[reservaIndex].estado = 'cancelada';
            this.guardarDatos('reservas', this.state.reservas);

            // Enviar email de cancelación
            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            await this.emailService.enviarCancelacionUsuario(reserva, cancha);

            this.mostrarNotificacion('Reserva cancelada exitosamente', 'success');
            this.actualizarInterfaz();
            
            return true;

        } catch (error) {
            this.mostrarNotificacion(error.message, 'error');
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    // Modificar reserva
    async modificarReserva(reservaId, nuevosDatos) {
        this.setLoading(true);

        try {
            const reservaIndex = this.state.reservas.findIndex(r => r.id === reservaId);
            if (reservaIndex === -1) {
                throw new Error('Reserva no encontrada');
            }

            const reservaOriginal = { ...this.state.reservas[reservaIndex] };

            // Verificar si puede modificar
            if (!this.puedeModificarCancelar(reservaOriginal)) {
                throw new Error('No puedes modificar la reserva. Solo se permite hasta 12 horas antes del horario programado.');
            }

            // Verificar que el usuario es el propietario
            if (reservaOriginal.usuario.email !== this.state.usuarioActual.email) {
                throw new Error('No tienes permiso para modificar esta reserva');
            }

            // Verificar disponibilidad de la nueva reserva
            const reservaTemporal = {
                canchaId: nuevosDatos.canchaId || reservaOriginal.canchaId,
                fecha: nuevosDatos.fecha || reservaOriginal.fecha,
                horaInicio: nuevosDatos.horaInicio || reservaOriginal.horaInicio,
                horaFin: nuevosDatos.horaFin || reservaOriginal.horaFin
            };

            // Excluir la reserva actual de la verificación
            const disponible = this.state.reservas.every(r => 
                r.id === reservaId || 
                r.canchaId !== reservaTemporal.canchaId || 
                r.fecha !== reservaTemporal.fecha ||
                r.estado !== 'confirmada' ||
                !(r.horaInicio < reservaTemporal.horaFin && r.horaFin > reservaTemporal.horaInicio)
            );

            if (!disponible) {
                throw new Error('El nuevo horario no está disponible');
            }

            // Calcular nuevo total
            const cancha = this.canchas.find(c => c.id === reservaTemporal.canchaId);
            const horas = reservaTemporal.horaFin - reservaTemporal.horaInicio;
            const nuevoTotal = horas * cancha.precio;

            // Actualizar reserva
            this.state.reservas[reservaIndex] = {
                ...reservaOriginal,
                ...nuevosDatos,
                total: nuevoTotal,
                fechaModificacion: new Date().toISOString()
            };

            this.guardarDatos('reservas', this.state.reservas);

            // Enviar email de modificación
            await this.emailService.enviarModificacionUsuario(reservaOriginal, this.state.reservas[reservaIndex], cancha);

            this.mostrarNotificacion('Reserva modificada exitosamente', 'success');
            this.actualizarInterfaz();
            
            return true;

        } catch (error) {
            this.mostrarNotificacion(error.message, 'error');
            return false;
        } finally {
            this.setLoading(false);
        }
    }

    // Iniciar modificación de reserva
    iniciarModificacionReserva(reservaId) {
        const reserva = this.state.reservas.find(r => r.id === reservaId);
        if (!reserva) return;

        // Verificar si puede modificar
        if (!this.puedeModificarCancelar(reserva)) {
            this.mostrarNotificacion('No puedes modificar la reserva. Solo se permite hasta 12 horas antes del horario programado.', 'error');
            return;
        }

        this.state.reservaEditando = reserva;
        
        // Seleccionar la cancha
        this.seleccionarCancha(reserva.canchaId);
        
        // Seleccionar fecha y hora
        this.state.fechaSeleccionada = reserva.fecha;
        this.state.horaInicioSeleccionada = reserva.horaInicio;
        this.state.horaFinSeleccionada = reserva.horaFin;

        this.actualizarCalendario();
        this.actualizarSelectorHoras();
        this.mostrarResumenReserva(true);
        
        this.mostrarNotificacion('Modo edición activado. Selecciona nuevo horario y confirma los cambios.', 'info');
    }

    // Confirmar modificación de reserva
    async confirmarModificacionReserva() {
        if (!this.state.reservaEditando) return;

        const nuevosDatos = {
            canchaId: this.state.canchaSeleccionada.id,
            fecha: this.state.fechaSeleccionada,
            horaInicio: this.state.horaInicioSeleccionada,
            horaFin: this.state.horaFinSeleccionada
        };

        await this.modificarReserva(this.state.reservaEditando.id, nuevosDatos);
        this.state.reservaEditando = null;
    }

    cancelarModificacion() {
        this.state.reservaEditando = null;
        this.resetearSistemaReservas();
        this.mostrarNotificacion('Modificación cancelada', 'info');
    }

    // ===== VALIDACIONES =====
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarTelefono(telefono) {
        const regex = /^[0-9]{8,15}$/;
        return regex.test(telefono);
    }

    validarFechaFutura(fecha) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaReserva = new Date(fecha);
        return fechaReserva >= hoy;
    }

    validarReservaCompleta() {
        return this.state.canchaSeleccionada && 
               this.state.fechaSeleccionada && 
               this.state.horaInicioSeleccionada && 
               this.state.horaFinSeleccionada;
    }

    verificarDisponibilidad(reserva = null) {
        const reservaAVerificar = reserva || {
            canchaId: this.state.canchaSeleccionada.id,
            fecha: this.state.fechaSeleccionada,
            horaInicio: this.state.horaInicioSeleccionada,
            horaFin: this.state.horaFinSeleccionada
        };

        return !this.state.reservas.some(r => 
            r.canchaId === reservaAVerificar.canchaId && 
            r.fecha === reservaAVerificar.fecha &&
            r.estado === 'confirmada' &&
            ((r.horaInicio < reservaAVerificar.horaFin && r.horaFin > reservaAVerificar.horaInicio))
        );
    }

    // ===== UTILIDADES =====
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generarCodigoReserva() {
        return 'CR' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    formatearFechaISO(fecha) {
        return fecha.toISOString().split('T')[0];
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

    formatearHora(hora) {
        return `${hora}:00`;
    }

    obtenerNombreMes(mes) {
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mes];
    }

    // ===== INTERFAZ DE USUARIO =====
    actualizarInterfaz() {
        this.actualizarEstadoUsuario();
        this.actualizarCanchas();
        this.actualizarEstadisticas();
        this.actualizarHistorialUsuario();
        this.actualizarAreaUsuario();
    }

    actualizarEstadoUsuario() {
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        const loginText = document.getElementById('loginText');
        const linkAreaUsuario = document.getElementById('linkAreaUsuario');
        const areaUsuarioSection = document.getElementById('areaUsuario');

        if (this.state.usuarioActual) {
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'flex';
            if (loginText) {
                loginText.textContent = this.state.usuarioActual.nombre.split(' ')[0];
            }
            if (linkAreaUsuario) {
                linkAreaUsuario.style.display = 'flex';
            }
            if (areaUsuarioSection) {
                areaUsuarioSection.style.display = 'block';
            }
        } else {
            btnLogin.style.display = 'flex';
            btnLogout.style.display = 'none';
            if (loginText) {
                loginText.textContent = 'Mi Cuenta';
            }
            if (linkAreaUsuario) {
                linkAreaUsuario.style.display = 'none';
            }
            if (areaUsuarioSection) {
                areaUsuarioSection.style.display = 'none';
            }
        }
    }

    // Nueva función para área de usuario
    actualizarAreaUsuario() {
        const areaUsuario = document.getElementById('areaUsuarioContenido');
        if (!areaUsuario) return;

        if (this.state.usuarioActual) {
            const reservasUsuario = this.obtenerReservasUsuario();
            
            areaUsuario.innerHTML = `
                <div class="area-usuario-container">
                    <div class="usuario-header">
                        <h3><i class="fas fa-user-circle"></i> Mi Cuenta</h3>
                        <div class="usuario-info">
                            <strong>${this.state.usuarioActual.nombre}</strong>
                            <span>${this.state.usuarioActual.email}</span>
                            <span>Tel: ${this.state.usuarioActual.telefono}</span>
                        </div>
                    </div>

                    <div class="reservas-usuario">
                        <h4><i class="fas fa-history"></i> Mis Reservas</h4>
                        ${reservasUsuario.length === 0 ? 
                            '<p class="sin-reservas">No tienes reservas realizadas</p>' : 
                            this.generarListaReservasUsuario(reservasUsuario)
                        }
                    </div>
                </div>
            `;
        }
    }

    generarListaReservasUsuario(reservas) {
        return `
            <div class="reservas-lista">
                ${reservas.map(reserva => {
                    const cancha = this.canchas.find(c => c.id === reserva.canchaId);
                    const puedeModificar = this.puedeModificarCancelar(reserva);
                    const esPasada = new Date(reserva.fecha + 'T' + reserva.horaInicio + ':00') < new Date();
                    
                    return `
                        <div class="reserva-usuario-item ${reserva.estado} ${esPasada ? 'pasada' : ''}">
                            <div class="reserva-info">
                                <div class="reserva-header">
                                    <strong>${cancha?.nombre}</strong>
                                    <span class="estado-badge estado-${reserva.estado}">${reserva.estado}</span>
                                </div>
                                <div class="reserva-detalles">
                                    <span><i class="fas fa-calendar"></i> ${this.formatearFechaLegible(reserva.fecha)}</span>
                                    <span><i class="fas fa-clock"></i> ${reserva.horaInicio}:00 - ${reserva.horaFin}:00</span>
                                    <span><i class="fas fa-dollar-sign"></i> ${reserva.total} Bs</span>
                                    <span><i class="fas fa-hashtag"></i> ${reserva.codigoReserva}</span>
                                </div>
                            </div>
                            <div class="reserva-acciones">
                                ${reserva.estado === 'confirmada' && !esPasada ? `
                                    ${puedeModificar ? `
                                        <button class="btn btn-small btn-warning" onclick="sistema.iniciarModificacionReserva('${reserva.id}')">
                                            <i class="fas fa-edit"></i> Modificar
                                        </button>
                                        <button class="btn btn-small btn-error" onclick="sistema.cancelarReservaUsuario('${reserva.id}')">
                                            <i class="fas fa-times"></i> Cancelar
                                        </button>
                                    ` : `
                                        <span class="texto-ayuda">No modificable</span>
                                    `}
                                ` : ''}
                                <button class="btn btn-small btn-info" onclick="sistema.verDetallesReserva('${reserva.id}')">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    actualizarProgresoReserva(paso) {
        const pasos = document.querySelectorAll('.progress-step');
        pasos.forEach((step, index) => {
            if (index < paso) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    setLoading(estado) {
        this.state.isLoading = estado;
        document.body.classList.toggle('loading', estado);
        
        if (estado) {
            document.body.style.cursor = 'wait';
            document.querySelectorAll('button').forEach(btn => {
                btn.style.pointerEvents = 'none';
            });
        } else {
            document.body.style.cursor = 'default';
            document.querySelectorAll('button').forEach(btn => {
                btn.style.pointerEvents = 'auto';
            });
        }
    }

    // ===== NOTIFICACIONES Y CONFIRMACIONES =====
    mostrarNotificacion(mensaje, tipo = 'info') {
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <div class="notificacion-contenido">
                <i class="fas ${this.obtenerIconoNotificacion(tipo)}"></i>
                <span>${mensaje}</span>
            </div>
        `;

        document.body.appendChild(notificacion);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 5000);
    }

    obtenerIconoNotificacion(tipo) {
        const iconos = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return iconos[tipo] || 'fa-info-circle';
    }

    mostrarConfirmacionReserva(reserva) {
        const modal = this.crearModalConfirmacion(reserva);
        document.body.appendChild(modal);
    }

    crearModalConfirmacion(reserva) {
        const modal = document.createElement('div');
        modal.className = 'modal-confirmacion';
        
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;

        modal.innerHTML = `
            <div class="modal-contenido">
                <div class="confirmacion-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>¡Reserva Confirmada!</h2>
                </div>
                <div class="confirmacion-body">
                    <div class="reserva-detalle">
                        <strong>Cancha:</strong> ${cancha.nombre}
                    </div>
                    <div class="reserva-detalle">
                        <strong>Fecha:</strong> ${this.formatearFechaLegible(reserva.fecha)}
                    </div>
                    <div class="reserva-detalle">
                        <strong>Horario:</strong> ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
                    </div>
                    <div class="reserva-detalle">
                        <strong>Duración:</strong> ${horas} hora${horas > 1 ? 's' : ''}
                    </div>
                    <div class="reserva-detalle">
                        <strong>Total:</strong> ${reserva.total} Bs
                    </div>
                    <div class="codigo-reserva">
                        <strong>Código de reserva:</strong>
                        <div class="codigo">${reserva.codigoReserva}</div>
                    </div>
                    <div class="email-info">
                        <i class="fas fa-envelope"></i>
                        <span>Se ha enviado un email de confirmación a ${reserva.usuario.email}</span>
                    </div>
                </div>
                <div class="confirmacion-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal-confirmacion').remove()">
                        <i class="fas fa-check"></i> Entendido
                    </button>
                    <button class="btn btn-secondary" onclick="sistema.imprimirReserva('${reserva.id}')">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
        `;

        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '10000'
        });

        return modal;
    }

    // ===== IMPLEMENTACIONES COMPLETAS =====
    
    inicializarEventListeners() {
        console.log('📝 Inicializando event listeners...');
        
        // Login/Registro
        document.getElementById('btnIniciarSesion')?.addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.iniciarSesion({ email, password });
        });

        document.getElementById('btnRegistrarUsuario')?.addEventListener('click', () => {
            const nombre = document.getElementById('regNombre').value;
            const email = document.getElementById('regEmail').value;
            const telefono = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            this.registrarUsuario({ nombre, email, telefono, password });
        });

        // Navegación entre formularios
        document.getElementById('linkCrearCuenta')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.register-form').style.display = 'block';
        });

        document.getElementById('linkVolverLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.register-form').style.display = 'none';
            document.querySelector('.login-form').style.display = 'block';
        });

        // Panel de administración
        document.getElementById('linkPanelAdmin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarAdminLogin();
        });

        // Filtro de horarios
        document.getElementById('filtroHorario')?.addEventListener('change', (e) => {
            this.state.filtroHorario = e.target.value;
            this.aplicarFiltroHorario();
        });

        // Botones de canchas en la lista
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-reservar') || e.target.closest('.btn-reservar')) {
                const btn = e.target.classList.contains('btn-reservar') ? e.target : e.target.closest('.btn-reservar');
                const canchaId = parseInt(btn.dataset.cancha);
                this.seleccionarCancha(canchaId);
            }
            
            if (e.target.classList.contains('btn-ver-detalles') || e.target.closest('.btn-ver-detalles')) {
                const btn = e.target.classList.contains('btn-ver-detalles') ? e.target : e.target.closest('.btn-ver-detalles');
                const canchaId = parseInt(btn.dataset.cancha);
                this.mostrarDetallesCancha(canchaId);
            }
        });

        // Confirmación de reserva para invitados
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btnConfirmarInvitado' || e.target.closest('#btnConfirmarInvitado')) {
                const nombre = document.getElementById('reservaNombre')?.value;
                const email = document.getElementById('reservaEmail')?.value;
                const telefono = document.getElementById('reservaTelefono')?.value;
                
                if (nombre && email && telefono) {
                    this.confirmarReserva({ nombre, email, telefono });
                } else {
                    this.mostrarNotificacion('Completa todos los campos', 'error');
                }
            }
        });

        // Navegación del calendario
        document.getElementById('prev-mes')?.addEventListener('click', () => {
            this.state.mesActual--;
            if (this.state.mesActual < 0) {
                this.state.mesActual = 11;
                this.state.añoActual--;
            }
            this.generarCalendario(this.state.mesActual, this.state.añoActual);
        });

        document.getElementById('next-mes')?.addEventListener('click', () => {
            this.state.mesActual++;
            if (this.state.mesActual > 11) {
                this.state.mesActual = 0;
                this.state.añoActual++;
            }
            this.generarCalendario(this.state.mesActual, this.state.añoActual);
        });
    }

    inicializarComponentes() {
        console.log('⚙️ Inicializando componentes...');
        this.generarCalendario(this.state.mesActual, this.state.añoActual);
        this.inicializarSelectorHoras();
        this.actualizarCanchas();
    }

    actualizarCanchas() {
        console.log('🏟️ Actualizando canchas...');
        const canchasGrid = document.getElementById('canchasGrid');
        const canchasLista = document.getElementById('canchasLista');

        if (canchasGrid) {
            canchasGrid.innerHTML = this.canchas.map(cancha => `
                <div class="cancha-card-profesional">
                    <div class="cancha-header">
                        <div class="cancha-badge ${cancha.tipo.toLowerCase() === 'futsal' ? 'cancha-futsal' : 'cancha-wally'}">
                            <i class="fas ${cancha.tipo.toLowerCase() === 'futsal' ? 'fa-futbol' : 'fa-volleyball-ball'}"></i>
                            ${cancha.tipo.toUpperCase()}
                        </div>
                        <div class="cancha-precio">${cancha.precio} Bs/h</div>
                    </div>
                    <div class="cancha-imagen">
                        <img src="${cancha.imagen}" alt="${cancha.nombre}" loading="lazy">
                        <div class="cancha-overlay">
                            <button class="btn-ver-detalles" data-cancha="${cancha.id}">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cancha-info">
                        <h3>${cancha.nombre}</h3>
                        <p>${cancha.descripcion}</p>
                        <div class="cancha-features">
                            ${cancha.caracteristicas.map(caract => 
                                `<span><i class="fas fa-check"></i> ${caract}</span>`
                            ).join('')}
                        </div>
                        <div class="cancha-estado">
                            <span class="cancha-item-estado estado-${this.obtenerEstadoCancha(cancha.id)}">
                                ${this.obtenerEstadoCancha(cancha.id) === 'disponible' ? '🟢 Disponible' : '🔴 Ocupada'}
                            </span>
                        </div>
                    </div>
                    <div class="cancha-actions">
                        <button class="btn-reservar" data-cancha="${cancha.id}">
                            <i class="fas fa-calendar-plus"></i>
                            Reservar Ahora
                        </button>
                    </div>
                </div>
            `).join('');
        }

        if (canchasLista) {
            canchasLista.innerHTML = this.canchas.map(cancha => `
                <div class="cancha-item-lista" data-id="${cancha.id}">
                    <div class="cancha-item-header">
                        <h4>${cancha.nombre}</h4>
                        <div class="cancha-item-precio">${cancha.precio} Bs/h</div>
                    </div>
                    <div class="cancha-item-tipo">${cancha.tipo}</div>
                    <div class="cancha-item-estado estado-${this.obtenerEstadoCancha(cancha.id)}">
                        ${this.obtenerEstadoCancha(cancha.id) === 'disponible' ? 'Disponible' : 'Ocupada'}
                    </div>
                </div>
            `).join('');

            // Agregar event listeners a los items de la lista
            canchasLista.querySelectorAll('.cancha-item-lista').forEach(item => {
                item.addEventListener('click', () => {
                    const canchaId = parseInt(item.dataset.id);
                    this.seleccionarCancha(canchaId);
                });
            });
        }
    }

    obtenerEstadoCancha(canchaId) {
        const hoy = this.formatearFechaISO(new Date());
        const ahora = new Date().getHours();
        
        const reservaActiva = this.state.reservas.find(r => 
            r.canchaId === canchaId && 
            r.fecha === hoy && 
            r.estado === 'confirmada' &&
            r.horaInicio <= ahora && 
            r.horaFin > ahora
        );
        
        return reservaActiva ? 'ocupada' : 'disponible';
    }

    generarCalendario(mes, año) {
        const contenedor = document.getElementById('diasMes');
        const mesHeader = document.getElementById('mes-actual');
        
        if (!contenedor || !mesHeader) return;
        
        contenedor.innerHTML = '';
        mesHeader.textContent = `${this.obtenerNombreMes(mes)} ${año}`;
        
        const primerDia = new Date(año, mes, 1);
        const ultimoDia = new Date(año, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        
        // Ajustar para que la semana empiece en lunes
        const primerDiaSemana = primerDia.getDay();
        const primerDiaAjustado = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
        
        // Días del mes anterior
        for (let i = 0; i < primerDiaAjustado; i++) {
            const dia = document.createElement('div');
            dia.className = 'dia-calendario inactivo';
            dia.textContent = '';
            contenedor.appendChild(dia);
        }
        
        // Días del mes actual
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        for (let i = 1; i <= diasEnMes; i++) {
            const dia = document.createElement('div');
            dia.className = 'dia-calendario';
            dia.textContent = i;
            
            const fecha = new Date(año, mes, i);
            const fechaISO = this.formatearFechaISO(fecha);
            
            dia.dataset.fecha = fechaISO;
            
            // Verificar si es una fecha pasada
            if (fecha < hoy) {
                dia.classList.add('inactivo');
            } else {
                // Verificar disponibilidad
                if (this.state.canchaSeleccionada && this.estaDiaOcupado(fechaISO, this.state.canchaSeleccionada.id)) {
                    dia.classList.add('ocupado');
                }
                
                dia.addEventListener('click', () => {
                    if (!dia.classList.contains('ocupado') && !dia.classList.contains('inactivo')) {
                        this.seleccionarFecha(fechaISO);
                    }
                });
            }
            
            // Marcar día actual
            if (fecha.toDateString() === hoy.toDateString()) {
                dia.classList.add('hoy');
            }
            
            // Marcar día seleccionado
            if (fechaISO === this.state.fechaSeleccionada) {
                dia.classList.add('seleccionado');
            }
            
            contenedor.appendChild(dia);
        }
    }

    estaDiaOcupado(fecha, canchaId) {
        return this.state.reservas.some(r => 
            r.canchaId === canchaId && 
            r.fecha === fecha &&
            r.estado === 'confirmada'
        );
    }

    actualizarCalendario() {
        this.generarCalendario(this.state.mesActual, this.state.añoActual);
    }

    // ===== FUNCIONES FALTANTES IMPLEMENTADAS =====
    
    mostrarLogin() {
        document.querySelector('.login-form').style.display = 'block';
        document.querySelector('.register-form').style.display = 'none';
    }

    inicializarSelectorHoras() {
        const horariosGrid = document.getElementById('horariosGrid');
        if (!horariosGrid) return;
        
        horariosGrid.innerHTML = '';
        
        // Generar horas de 14:00 a 22:00
        for (let i = this.config.horarioApertura; i < this.config.horarioCierre; i++) {
            const hora = document.createElement('div');
            hora.className = 'hora-slot';
            hora.dataset.hora = i;
            hora.textContent = `${i}:00`;
            
            hora.addEventListener('click', () => {
                if (!hora.classList.contains('ocupado')) {
                    this.seleccionarHora(i);
                }
            });
            
            horariosGrid.appendChild(hora);
        }
    }

    actualizarSelectorHoras() {
        if (!this.state.fechaSeleccionada || !this.state.canchaSeleccionada) return;
        
        const horas = document.querySelectorAll('.hora-slot');
        
        horas.forEach(hora => {
            const horaNum = parseInt(hora.dataset.hora);
            const ocupada = this.estaHoraOcupada(this.state.fechaSeleccionada, this.state.canchaSeleccionada.id, horaNum);
            
            hora.classList.toggle('ocupado', ocupada);
            hora.classList.remove('seleccionado');
            
            // Marcar horas seleccionadas
            if (this.state.horaInicioSeleccionada && this.state.horaFinSeleccionada) {
                if (horaNum >= this.state.horaInicioSeleccionada && horaNum < this.state.horaFinSeleccionada) {
                    hora.classList.add('seleccionado');
                }
            } else if (this.state.horaInicioSeleccionada && horaNum === this.state.horaInicioSeleccionada) {
                hora.classList.add('seleccionado');
            }
        });
    }

    estaHoraOcupada(fecha, canchaId, hora) {
        return this.state.reservas.some(r => 
            r.canchaId === canchaId && 
            r.fecha === fecha &&
            r.estado === 'confirmada' &&
            r.horaInicio <= hora && 
            r.horaFin > hora
        );
    }

    actualizarInfoHoraSeleccion() {
        const infoElement = document.getElementById('horaSeleccionInfo');
        if (!infoElement) return;
        
        if (this.state.horaInicioSeleccionada && this.state.horaFinSeleccionada) {
            const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
            infoElement.textContent = `${this.state.horaInicioSeleccionada}:00 - ${this.state.horaFinSeleccionada}:00 (${horas} hora${horas > 1 ? 's' : ''})`;
        } else if (this.state.horaInicioSeleccionada) {
            infoElement.textContent = `Selecciona hora de fin (${this.state.horaInicioSeleccionada}:00 - ?)`;
        } else {
            infoElement.textContent = 'Selecciona rango de horas';
        }
    }

    aplicarFiltroHorario() {
        console.log('Aplicando filtro:', this.state.filtroHorario);
        // Implementar lógica de filtrado según el valor seleccionado
        this.actualizarCalendario();
        this.actualizarSelectorHoras();
    }

    mostrarResumenReserva(esEdicion = false) {
        const resumenEstado = document.getElementById('resumenEstado');
        const resumenDetalles = document.getElementById('resumenDetalles');
        const formularioReserva = document.getElementById('formularioReserva');
        
        if (!resumenEstado || !resumenDetalles || !formularioReserva) return;
        
        if (this.validarReservaCompleta()) {
            const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
            const total = horas * this.state.canchaSeleccionada.precio;
            
            resumenEstado.innerHTML = `
                <i class="fas fa-check-circle"></i>
                ${esEdicion ? 'Modificación lista para confirmar' : 'Reserva lista para confirmar'}
            `;
            resumenEstado.className = 'resumen-estado disponible';
            
            resumenDetalles.innerHTML = `
                <div class="resumen-item">
                    <strong>Cancha:</strong> ${this.state.canchaSeleccionada.nombre}
                </div>
                <div class="resumen-item">
                    <strong>Fecha:</strong> ${this.formatearFechaLegible(this.state.fechaSeleccionada)}
                </div>
                <div class="resumen-item">
                    <strong>Horario:</strong> ${this.state.horaInicioSeleccionada}:00 - ${this.state.horaFinSeleccionada}:00
                </div>
                <div class="resumen-item">
                    <strong>Duración:</strong> ${horas} hora${horas > 1 ? 's' : ''}
                </div>
                <div class="resumen-item total">
                    <strong>Total ${esEdicion ? 'modificado' : 'a pagar'}:</strong> ${total} Bs
                </div>
                ${esEdicion && this.state.reservaEditando ? `
                    <div class="resumen-item original">
                        <strong>Total original:</strong> ${this.state.reservaEditando.total} Bs
                    </div>
                ` : ''}
            `;
            
            // Mostrar formulario de confirmación
            if (this.state.usuarioActual) {
                formularioReserva.innerHTML = `
                    <div class="form-confirmacion">
                        <h4><i class="fas fa-user-check"></i> ${esEdicion ? 'Confirmar Modificación' : 'Confirmar Reserva'}</h4>
                        <p>Hola <strong>${this.state.usuarioActual.nombre}</strong>, ¿confirmas ${esEdicion ? 'la modificación' : 'tu reserva'}?</p>
                        <div class="form-actions">
                            <button class="btn btn-primary" onclick="sistema.${esEdicion ? 'confirmarModificacionReserva' : 'confirmarReserva'}()">
                                <i class="fas fa-calendar-check"></i>
                                ${esEdicion ? 'Confirmar Modificación' : 'Confirmar Reserva'}
                            </button>
                            <button class="btn btn-secondary" onclick="sistema.cancelar${esEdicion ? 'Modificacion' : 'Reserva'}()">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Formulario para invitados (solo para nuevas reservas)
                formularioReserva.innerHTML = `
                    <div class="form-invitado">
                        <h4><i class="fas fa-info-circle"></i> Completa tus datos</h4>
                        <p>Para confirmar tu reserva, ingresa tus datos:</p>
                        <div class="form-group">
                            <label for="reservaNombre"><i class="fas fa-user"></i> Nombre completo</label>
                            <input type="text" id="reservaNombre" placeholder="Tu nombre completo" required>
                        </div>
                        <div class="form-group">
                            <label for="reservaEmail"><i class="fas fa-envelope"></i> Correo electrónico</label>
                            <input type="email" id="reservaEmail" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="reservaTelefono"><i class="fas fa-phone"></i> Teléfono</label>
                            <input type="tel" id="reservaTelefono" placeholder="73811600" required>
                        </div>
                        <div class="form-actions">
                            <button class="btn btn-primary" id="btnConfirmarInvitado">
                                <i class="fas fa-calendar-check"></i>
                                Confirmar Reserva
                            </button>
                        </div>
                    </div>
                `;
            }
        } else {
            let mensaje = 'Completa los pasos para ver el resumen de tu reserva';
            let icono = 'fas fa-info-circle';
            
            if (this.state.canchaSeleccionada && !this.state.fechaSeleccionada) {
                mensaje = 'Cancha seleccionada. Ahora elige una fecha.';
                icono = 'fas fa-calendar-alt';
            } else if (this.state.canchaSeleccionada && this.state.fechaSeleccionada && !this.state.horaInicioSeleccionada) {
                mensaje = 'Fecha seleccionada. Ahora elige el horario.';
                icono = 'fas fa-clock';
            } else if (this.state.canchaSeleccionada && this.state.fechaSeleccionada && this.state.horaInicioSeleccionada && !this.state.horaFinSeleccionada) {
                mensaje = 'Hora de inicio seleccionada. Elige la hora de fin.';
                icono = 'fas fa-hourglass-half';
            }
            
            resumenEstado.innerHTML = `<i class="${icono}"></i> ${mensaje}`;
            resumenEstado.className = 'resumen-estado';
            resumenDetalles.innerHTML = '';
            formularioReserva.innerHTML = '';
        }
    }

    cancelarReserva() {
        this.resetearSistemaReservas();
        this.mostrarNotificacion('Reserva cancelada', 'info');
    }

    resetearSistemaReservas() {
        this.state.canchaSeleccionada = null;
        this.state.fechaSeleccionada = null;
        this.state.horaInicioSeleccionada = null;
        this.state.horaFinSeleccionada = null;
        this.state.reservaEditando = null;
        
        // Resetear UI
        document.querySelectorAll('.cancha-item-lista').forEach(item => {
            item.classList.remove('seleccionada');
        });
        
        document.querySelectorAll('.dia-calendario').forEach(dia => {
            dia.classList.remove('seleccionado');
        });
        
        document.querySelectorAll('.hora-slot').forEach(hora => {
            hora.classList.remove('seleccionado');
        });
        
        this.actualizarProgresoReserva(1);
        this.mostrarResumenReserva();
        this.actualizarEstadoTiempoReal();
    }

    actualizarEstadisticas() {
        console.log('📊 Actualizando estadísticas...');
        const hoy = this.formatearFechaISO(new Date());
        const reservasHoy = this.state.reservas.filter(r => r.fecha === hoy && r.estado === 'confirmada').length;
        
        // Actualizar contadores en el footer
        const totalReservasElement = document.getElementById('totalReservasHoy');
        const canchasDisponiblesElement = document.getElementById('canchasDisponibles');
        
        if (totalReservasElement) {
            totalReservasElement.textContent = reservasHoy;
        }
        
        if (canchasDisponiblesElement) {
            const canchasDisponibles = this.canchas.filter(c => this.obtenerEstadoCancha(c.id) === 'disponible').length;
            canchasDisponiblesElement.textContent = canchasDisponibles;
        }
    }

    actualizarHistorialUsuario() {
        console.log('📚 Actualizando historial de usuario...');
        const historialRapido = document.getElementById('historialRapido');
        const historialLista = document.getElementById('historialLista');
        
        if (!historialRapido || !historialLista) return;
        
        if (this.state.usuarioActual) {
            historialRapido.style.display = 'block';
            const reservasUsuario = this.state.reservas
                .filter(r => r.usuario.email === this.state.usuarioActual.email)
                .slice(0, 3);
            
            if (reservasUsuario.length === 0) {
                historialLista.innerHTML = '<p class="sin-reservas">No tienes reservas recientes</p>';
            } else {
                historialLista.innerHTML = reservasUsuario.map(reserva => {
                    const cancha = this.canchas.find(c => c.id === reserva.canchaId);
                    return `
                        <div class="historial-item">
                            <div class="historial-info">
                                <strong>${cancha?.nombre}</strong>
                                <span>${this.formatearFechaLegible(reserva.fecha)}</span>
                                <span>${reserva.horaInicio}:00-${reserva.horaFin}:00</span>
                            </div>
                            <div class="historial-acciones">
                                <button class="btn-small" onclick="sistema.verDetallesReserva('${reserva.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } else {
            historialRapido.style.display = 'none';
        }
    }

    verDetallesReserva(reservaId) {
        const reserva = this.state.reservas.find(r => r.id === reservaId);
        if (!reserva) return;
        
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const modal = document.getElementById('detallesReservaModal');
        const body = document.getElementById('detallesReservaBody');
        
        if (modal && body) {
            body.innerHTML = `
                <div class="detalles-reserva">
                    <div class="detalle-item">
                        <strong>Código de Reserva:</strong> ${reserva.codigoReserva}
                    </div>
                    <div class="detalle-item">
                        <strong>Cancha:</strong> ${cancha?.nombre}
                    </div>
                    <div class="detalle-item">
                        <strong>Fecha:</strong> ${this.formatearFechaLegible(reserva.fecha)}
                    </div>
                    <div class="detalle-item">
                        <strong>Horario:</strong> ${reserva.horaInicio}:00 - ${reserva.horaFin}:00
                    </div>
                    <div class="detalle-item">
                        <strong>Total:</strong> ${reserva.total} Bs
                    </div>
                    <div class="detalle-item">
                        <strong>Estado:</strong> 
                        <span class="estado-badge estado-${reserva.estado}">${reserva.estado}</span>
                    </div>
                    <div class="detalle-item">
                        <strong>Pagado:</strong> ${reserva.pagado ? 'Sí' : 'No'}
                    </div>
                    ${reserva.fechaModificacion ? `
                    <div class="detalle-item">
                        <strong>Última modificación:</strong> ${new Date(reserva.fechaModificacion).toLocaleString('es-ES')}
                    </div>
                    ` : ''}
                </div>
            `;
            modal.style.display = 'block';
        }
    }

    mostrarDetallesCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;
        
        const modal = document.getElementById('detallesModal');
        const body = document.getElementById('detallesCanchaBody');
        
        if (modal && body) {
            body.innerHTML = `
                <div class="detalles-cancha">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" class="detalles-imagen">
                    <div class="detalles-info">
                        <h4>${cancha.nombre}</h4>
                        <p class="detalles-descripcion">${cancha.descripcion}</p>
                        <div class="detalles-caracteristicas">
                            ${cancha.caracteristicas.map(caract => 
                                `<span><i class="fas fa-check"></i> ${caract}</span>`
                            ).join('')}
                        </div>
                        <div class="detalles-precio">
                            <strong>Precio: ${cancha.precio} Bs por hora</strong>
                        </div>
                        <div class="detalles-capacidad">
                            <strong>Capacidad: ${cancha.capacidad}</strong>
                        </div>
                        <button class="btn btn-primary" onclick="sistema.seleccionarCancha(${cancha.id}); document.getElementById('detallesModal').style.display='none'; document.getElementById('reservas').scrollIntoView({behavior:'smooth'})">
                            <i class="fas fa-calendar-plus"></i>
                            Reservar Esta Cancha
                        </button>
                    </div>
                </div>
            `;
            modal.style.display = 'block';
        }
    }

    mostrarAdminLogin() {
        const modal = document.getElementById('adminModal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-lock"></i> Acceso Administrativo</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="admin-login-form">
                        <div class="form-group">
                            <label for="adminUsuario"><i class="fas fa-user-shield"></i> Usuario Admin</label>
                            <input type="text" id="adminUsuario" placeholder="Usuario administrativo">
                        </div>
                        <div class="form-group">
                            <label for="adminPassword"><i class="fas fa-key"></i> Contraseña</label>
                            <input type="password" id="adminPassword" placeholder="Contraseña de administrador">
                        </div>
                        <button class="btn btn-primary btn-block" onclick="sistema.accederPanelAdmin()">
                            <i class="fas fa-sign-in-alt"></i> Acceder al Panel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Agregar event listener para cerrar
        const span = modal.querySelector('.close');
        span.onclick = function() {
            modal.style.display = 'none';
        };
    }

    accederPanelAdmin() {
        const usuario = document.getElementById('adminUsuario').value;
        const password = document.getElementById('adminPassword').value;
        
        // Credenciales de administrador
        if (usuario === this.config.adminCredentials.usuario && password === this.config.adminCredentials.password) {
            this.mostrarPanelAdmin();
        } else {
            this.mostrarNotificacion('Credenciales de administrador incorrectas', 'error');
        }
    }

    mostrarPanelAdmin() {
        const modal = document.getElementById('adminModal');
        
        // Estadísticas para el panel admin
        const totalReservas = this.state.reservas.length;
        const reservasConfirmadas = this.state.reservas.filter(r => r.estado === 'confirmada').length;
        const ingresosTotales = this.state.reservas
            .filter(r => r.estado === 'confirmada')
            .reduce((total, r) => total + r.total, 0);
        
        // Reservas recientes (últimas 5)
        const reservasRecientes = [...this.state.reservas]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        modal.innerHTML = `
            <div class="modal-content modal-admin">
                <div class="modal-header">
                    <h3><i class="fas fa-tachometer-alt"></i> Panel de Administración</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="admin-stats">
                        <div class="admin-stat">
                            <h4>Total Reservas</h4>
                            <span class="stat-number">${totalReservas}</span>
                        </div>
                        <div class="admin-stat">
                            <h4>Confirmadas</h4>
                            <span class="stat-number">${reservasConfirmadas}</span>
                        </div>
                        <div class="admin-stat">
                            <h4>Ingresos Totales</h4>
                            <span class="stat-number">${ingresosTotales} Bs</span>
                        </div>
                    </div>
                    
                    <div class="admin-actions">
                        <h4>Acciones Rápidas</h4>
                        <div class="admin-buttons">
                            <button class="btn btn-primary btn-small" onclick="sistema.exportarDatos()">
                                <i class="fas fa-download"></i> Exportar Datos
                            </button>
                            <button class="btn btn-secondary btn-small" onclick="sistema.limpiarSistema()">
                                <i class="fas fa-trash"></i> Limpiar Sistema
                            </button>
                        </div>
                    </div>
                    
                    <div class="admin-notificaciones">
                        <h4>Últimas Reservas</h4>
                        <div class="notificaciones-list" id="adminNotificaciones">
                            ${reservasRecientes.map(reserva => {
                                const cancha = this.canchas.find(c => c.id === reserva.canchaId);
                                return `
                                    <div class="notificacion-item">
                                        <div class="notificacion-info">
                                            <strong>${reserva.usuario.nombre}</strong>
                                            <span>${cancha?.nombre} - ${reserva.horaInicio}:00</span>
                                        </div>
                                        <div class="notificacion-fecha">
                                            ${new Date(reserva.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar event listener para cerrar
        const span = modal.querySelector('.close');
        span.onclick = function() {
            modal.style.display = 'none';
        };
    }

    exportarDatos() {
        const datos = {
            reservas: this.state.reservas,
            usuarios: this.state.usuarios,
            exportado: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cancha-ranger-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.mostrarNotificacion('Datos exportados correctamente', 'success');
    }

    limpiarSistema() {
        if (confirm('¿ESTÁS SEGURO? Esto eliminará todas las reservas y datos del sistema.')) {
            if (confirm('¿REALMENTE SEGURO? Esta acción no se puede deshacer.')) {
                localStorage.removeItem('canchaRanger_reservas');
                localStorage.removeItem('canchaRanger_usuarios');
                localStorage.removeItem('canchaRanger_usuarioActual');
                this.state.reservas = [];
                this.state.usuarios = [];
                this.state.usuarioActual = null;
                this.mostrarNotificacion('Sistema limpiado correctamente', 'success');
                document.getElementById('adminModal').style.display = 'none';
                this.actualizarInterfaz();
            }
        }
    }

    iniciarActualizacionTiempoReal() {
        console.log('🔄 Iniciando actualización en tiempo real...');
        // Actualizar cada 30 segundos
        setInterval(() => {
            this.actualizarEstadoTiempoReal();
        }, 30000);
    }

    actualizarEstadoTiempoReal() {
        this.actualizarCanchas();
        this.actualizarCalendario();
        this.actualizarSelectorHoras();
        this.actualizarEstadisticas();
        
        // Actualizar indicador
        const indicador = document.getElementById('estadoIndicador');
        if (indicador) {
            indicador.innerHTML = `<i class="fas fa-circle"></i> Actualizado: ${new Date().toLocaleTimeString()}`;
        }
    }

    imprimirReserva(reservaId) {
        console.log('🖨️ Imprimiendo reserva:', reservaId);
        const reserva = this.state.reservas.find(r => r.id === reservaId);
        if (!reserva) return;
        
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const ventanaImpresion = window.open('', '_blank');
        ventanaImpresion.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Reserva - Cancha Ranger</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .comprobante { border: 2px solid #000; padding: 20px; max-width: 500px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .detalle { margin: 10px 0; }
                    .codigo { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
                    .footer { margin-top: 30px; font-size: 12px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="comprobante">
                    <div class="header">
                        <h1>Cancha Ranger</h1>
                        <h2>Comprobante de Reserva</h2>
                    </div>
                    <div class="detalle"><strong>Código:</strong> ${reserva.codigoReserva}</div>
                    <div class="detalle"><strong>Cancha:</strong> ${cancha?.nombre}</div>
                    <div class="detalle"><strong>Fecha:</strong> ${this.formatearFechaLegible(reserva.fecha)}</div>
                    <div class="detalle"><strong>Horario:</strong> ${reserva.horaInicio}:00 - ${reserva.horaFin}:00</div>
                    <div class="detalle"><strong>Cliente:</strong> ${reserva.usuario.nombre}</div>
                    <div class="detalle"><strong>Total:</strong> ${reserva.total} Bs</div>
                    <div class="codigo">${reserva.codigoReserva}</div>
                    <div class="footer">
                        <p>Presentar este código al llegar al establecimiento</p>
                        <p>Teléfono: 73811600 - 73220922</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    }
}

// ===== INICIALIZACIÓN DEL SISTEMA =====
document.addEventListener('DOMContentLoaded', function() {
    // Crear instancia global del sistema
    window.sistema = new SistemaCanchaRanger();

    // Inicializar componentes adicionales
    inicializarNavegacion();
    inicializarModales();
    inicializarFormularios();
});

// ===== FUNCIONES DE INICIALIZACIÓN =====
function inicializarNavegacion() {
    // Hamburguesa menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll header effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header-profesional');
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Cerrar sesión
    document.getElementById('btnLogout')?.addEventListener('click', () => {
        window.sistema.cerrarSesion();
    });

    // Login modal
    document.getElementById('btnLogin')?.addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'block';
        window.sistema.mostrarLogin();
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
            }
        });
    });
}

function inicializarModales() {
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });

    // Cerrar modales con botón X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function inicializarFormularios() {
    // Validación en tiempo real
    document.addEventListener('input', (e) => {
        if (e.target.type === 'email') {
            validarEmailEnTiempoReal(e.target);
        }
        if (e.target.type === 'tel') {
            validarTelefonoEnTiempoReal(e.target);
        }
    });

    // Prevenir envío de formularios
    document.addEventListener('submit', (e) => {
        e.preventDefault();
    });
}

function validarEmailEnTiempoReal(input) {
    const isValid = window.sistema.validarEmail(input.value);
    input.style.borderColor = isValid ? '#28a745' : '#dc3545';
}

function validarTelefonoEnTiempoReal(input) {
    const isValid = window.sistema.validarTelefono(input.value);
    input.style.borderColor = isValid ? '#28a745' : '#dc3545';
}

// ===== POLYFILLS Y COMPATIBILIDAD =====
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) return String(this);
        targetLength = targetLength - this.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(this);
    };
}