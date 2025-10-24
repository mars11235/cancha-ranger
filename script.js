// ===== SISTEMA PROFESIONAL CANCHA RANGER - VERSIÓN COMPLETA Y CORREGIDA =====

class SistemaCanchaRanger {
    constructor() {
        this.whatsappService = new WhatsAppService();
        this.config = {
            horarioApertura: 14,
            horarioCierre: 22,
            precioWally: 20,
            precioFutsal: 25,
            tiempoMinimoReserva: 1,
            tiempoCancelacion: 12,
            adminCredentials: {
                usuario: 'admin',
                password: 'CanchaRanger2025!'
            },
            whatsappAdmin: '59173811600'
        };

        this.canchas = [
            {
                id: 1,
                nombre: "Cancha 1 Wally",
                tipo: "Voleibol",
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
                tipo: "Voleibol",
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
                tipo: "Voleibol", 
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
                tipo: "Futsal",
                precio: this.config.precioFutsal,
                imagen: "futsal.jpg",
                descripcion: "Cancha sintetica de futsal ideal para torneos.",
                caracteristicas: ["Piso sintético", "Arcos profesionales", "Iluminación LED"],
                estado: "disponible", 
                capacidad: "10v10"
            }
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
            reservaEditando: null
        };

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
        this.whatsappService.init();

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
            if (!this.validarEmail(datosUsuario.email)) {
                throw new Error('El formato del email es inválido');
            }

            if (!this.validarTelefono(datosUsuario.telefono)) {
                throw new Error('El formato del teléfono es inválido');
            }

            if (datosUsuario.password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

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

            const disponible = this.verificarDisponibilidadRangoCompleto(
                this.state.fechaSeleccionada,
                this.state.canchaSeleccionada.id,
                this.state.horaInicioSeleccionada,
                hora
            );

            if (!disponible) {
                this.mostrarNotificacion('Algunas horas en este rango ya están ocupadas', 'error');
                return;
            }

            this.state.horaFinSeleccionada = hora;

            for (let i = this.state.horaInicioSeleccionada; i < this.state.horaFinSeleccionada; i++) {
                const horaElemento = document.querySelector(`.hora-slot[data-hora="${i}"]`);
                if (horaElemento && !horaElemento.classList.contains('ocupado')) {
                    horaElemento.classList.add('seleccionado');
                }
            }

            this.actualizarProgresoReserva(3);
        } else {
            document.querySelectorAll('.hora-slot').forEach(h => h.classList.remove('seleccionado'));
            this.state.horaInicioSeleccionada = hora;
            this.state.horaFinSeleccionada = null;
            const horaElemento = document.querySelector(`.hora-slot[data-hora="${hora}"]`);
            if (horaElemento) horaElemento.classList.add('seleccionado');
        }

        this.actualizarInfoHoraSeleccion();
        this.mostrarResumenReserva();
    }

    // ===== VERIFICACIÓN DE DISPONIBILIDAD =====
    verificarDisponibilidad() {
        if (!this.state.canchaSeleccionada || !this.state.fechaSeleccionada || 
            !this.state.horaInicioSeleccionada || !this.state.horaFinSeleccionada) {
            return false;
        }

        const reservaEditandoId = this.state.reservaEditando ? this.state.reservaEditando.id : null;

        return !this.state.reservas.some(r => 
            r.id !== reservaEditandoId &&
            r.canchaId === this.state.canchaSeleccionada.id && 
            r.fecha === this.state.fechaSeleccionada &&
            r.estado === 'confirmada' &&
            ((r.horaInicio < this.state.horaFinSeleccionada && r.horaFin > this.state.horaInicioSeleccionada))
        );
    }

    verificarDisponibilidadRangoCompleto(fecha, canchaId, horaInicio, horaFin) {
        for (let hora = horaInicio; hora < horaFin; hora++) {
            if (this.estaHoraOcupada(fecha, canchaId, hora)) {
                return false;
            }
        }
        return true;
    }

    estaHoraOcupada(fecha, canchaId, hora) {
        return this.state.reservas.some(r => 
            r.canchaId === canchaId && 
            r.fecha === fecha &&
            r.estado === 'confirmada' &&
            hora >= r.horaInicio && hora < r.horaFin
        );
    }

