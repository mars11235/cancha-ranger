// ===== SISTEMA PROFESIONAL CANCHA RANGER - VERSIÓN COMPLETA Y CORREGIDA =====

class SistemaCanchaRanger {
    constructor() {
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
                imagen: "https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
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
                imagen: "https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
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
                imagen: "https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
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
                imagen: "https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
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

        this.init();
    }

    init() {
        this.inicializarDatos();
        this.inicializarEventListeners();
        this.inicializarComponentes();
        this.actualizarInterfaz();
        console.log('🚀 Sistema Cancha Ranger inicializado');
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
            }
        ];

        this.state.reservas = reservasEjemplo;
        this.guardarDatos('reservas', this.state.reservas);
    }

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
            return false;
        }
    }

    // ===== SISTEMA DE USUARIOS =====
    registrarUsuario(usuario) {
        if (!usuario.nombre || !usuario.email || !usuario.telefono || !usuario.password) {
            this.mostrarNotificacion('Todos los campos son obligatorios', 'error');
            return;
        }

        if (usuario.password.length < 6) {
            this.mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        const usuarioExistente = this.state.usuarios.find(u => u.email === usuario.email);
        if (usuarioExistente) {
            this.mostrarNotificacion('Ya existe un usuario con este email', 'error');
            return;
        }

        const nuevoUsuario = {
            id: this.generarId(),
            ...usuario,
            fechaRegistro: new Date().toISOString()
        };

        this.state.usuarios.push(nuevoUsuario);
        this.guardarDatos('usuarios', this.state.usuarios);
        
        this.mostrarNotificacion('¡Cuenta creada exitosamente!', 'success');
        document.querySelector('.register-form').style.display = 'none';
        document.querySelector('.login-form').style.display = 'block';
        
        // Limpiar formulario
        document.getElementById('regNombre').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPhone').value = '';
        document.getElementById('regPassword').value = '';
    }

    iniciarSesion(credenciales) {
        const { email, password } = credenciales;
        
        if (!email || !password) {
            this.mostrarNotificacion('Email y contraseña son obligatorios', 'error');
            return;
        }

        // Verificar si es admin
        if (email === this.config.adminCredentials.usuario && 
            password === this.config.adminCredentials.password) {
            this.state.usuarioActual = {
                nombre: 'Administrador',
                email: email,
                esAdmin: true
            };
            this.guardarDatos('usuarioActual', this.state.usuarioActual);
            this.actualizarEstadoUsuario();
            document.getElementById('loginModal').style.display = 'none';
            this.mostrarNotificacion('¡Bienvenido Administrador!', 'success');
            return;
        }

        const usuario = this.state.usuarios.find(u => u.email === email && u.password === password);
        if (usuario) {
            this.state.usuarioActual = usuario;
            this.guardarDatos('usuarioActual', this.state.usuarioActual);
            this.actualizarEstadoUsuario();
            document.getElementById('loginModal').style.display = 'none';
            this.mostrarNotificacion(`¡Bienvenido ${usuario.nombre}!`, 'success');
            
            // Limpiar formulario
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } else {
            this.mostrarNotificacion('Email o contraseña incorrectos', 'error');
        }
    }

    cerrarSesion() {
        this.state.usuarioActual = null;
        this.guardarDatos('usuarioActual', null);
        this.actualizarEstadoUsuario();
        this.mostrarNotificacion('Sesión cerrada correctamente', 'success');
    }

    // ===== INTERFAZ =====
    inicializarEventListeners() {
        // Modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Login/Registro
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

        // Cerrar modal al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Login
        document.getElementById('btnIniciarSesion')?.addEventListener('click', () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            this.iniciarSesion({ email, password });
        });

        // Registro
        document.getElementById('btnRegistrarUsuario')?.addEventListener('click', () => {
            const usuario = {
                nombre: document.getElementById('regNombre').value,
                email: document.getElementById('regEmail').value,
                telefono: document.getElementById('regPhone').value,
                password: document.getElementById('regPassword').value
            };
            this.registrarUsuario(usuario);
        });

        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            this.cerrarSesion();
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

        // Calendario - CORREGIDO
        document.getElementById('prev-mes')?.addEventListener('click', () => {
            this.mesActual--;
            if (this.mesActual < 0) {
                this.mesActual = 11;
                this.añoActual--;
            }
            this.generarCalendario();
        });

        document.getElementById('next-mes')?.addEventListener('click', () => {
            this.mesActual++;
            if (this.mesActual > 11) {
                this.mesActual = 0;
                this.añoActual++;
            }
            this.generarCalendario();
        });

        // Filtro de horario
        document.getElementById('filtroHorario')?.addEventListener('change', (e) => {
            this.state.filtroHorario = e.target.value;
            this.actualizarHorarios();
        });

        // Menú hamburguesa
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });
    }

    inicializarComponentes() {
        this.generarHTMLCanchas();
        this.generarHTMLListaCanchas();
        this.generarCalendario(); // CORREGIDO - Ahora se llama correctamente
        this.actualizarHorarios();
        this.actualizarEstadoTiempoReal();
        this.mostrarResumenReserva();
    }

    actualizarInterfaz() {
        this.actualizarEstadoUsuario();
        this.actualizarEstadoTiempoReal();
    }

    actualizarEstadoUsuario() {
        const loginText = document.getElementById('loginText');
        const btnLogin = document.getElementById('btnLogin');
        const btnLogout = document.getElementById('btnLogout');
        const linkAreaUsuario = document.getElementById('linkAreaUsuario');
        const historialRapido = document.getElementById('historialRapido');

        if (this.state.usuarioActual) {
            loginText.textContent = this.state.usuarioActual.nombre;
            btnLogin.style.display = 'none';
            btnLogout.style.display = 'block';
            linkAreaUsuario.style.display = 'block';
            
            // Mostrar historial rápido si es usuario normal
            if (historialRapido && !this.state.usuarioActual.esAdmin) {
                historialRapido.style.display = 'block';
                this.actualizarHistorialRapido();
            }
        } else {
            loginText.textContent = 'Mi Cuenta';
            btnLogin.style.display = 'block';
            btnLogout.style.display = 'none';
            linkAreaUsuario.style.display = 'none';
            
            if (historialRapido) {
                historialRapido.style.display = 'none';
            }
        }
    }

    // ===== SISTEMA DE CANCHAS =====
    generarHTMLCanchas() {
        const canchasGrid = document.getElementById('canchasGrid');
        if (!canchasGrid) return;

        canchasGrid.innerHTML = this.canchas.map(cancha => `
            <div class="cancha-card-profesional">
                <div class="cancha-imagen-container">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" class="cancha-imagen">
                    <div class="cancha-badge">${cancha.tipo}</div>
                    <div class="cancha-overlay">
                        <button class="btn-ver-detalles" onclick="mostrarDetallesCancha(${cancha.id})">
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
                        <button class="btn-reservar-profesional" onclick="seleccionarCancha(${cancha.id})">
                            <i class="fas fa-calendar-plus"></i>
                            Reservar Ahora
                        </button>
                        <button class="btn-whatsapp-cancha" onclick="whatsappService.generarEnlaceConsultaRapida(${cancha.id})">
                            <i class="fab fa-whatsapp"></i>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generarHTMLListaCanchas() {
        const canchasLista = document.getElementById('canchasLista');
        if (!canchasLista) return;

        canchasLista.innerHTML = this.canchas.map(cancha => `
            <div class="cancha-item-lista" data-id="${cancha.id}" onclick="seleccionarCancha(${cancha.id})">
                <div class="cancha-lista-imagen">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}">
                </div>
                <div class="cancha-lista-info">
                    <h4>${cancha.nombre}</h4>
                    <div class="cancha-tipo-lista">${cancha.tipo}</div>
                    <div class="cancha-precio-lista">${cancha.precio} Bs/hora</div>
                </div>
                <div class="estado-badge ${cancha.estado}">${cancha.estado}</div>
            </div>
        `).join('');
    }

    mostrarDetallesCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        const modalBody = document.getElementById('detallesCanchaBody');
        modalBody.innerHTML = `
            <div class="detalles-cancha-container">
                <div class="detalles-imagen">
                    <img src="${cancha.imagen}" alt="${cancha.nombre}">
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
                        <button class="btn btn-primary" onclick="seleccionarCancha(${cancha.id}); document.getElementById('detallesModal').style.display='none'">
                            <i class="fas fa-calendar-plus"></i> Reservar Esta Cancha
                        </button>
                        <button class="btn btn-secondary" onclick="whatsappService.generarEnlaceConsultaRapida(${cancha.id})">
                            <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('detallesModal').style.display = 'block';
    }

    // ===== SISTEMA DE RESERVAS =====
    seleccionarCancha(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) {
            this.mostrarNotificacion('Cancha no encontrada', 'error');
            return;
        }

        this.state.canchaSeleccionada = cancha;
        
        // Actualizar UI
        document.querySelectorAll('.cancha-item-lista').forEach(item => {
            item.classList.remove('seleccionada');
        });
        document.querySelector(`.cancha-item-lista[data-id="${canchaId}"]`)?.classList.add('seleccionada');

        this.mostrarNotificacion(`Cancha ${cancha.nombre} seleccionada`, 'success');
        this.actualizarProgresoReserva(2);
        this.actualizarHorarios();
        this.mostrarResumenReserva();
        
        // Scroll a reservas
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

        this.mostrarNotificacion(`Fecha ${this.formatearFechaLegible(fecha)} seleccionada`, 'success');
        this.actualizarProgresoReserva(3);
        this.actualizarHorarios();
        this.mostrarResumenReserva();
    }

    seleccionarHora(hora) {
        if (!this.state.fechaSeleccionada) {
            this.mostrarNotificacion('Primero selecciona una fecha', 'error');
            return;
        }

        // Verificar disponibilidad
        if (!this.verificarDisponibilidadHora(this.state.fechaSeleccionada, hora)) {
            this.mostrarNotificacion('Este horario no está disponible', 'error');
            return;
        }

        if (!this.state.horaInicioSeleccionada) {
            this.state.horaInicioSeleccionada = hora;
            this.mostrarNotificacion(`Hora inicio: ${hora}:00 seleccionada`, 'success');
        } else if (!this.state.horaFinSeleccionada && hora > this.state.horaInicioSeleccionada) {
            this.state.horaFinSeleccionada = hora;
            this.mostrarNotificacion(`Hora fin: ${hora}:00 seleccionada`, 'success');
            this.actualizarProgresoReserva(4);
        } else {
            // Resetear selección
            this.state.horaInicioSeleccionada = hora;
            this.state.horaFinSeleccionada = null;
            this.mostrarNotificacion(`Hora inicio: ${hora}:00 seleccionada`, 'success');
        }

        this.actualizarHorarios();
        this.actualizarInfoHoraSeleccion();
        this.mostrarResumenReserva();
    }

    // ===== SISTEMA DE CALENDARIO Y HORARIOS - CORREGIDO =====
    generarCalendario() {
        const diasMes = document.getElementById('diasMes');
        const mesActual = document.getElementById('mes-actual');
        if (!diasMes || !mesActual) return;

        const fecha = new Date(this.añoActual, this.mesActual, 1);
        const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        mesActual.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

        // Obtener primer día del mes y último día
        const primerDia = new Date(this.añoActual, this.mesActual, 1).getDay();
        // Ajustar para que la semana empiece en lunes (0 = lunes, 6 = domingo)
        const primerDiaAjustado = primerDia === 0 ? 6 : primerDia - 1;
        
        const ultimoDia = new Date(this.añoActual, this.mesActual + 1, 0).getDate();

        let html = '';

        // Días vacíos al inicio
        for (let i = 0; i < primerDiaAjustado; i++) {
            html += '<div class="dia-calendario vacio"></div>';
        }

        // Días del mes
        const hoy = new Date().toISOString().split('T')[0];
        
        for (let dia = 1; dia <= ultimoDia; dia++) {
            const fechaCompleta = `${this.añoActual}-${String(this.mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const esPasado = fechaCompleta < hoy;
            const estaSeleccionado = this.state.fechaSeleccionada === fechaCompleta;
            const tieneReservas = this.state.reservas.some(r => r.fecha === fechaCompleta);
            
            let claseExtra = '';
            if (esPasado) {
                claseExtra = 'pasado';
            } else if (estaSeleccionado) {
                claseExtra = 'seleccionado';
            } else if (tieneReservas) {
                claseExtra = 'con-reservas';
            }

            html += `
                <div class="dia-calendario ${claseExtra}" 
                     data-fecha="${fechaCompleta}"
                     onclick="${!esPasado ? `sistema.seleccionarFecha('${fechaCompleta}')` : ''}">
                    ${dia}
                    ${tieneReservas ? '<div class="punto-reserva"></div>' : ''}
                </div>
            `;
        }

        diasMes.innerHTML = html;
    }

    actualizarHorarios() {
        const horariosGrid = document.getElementById('horariosGrid');
        if (!horariosGrid) return;

        if (!this.state.fechaSeleccionada) {
            horariosGrid.innerHTML = '<p class="text-center">Selecciona una fecha para ver los horarios disponibles</p>';
            return;
        }

        let html = '';
        for (let hora = this.config.horarioApertura; hora < this.config.horarioCierre; hora++) {
            const disponible = this.verificarDisponibilidadHora(this.state.fechaSeleccionada, hora);
            const estaSeleccionado = this.state.horaInicioSeleccionada === hora || 
                                   this.state.horaFinSeleccionada === hora;
            const enRango = this.state.horaInicioSeleccionada && 
                           this.state.horaFinSeleccionada &&
                           hora >= this.state.horaInicioSeleccionada && 
                           hora < this.state.horaFinSeleccionada;

            let clase = 'hora-slot';
            if (!disponible) {
                clase += ' ocupado';
            } else if (estaSeleccionado || enRango) {
                clase += ' seleccionado';
            } else {
                clase += ' disponible';
            }

            const onclick = disponible ? `sistema.seleccionarHora(${hora})` : '';

            html += `
                <div class="${clase}" onclick="${onclick}">
                    ${hora}:00
                </div>
            `;
        }

        horariosGrid.innerHTML = html;
        this.actualizarInfoHoraSeleccion();
    }

    verificarDisponibilidadHora(fecha, hora) {
        if (!this.state.canchaSeleccionada) return false;

        // Verificar si hay reservas que se superpongan para esta cancha
        const reservasEnFecha = this.state.reservas.filter(r => 
            r.fecha === fecha && 
            r.canchaId === this.state.canchaSeleccionada.id &&
            r.estado === 'confirmada'
        );

        return !reservasEnFecha.some(reserva => {
            return hora >= reserva.horaInicio && hora < reserva.horaFin;
        });
    }

    // ===== SISTEMA DE RESERVAS COMPLETO =====
    mostrarResumenReserva() {
        const resumenDetalles = document.getElementById('resumenDetalles');
        if (!resumenDetalles) return;

        if (this.validarReservaCompleta()) {
            const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
            const total = horas * this.state.canchaSeleccionada.precio;
            
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
                    <strong>Total a pagar:</strong> ${total} Bs
                </div>
                <button class="btn btn-primary btn-block" onclick="sistema.confirmarReserva()">
                    <i class="fas fa-check-circle"></i>
                    Confirmar Reserva
                </button>
            `;
        } else {
            resumenDetalles.innerHTML = '<p class="resumen-vacio">Completa todos los pasos para ver el resumen</p>';
        }
    }

    async confirmarReserva() {
        if (!this.validarReservaCompleta()) {
            this.mostrarNotificacion('Completa todos los datos de la reserva', 'error');
            return;
        }

        if (!this.state.usuarioActual) {
            this.mostrarNotificacion('Debes iniciar sesión para realizar una reserva', 'error');
            document.getElementById('loginModal').style.display = 'block';
            return;
        }

        this.setLoading(true);
        try {
            const reserva = this.crearReserva();
            this.procesarReserva(reserva);
            this.mostrarConfirmacionReserva(reserva);
            this.resetearSistemaReservas();
        } catch (error) {
            this.mostrarNotificacion('Error al procesar la reserva', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    crearReserva() {
        const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
        const total = horas * this.state.canchaSeleccionada.precio;

        return {
            id: this.generarId(),
            canchaId: this.state.canchaSeleccionada.id,
            fecha: this.state.fechaSeleccionada,
            horaInicio: this.state.horaInicioSeleccionada,
            horaFin: this.state.horaFinSeleccionada,
            usuario: this.state.usuarioActual,
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
        
        // Enviar notificaciones
        if (window.emailService) {
            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            emailService.enviarConfirmacionUsuario(reserva, cancha);
            emailService.enviarNotificacionAdmin(reserva, cancha);
        }
        
        if (window.whatsappService) {
            whatsappService.enviarNotificacionReserva(reserva);
            whatsappService.enviarConfirmacionCliente(reserva);
        }
        
        this.mostrarNotificacion(`¡Reserva confirmada! Código: ${reserva.codigoReserva}`, 'success');
    }

    mostrarConfirmacionReserva(reserva) {
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        alert(`✅ RESERVA CONFIRMADA\n\n🏟️ Cancha: ${cancha?.nombre}\n📆 Fecha: ${this.formatearFechaLegible(reserva.fecha)}\n⏰ Horario: ${reserva.horaInicio}:00 - ${reserva.horaFin}:00\n💰 Total: ${reserva.total} Bs\n🔢 Código: ${reserva.codigoReserva}\n\n📍 Ubicación: Calle 9 de abril entre Ejercito y Murillo Dorado\n📞 Contacto: 73811600 - 73220922`);
    }

    resetearSistemaReservas() {
        this.state.canchaSeleccionada = null;
        this.state.fechaSeleccionada = null;
        this.state.horaInicioSeleccionada = null;
        this.state.horaFinSeleccionada = null;
        
        this.actualizarHorarios();
        this.mostrarResumenReserva();
        this.actualizarProgresoReserva(1);
        
        // Resetear selección en lista
        document.querySelectorAll('.cancha-item-lista').forEach(item => {
            item.classList.remove('seleccionada');
        });
        
        // Resetear selección en calendario
        document.querySelectorAll('.dia-calendario').forEach(dia => {
            dia.classList.remove('seleccionado');
        });
    }

    // ===== ESTADO EN TIEMPO REAL =====
    actualizarEstadoTiempoReal() {
        const estadoCanchas = document.getElementById('estadoCanchas');
        if (!estadoCanchas) return;

        estadoCanchas.innerHTML = this.canchas.map(cancha => {
            const reservasHoy = this.state.reservas.filter(r => 
                r.canchaId === cancha.id && 
                r.fecha === new Date().toISOString().split('T')[0] &&
                r.estado === 'confirmada'
            );
            
            const estado = reservasHoy.length > 0 ? 'ocupado' : 'disponible';
            
            return `
                <div class="estado-cancha-item">
                    <div class="cancha-nombre">${cancha.nombre}</div>
                    <div class="estado ${estado}">${estado.toUpperCase()}</div>
                    <div class="reservas-hoy">${reservasHoy.length} reserva(s) hoy</div>
                </div>
            `;
        }).join('');
    }

    actualizarHistorialRapido() {
        const historialLista = document.getElementById('historialLista');
        if (!historialLista || !this.state.usuarioActual) return;

        const reservasUsuario = this.state.reservas
            .filter(r => r.usuario.email === this.state.usuarioActual.email)
            .slice(0, 5); // Últimas 5 reservas

        if (reservasUsuario.length === 0) {
            historialLista.innerHTML = '<p class="text-center">No tienes reservas recientes</p>';
            return;
        }

        historialLista.innerHTML = reservasUsuario.map(reserva => {
            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            return `
                <div class="historial-item">
                    <div class="historial-info">
                        <strong>${cancha?.nombre}</strong>
                        <span>${this.formatearFechaLegible(reserva.fecha)} - ${reserva.horaInicio}:00 a ${reserva.horaFin}:00</span>
                    </div>
                    <div class="historial-acciones">
                        <span class="estado-badge ${reserva.estado}">${reserva.estado}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== FUNCIONES UTILITARIAS =====
    validarReservaCompleta() {
        return this.state.canchaSeleccionada && 
               this.state.fechaSeleccionada && 
               this.state.horaInicioSeleccionada && 
               this.state.horaFinSeleccionada;
    }

    validarFechaFutura(fecha) {
        const hoy = new Date().toISOString().split('T')[0];
        return fecha >= hoy;
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

    formatearFechaISO(fecha) {
        return fecha.toISOString().split('T')[0];
    }

    actualizarInfoHoraSeleccion() {
        const info = document.getElementById('horaSeleccionInfo');
        if (!info) return;

        if (this.state.horaInicioSeleccionada && this.state.horaFinSeleccionada) {
            const horas = this.state.horaFinSeleccionada - this.state.horaInicioSeleccionada;
            info.textContent = `${this.state.horaInicioSeleccionada}:00 - ${this.state.horaFinSeleccionada}:00 (${horas} hora${horas > 1 ? 's' : ''})`;
        } else if (this.state.horaInicioSeleccionada) {
            info.textContent = `Hora inicio: ${this.state.horaInicioSeleccionada}:00 - Selecciona hora fin`;
        } else {
            info.textContent = 'Selecciona rango de horas (2:00 PM - 10:00 PM)';
        }
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

    setLoading(loading) {
        this.state.isLoading = loading;
        // Puedes agregar aquí un spinner o indicador de carga si quieres
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Por simplicidad usamos alert, pero podrías implementar un sistema de notificaciones más elegante
        if (tipo === 'error') {
            alert('❌ ' + mensaje);
        } else if (tipo === 'success') {
            alert('✅ ' + mensaje);
        } else {
            alert('ℹ️ ' + mensaje);
        }
    }

    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generarCodigoReserva() {
        return 'CR' + Date.now().toString(36).toUpperCase().substr(-6);
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
let sistema;

document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaCanchaRanger();
    
    // Inicializar servicios
    if (typeof EmailService !== 'undefined') {
        window.emailService = new EmailService();
    }
    
    if (typeof WhatsAppService !== 'undefined') {
        window.whatsappService = new WhatsAppService();
        window.whatsappService.init();
    }
});

// Funciones globales para onclick
function mostrarDetallesCancha(canchaId) {
    sistema.mostrarDetallesCancha(canchaId);
}

function seleccionarCancha(canchaId) {
    sistema.seleccionarCancha(canchaId);
}