    async confirmarReserva(datosUsuario = null) {
        this.setLoading(true);

        try {
            const usuario = datosUsuario || this.state.usuarioActual;
            if (!usuario) {
                throw new Error('Debes iniciar sesión o completar tus datos');
            }

            if (!this.validarReservaCompleta()) {
                throw new Error('Completa todos los datos de la reserva');
            }

            if (!this.verificarDisponibilidad()) {
                throw new Error('Lo sentimos, este horario ya no está disponible');
            }

            const reserva = this.crearReserva(usuario);

            this.procesarReserva(reserva);

            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            await this.emailService.enviarConfirmacionUsuario(reserva, cancha);
            await this.emailService.enviarNotificacionAdmin(reserva, cancha);

            this.enviarWhatsAppReserva(reserva);

            this.mostrarConfirmacionReserva(reserva);

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

    // ===== WHATSAPP =====
    enviarWhatsAppReserva(reserva) {
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const horas = reserva.horaFin - reserva.horaInicio;
        const telefonoAdmin = this.config.whatsappAdmin;

        const mensaje = `📅 *NUEVA RESERVA - CANCHA RANGER* 📅

🏟️ *Cancha:* ${cancha.nombre}
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
        const urlWhatsApp = `https://wa.me/${telefonoAdmin}?text=${mensajeCodificado}`;
        window.open(urlWhatsApp, '_blank');

        console.log('📱 WhatsApp preparado para:', telefonoAdmin);
    }

    enviarWhatsAppCancelacion(reserva) {
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const telefonoAdmin = this.config.whatsappAdmin;

        const mensaje = `❌ *CANCELACIÓN DE RESERVA - CANCHA RANGER* ❌

🏟️ *Cancha:* ${cancha.nombre}
👤 *Cliente:* ${reserva.usuario.nombre}
📞 *Teléfono:* ${reserva.usuario.telefono}

📆 *Fecha:* ${this.formatearFechaLegible(reserva.fecha)}
⏰ *Horario:* ${reserva.horaInicio}:00 - ${reserva.horaFin}:00

🔢 *Código de Reserva:* ${reserva.codigoReserva}
⏰ *Cancelado:* ${new Date().toLocaleString('es-ES')}

_Reserva cancelada por el cliente_`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const urlWhatsApp = `https://wa.me/${telefonoAdmin}?text=${mensajeCodificado}`;
        window.open(urlWhatsApp, '_blank');
    }

    // ===== GESTIÓN DE RESERVAS =====
    obtenerReservasUsuario() {
        if (!this.state.usuarioActual) return [];

        return this.state.reservas
            .filter(reserva => reserva.usuario.email === this.state.usuarioActual.email)
            .sort((a, b) => new Date(b.fecha + 'T' + b.horaInicio + ':00') - new Date(a.fecha + 'T' + a.horaInicio + ':00'));
    }

    puedeModificarCancelar(reserva) {
        const ahora = new Date();
        const fechaReserva = new Date(reserva.fecha + 'T' + reserva.horaInicio + ':00');
        const diferenciaHoras = (fechaReserva - ahora) / (1000 * 60 * 60);
        
        return diferenciaHoras >= this.config.tiempoCancelacion;
    }

    async cancelarReservaUsuario(reservaId) {
        this.setLoading(true);

        try {
            const reservaIndex = this.state.reservas.findIndex(r => r.id === reservaId);
            if (reservaIndex === -1) {
                throw new Error('Reserva no encontrada');
            }

            const reserva = this.state.reservas[reservaIndex];

            if (!this.puedeModificarCancelar(reserva)) {
                throw new Error('No puedes cancelar la reserva. Debe ser al menos 12 horas antes.');
            }

            this.state.reservas[reservaIndex].estado = 'cancelada';
            this.guardarDatos('reservas', this.state.reservas);

            this.enviarWhatsAppCancelacion(reserva);

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

        // ===== INTERFAZ Y COMPONENTES =====
    inicializarEventListeners() {
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        document.getElementById('btnLogin')?.addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
        });

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

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        document.getElementById('btnIniciarSesion')?.addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.iniciarSesion({ email, password });
        });

        document.getElementById('btnRegistrarUsuario')?.addEventListener('click', () => {
            const usuario = {
                nombre: document.getElementById('regNombre').value,
                email: document.getElementById('regEmail').value,
                telefono: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value
            };
            this.registrarUsuario(usuario);
        });

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

    inicializarComponentes() {
        const canchasGrid = document.getElementById('canchasGrid');
        if (canchasGrid) {
            canchasGrid.innerHTML = this.generarHTMLCanchas();
        }

        const canchasLista = document.getElementById('canchasLista');
        if (canchasLista) {
            canchasLista.innerHTML = this.generarHTMLListaCanchas();
        }

        this.actualizarEstadoUsuario();
    }

    actualizarInterfaz() {
        this.actualizarEstadoUsuario();
        this.actualizarCalendario();
        this.actualizarEstadoTiempoReal();
    }

    actualizarEstadoUsuario() {
        const loginText = document.getElementById('loginText');
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        const linkAreaUsuario = document.getElementById('linkAreaUsuario');

        if (this.state.usuarioActual) {
            loginText.textContent = this.state.usuarioActual.nombre;
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'block';
            linkAreaUsuario.style.display = 'block';
        } else {
            loginText.textContent = 'Mi Cuenta';
            btnLogin.style.display = 'block';
            btnLogout.style.display = 'none';
            linkAreaUsuario.style.display = 'none';
        }
    }

    // ===== GENERACIÓN DE HTML =====
    generarHTMLCanchas() {
        return this.canchas.map(cancha => `
            <div class="cancha-card-profesional" data-id="${cancha.id}">
                <div class="cancha-imagen-container">
                    <img src="${cancha.imagen}" 
                         alt="${cancha.nombre}"
                         class="cancha-imagen"
                         onerror="this.src='https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'">
                    <div class="cancha-badge ${cancha.tipo.toLowerCase()}">
                        ${cancha.tipo}
                    </div>
                    <div class="cancha-overlay">
                        <button class="btn-ver-detalles" onclick="sistema.mostrarDetallesCancha(${cancha.id})">
                            <i class="fas fa-search"></i> Ver Detalles
                        </button>
                    </div>
                </div>
                <div class="cancha-info-profesional">
                    <h3>${cancha.nombre}</h3>
                    <p class="cancha-descripcion">${cancha.descripcion}</p>
                    
                    <div class="cancha-caracteristicas-profesional">
                        ${cancha.caracteristicas.map(caract => 
                            `<span class="caracteristica-tag">
                                <i class="fas fa-check"></i> ${caract}
                            </span>`
                        ).join('')}
                    </div>
                    
                    <div class="cancha-meta-info">
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${cancha.capacidad}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-bolt"></i>
                            <span>${cancha.estado}</span>
                        </div>
                    </div>
                    
                    <div class="cancha-precio-profesional">
                        <span class="precio">${cancha.precio} Bs</span>
                        <span class="periodo">/ hora</span>
                    </div>
                    
                    <button class="btn-reservar-profesional" onclick="sistema.seleccionarCancha(${cancha.id})">
                        <i class="fas fa-calendar-plus"></i>
                        Reservar Ahora
                    </button>
                </div>
            </div>
        `).join('');
    }

    generarHTMLListaCanchas() {
        return this.canchas.map(cancha => `
            <div class="cancha-item-lista ${this.state.canchaSeleccionada?.id === cancha.id ? 'seleccionada' : ''}" 
                 data-id="${cancha.id}" 
                 onclick="sistema.seleccionarCancha(${cancha.id})">
                <div class="cancha-lista-imagen">
                    <img src="${cancha.imagen}" 
                         alt="${cancha.nombre}"
                         onerror="this.src='https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100'">
                </div>
                <div class="cancha-lista-info">
                    <h4>${cancha.nombre}</h4>
                    <span class="cancha-tipo-lista">${cancha.tipo}</span>
                    <span class="cancha-precio-lista">${cancha.precio} Bs/hora</span>
                </div>
                <div class="cancha-lista-estado">
                    <span class="estado-badge ${cancha.estado}">${cancha.estado}</span>
                </div>
            </div>
        `).join('');
    }

    mostrarDetallesCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        const modal = document.getElementById('detallesModal');
        const body = document.getElementById('detallesCanchaBody');
        
        body.innerHTML = `
            <div class="detalles-cancha-container">
                <div class="detalles-imagen">
                    <img src="${cancha.imagen}" 
                         alt="${cancha.nombre}"
                         onerror="this.src='https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600'">
                </div>
                <div class="detalles-info">
                    <h3>${cancha.nombre}</h3>
                    <div class="detalles-meta">
                        <span class="tipo-badge">${cancha.tipo}</span>
                        <span class="precio-badge">${cancha.precio} Bs/hora</span>
                        <span class="capacidad-badge">${cancha.capacidad}</span>
                    </div>
                    <p class="detalles-descripcion">${cancha.descripcion}</p>
                    
                    <div class="detalles-caracteristicas">
                        <h4><i class="fas fa-star"></i> Características</h4>
                        <ul>
                            ${cancha.caracteristicas.map(caract => 
                                `<li><i class="fas fa-check"></i> ${caract}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="detalles-acciones">
                        <button class="btn btn-primary" onclick="sistema.seleccionarCancha(${cancha.id}); document.getElementById('detallesModal').style.display='none';">
                            <i class="fas fa-calendar-plus"></i>
                            Reservar Esta Cancha
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('detallesModal').style.display='none'">
                            <i class="fas fa-times"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    // ===== FUNCIONES AUXILIARES =====
    setLoading(estado) {
        this.state.isLoading = estado;
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarTelefono(telefono) {
        const regex = /^[0-9]{8,15}$/;
        return regex.test(telefono);
    }

    validarFechaFutura(fecha) {
        const hoy = new Date().toISOString().split('T')[0];
        return fecha >= hoy;
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generarCodigoReserva() {
        return 'CR' + Date.now().toString(36).toUpperCase();
    }

    formatearFechaISO(fecha) {
        return fecha.toISOString().split('T')[0];
    }

    formatearFechaLegible(fecha) {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }

    actualizarProgresoReserva(paso) {
        const steps = document.querySelectorAll('.progress-step');
        steps.forEach((step, index) => {
            if (index + 1 <= paso) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    actualizarCalendario() {
        console.log('Calendario actualizado');
    }

    actualizarSelectorHoras() {
        console.log('Selector de horas actualizado');
    }

    actualizarInfoHoraSeleccion() {
        console.log('Info de hora actualizada');
    }

    mostrarResumenReserva() {
        console.log('Resumen de reserva mostrado');
    }

    mostrarConfirmacionReserva(reserva) {
        this.mostrarNotificacion(`¡Reserva confirmada! Código: ${reserva.codigoReserva}`, 'success');
    }

    resetearSistemaReservas() {
        this.state.canchaSeleccionada = null;
        this.state.fechaSeleccionada = null;
        this.state.horaInicioSeleccionada = null;
        this.state.horaFinSeleccionada = null;
        this.state.reservaEditando = null;
        
        this.actualizarInterfaz();
        this.mostrarNotificacion('Sistema de reservas reiniciado', 'info');
    }

    validarReservaCompleta() {
        return this.state.canchaSeleccionada && 
               this.state.fechaSeleccionada && 
               this.state.horaInicioSeleccionada && 
               this.state.horaFinSeleccionada;
    }

    iniciarActualizacionTiempoReal() {
        setInterval(() => {
            this.actualizarEstadoTiempoReal();
        }, 30000);
    }

    actualizarEstadoTiempoReal() {
        const estadoCanchas = document.getElementById('estadoCanchas');
        if (estadoCanchas) {
            estadoCanchas.innerHTML = this.canchas.map(cancha => `
                <div class="estado-cancha-item">
                    <span class="cancha-nombre">${cancha.nombre}</span>
                    <span class="estado ${cancha.estado}">${cancha.estado}</span>
                </div>
            `).join('');
        }
    }
}

// ===== CLASES AUXILIARES =====
class WhatsAppService {
    init() {
        console.log('WhatsApp Service inicializado');
    }
}

class EmailService {
    async enviarConfirmacionUsuario(reserva, cancha) {
        console.log('Email de confirmación enviado al usuario:', reserva.usuario.email);
    }
    
    async enviarNotificacionAdmin(reserva, cancha) {
        console.log('Notificación enviada al administrador');
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
let sistema;

document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaCanchaRanger();
});