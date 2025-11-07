// ===== SISTEMA PROFESIONAL CANCHA RANGER - VERSIÓN MEJORADA =====

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
                imagen: "https://images.unsplash.com/photo-1592656094267-764a4512aae6?w=400&h=250&fit=crop",
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
                imagen: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&h=250&fit=crop",
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
                imagen: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=400&h=250&fit=crop",
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
                imagen: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=250&fit=crop",
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

        // Estado para el nuevo sistema de reservas
        this.reservaActual = {
            cancha: null,
            fecha: null,
            horario: null,
            datosCliente: null
        };

        this.init();
    }

    init() {
        this.inicializarDatos();
        this.inicializarEventListeners();
        this.inicializarComponentes();
        this.actualizarInterfaz();
        this.inicializarSistemaReservaMejorado();
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

    // ===== SISTEMA DE RESERVA MEJORADO =====
    inicializarSistemaReservaMejorado() {
        this.cargarCanchasSeleccion();
        this.inicializarCalendarioMejorado();
        this.actualizarProgreso(1);
    }

    cargarCanchasSeleccion() {
        const contenedor = document.getElementById('canchasSeleccion');
        if (!contenedor) return;

        const canchasHTML = this.canchas.map(cancha => `
            <div class="cancha-opcion" onclick="sistema.seleccionarCanchaMejorada(${cancha.id})">
                <img src="${cancha.imagen}" alt="${cancha.nombre}" onerror="this.src='https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?w=400&h=250&fit=crop'">
                <h4>${cancha.nombre}</h4>
                <p>${cancha.descripcion}</p>
                <div class="cancha-precio">${cancha.precio} Bs/hora</div>
                <div class="cancha-tipo">${cancha.tipo}</div>
            </div>
        `).join('');

        contenedor.innerHTML = canchasHTML;
    }

    seleccionarCanchaMejorada(canchaId) {
        const cancha = this.canchas.find(c => c.id === canchaId);
        if (!cancha) return;

        this.reservaActual.cancha = cancha;
        
        // Actualizar UI
        document.querySelectorAll('.cancha-opcion').forEach(opcion => {
            opcion.classList.remove('seleccionada');
        });
        
        const opciones = document.querySelectorAll('.cancha-opcion');
        if (opciones[canchaId - 1]) {
            opciones[canchaId - 1].classList.add('seleccionada');
        }

        this.mostrarNotificacion(`✅ Cancha "${cancha.nombre}" seleccionada`, 'success');
        
        // Actualizar lista lateral
        document.querySelectorAll('.cancha-item-lista').forEach(item => {
            item.classList.remove('seleccionada');
        });
        document.querySelector(`.cancha-item-lista[data-id="${canchaId}"]`)?.classList.add('seleccionada');
    }

    inicializarCalendarioMejorado() {
        const contenedor = document.getElementById('calendarioDias');
        if (!contenedor) return;

        const hoy = new Date();
        let html = '';
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date();
            fecha.setDate(hoy.getDate() + i);
            const fechaStr = fecha.toISOString().split('T')[0];
            const diaNumero = fecha.getDate();
            const diaNombre = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
            
            const disponible = this.verificarDisponibilidadFecha(fechaStr);
            const seleccionado = this.reservaActual.fecha === fechaStr;
            
            let clase = 'dia-calendario';
            if (!disponible) clase += ' no-disponible';
            if (seleccionado) clase += ' seleccionado';
            
            const onclick = disponible ? `sistema.seleccionarFechaMejorada('${fechaStr}')` : '';
            
            html += `
                <div class="${clase}" onclick="${onclick}">
                    <span class="dia-nombre">${diaNombre}</span>
                    <span class="dia-numero">${diaNumero}</span>
                </div>
            `;
        }
        
        contenedor.innerHTML = html;
    }

    seleccionarFechaMejorada(fecha) {
        this.reservaActual.fecha = fecha;
        
        // Actualizar UI
        this.inicializarCalendarioMejorado();
        this.cargarHorariosDisponiblesMejorados();
        
        // Actualizar información de fecha
        const fechaInfo = document.getElementById('fechaSeleccionadaInfo');
        if (fechaInfo) {
            fechaInfo.textContent = this.formatearFechaLegible(fecha);
        }
        
        this.mostrarNotificacion(`📅 Fecha seleccionada: ${this.formatearFechaLegible(fecha)}`, 'success');
    }

    cargarHorariosDisponiblesMejorados() {
        if (!this.reservaActual.fecha || !this.reservaActual.cancha) return;
        
        const contenedor = document.getElementById('horariosMejorados');
        if (!contenedor) return;

        let html = '';
        for (let hora = this.config.horarioApertura; hora < this.config.horarioCierre; hora++) {
            const disponible = this.verificarDisponibilidadHora(this.reservaActual.fecha, hora);
            const seleccionado = this.reservaActual.horario === hora;
            
            let clase = 'hora-opcion';
            if (!disponible) clase += ' no-disponible';
            if (seleccionado) clase += ' seleccionado';
            
            const onclick = disponible ? `sistema.seleccionarHorarioMejorado(${hora})` : '';
            
            html += `
                <div class="${clase}" onclick="${onclick}">
                    ${hora}:00
                </div>
            `;
        }
        
        contenedor.innerHTML = html;
    }

    seleccionarHorarioMejorado(hora) {
        this.reservaActual.horario = hora;
        
        // Actualizar UI
        this.cargarHorariosDisponiblesMejorados();
        this.actualizarInfoHorarioSeleccionado();
        
        this.mostrarNotificacion(`⏰ Horario seleccionado: ${hora}:00`, 'success');
    }

    actualizarInfoHorarioSeleccionado() {
        const contenedor = document.getElementById('infoHorarioSeleccionado');
        if (!contenedor) return;

        if (this.reservaActual.horario) {
            contenedor.innerHTML = `
                <p><strong>Horario seleccionado:</strong> ${this.reservaActual.horario}:00</p>
                <p><strong>Duración:</strong> 1 hora</p>
                <p><strong>Precio:</strong> ${this.reservaActual.cancha?.precio || 0} Bs</p>
            `;
        } else {
            contenedor.innerHTML = '<p>Selecciona un horario para ver los detalles</p>';
        }
    }

    actualizarResumenReserva() {
        const contenedor = document.getElementById('resumenReservaMejorado');
        if (!contenedor) return;

        if (this.reservaActual.cancha && this.reservaActual.fecha && this.reservaActual.horario) {
            const total = this.reservaActual.cancha.precio;
            
            contenedor.innerHTML = `
                <div class="resumen-item">
                    <span>Cancha:</span>
                    <span>${this.reservaActual.cancha.nombre}</span>
                </div>
                <div class="resumen-item">
                    <span>Fecha:</span>
                    <span>${this.formatearFechaLegible(this.reservaActual.fecha)}</span>
                </div>
                <div class="resumen-item">
                    <span>Horario:</span>
                    <span>${this.reservaActual.horario}:00 - ${this.reservaActual.horario + 1}:00</span>
                </div>
                <div class="resumen-item">
                    <span>Duración:</span>
                    <span>1 hora</span>
                </div>
                <div class="resumen-item resumen-total">
                    <span>Total a pagar:</span>
                    <span>${total} Bs</span>
                </div>
            `;
        } else {
            contenedor.innerHTML = '<p>Completa todos los pasos para ver el resumen</p>';
        }
    }

    validarReservaCompleta() {
        return this.reservaActual.cancha && 
               this.reservaActual.fecha && 
               this.reservaActual.horario;
    }

    confirmarReservaMejorada() {
        if (!this.validarReservaCompleta()) {
            this.mostrarNotificacion('❌ Completa todos los pasos antes de confirmar', 'error');
            return;
        }

        // Validar datos del cliente
        const nombre = document.getElementById('clienteNombre')?.value;
        const email = document.getElementById('clienteEmail')?.value;
        const telefono = document.getElementById('clienteTelefono')?.value;

        if (!nombre || !email || !telefono) {
            this.mostrarNotificacion('❌ Completa todos tus datos personales', 'error');
            return;
        }

        // Crear reserva
        const reserva = {
            id: this.generarId(),
            canchaId: this.reservaActual.cancha.id,
            fecha: this.reservaActual.fecha,
            horaInicio: this.reservaActual.horario,
            horaFin: this.reservaActual.horario + 1,
            usuario: {
                nombre: nombre,
                email: email,
                telefono: telefono
            },
            estado: "confirmada",
            total: this.reservaActual.cancha.precio,
            timestamp: new Date().toISOString(),
            codigoReserva: this.generarCodigoReserva(),
            pagado: false
        };

        // Procesar reserva
        this.procesarReserva(reserva);
        this.mostrarConfirmacionReserva(reserva);
        this.reiniciarSistemaReserva();
    }

    reiniciarSistemaReserva() {
        this.reservaActual = {
            cancha: null,
            fecha: null,
            horario: null,
            datosCliente: null
        };
        
        this.actualizarProgreso(1);
        this.cargarCanchasSeleccion();
        this.inicializarCalendarioMejorado();
        this.cargarHorariosDisponiblesMejorados();
        this.actualizarResumenReserva();
        
        // Limpiar formulario
        const formulario = document.getElementById('formularioDatosCliente');
        if (formulario) {
            formulario.querySelectorAll('input, textarea').forEach(input => {
                input.value = '';
            });
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
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" class="cancha-imagen" onerror="this.src='https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?w=400&h=250&fit=crop'">
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
                    <img src="${cancha.imagen}" alt="${cancha.nombre}" onerror="this.src='https://images.unsplash.com/photo-1540753003857-32e3d2f5b9e1?w=100&h=100&fit=crop'">
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
        
        // ===== NOTIFICACIONES INSTANTÁNEAS =====
        
        // 1. WhatsApp al administrador (INSTANTÁNEO)
        if (window.whatsappService) {
            whatsappService.enviarNotificacionInstantanea(reserva);
            whatsappService.enviarAlertaUrgente(reserva);
            whatsappService.programarRecordatorios(reserva);
        }
        
        // 2. WhatsApp al cliente
        if (window.whatsappService) {
            setTimeout(() => {
                whatsappService.enviarConfirmacionCliente(reserva);
            }, 2000); // Pequeño delay para que no se solapen
        }
        
        // 3. Email (si está configurado)
        if (window.emailService) {
            const cancha = this.canchas.find(c => c.id === reserva.canchaId);
            emailService.enviarConfirmacionUsuario(reserva, cancha);
            emailService.enviarNotificacionAdmin(reserva, cancha);
        }
        
        this.mostrarNotificacion(`¡Reserva confirmada! Código: ${reserva.codigoReserva}`, 'success');
    }

    mostrarConfirmacionReserva(reserva) {
        const cancha = this.canchas.find(c => c.id === reserva.canchaId);
        const modalBody = document.getElementById('confirmacionBody');
        
        modalBody.innerHTML = `
            <div class="text-center">
                <div class="success-icon" style="font-size: 4rem; color: var(--success-color); margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 style="color: var(--success-color); margin-bottom: 1rem;">¡Reserva Confirmada!</h3>
                
                <div style="background: var(--secondary-color); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Cancha:</strong>
                        <span>${cancha?.nombre}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Fecha:</strong>
                        <span>${this.formatearFechaLegible(reserva.fecha)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong>Horario:</strong>
                        <span>${reserva.horaInicio}:00 - ${reserva.horaFin}:00</span>
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
                
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Hemos enviado los detalles de tu reserva a tu WhatsApp y correo electrónico.
                </p>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-primary" onclick="document.getElementById('confirmacionModal').style.display='none'">
                        <i class="fas fa-check"></i> Entendido
                    </button>
                    <button class="btn btn-secondary" onclick="whatsappService.enviarConfirmacionCliente(${JSON.stringify(reserva).replace(/"/g, '&quot;')})">
                        <i class="fab fa-whatsapp"></i> Reenviar WhatsApp
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('confirmacionModal').style.display = 'block';
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

    verificarDisponibilidadHora(fecha, hora) {
        if (!this.reservaActual.cancha) return false;

        // Verificar si hay reservas que se superpongan para esta cancha
        const reservasEnFecha = this.state.reservas.filter(r => 
            r.fecha === fecha && 
            r.canchaId === this.reservaActual.cancha.id &&
            r.estado === 'confirmada'
        );

        return !reservasEnFecha.some(reserva => {
            return hora >= reserva.horaInicio && hora < reserva.horaFin;
        });
    }

    verificarDisponibilidadFecha(fecha) {
        if (!this.reservaActual.cancha) return true;
        
        const reservasEnFecha = this.state.reservas.filter(r => 
            r.fecha === fecha && 
            r.canchaId === this.reservaActual.cancha.id &&
            r.estado === 'confirmada'
        );
        
        // Considerar que una cancha tiene múltiples horarios disponibles
        return reservasEnFecha.length < 8; // Máximo 8 reservas por día (de 14:00 a 22:00)
    }

    actualizarHorarios() {
        // Función mantenida para compatibilidad
    }

    actualizarInfoHoraSeleccion() {
        // Función mantenida para compatibilidad
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

    actualizarProgreso(paso) {
        // Ocultar todos los pasos
        document.querySelectorAll('.reserva-paso').forEach(paso => {
            paso.classList.remove('active');
        });
        
        // Mostrar paso actual
        const pasoActual = document.getElementById(`paso${paso}`);
        if (pasoActual) {
            pasoActual.classList.add('active');
        }
        
        // Actualizar indicador de progreso
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index + 1 <= paso) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Actualizar resumen en paso 4
        if (paso === 4) {
            this.actualizarResumenReserva();
        }
    }

    setLoading(loading) {
        this.state.isLoading = loading;
        // Puedes agregar aquí un spinner o indicador de carga si quieres
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Sistema de notificaciones mejorado
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

// ===== FUNCIONES GLOBALES PARA ONCLICK =====
function mostrarDetallesCancha(canchaId) {
    sistema.mostrarDetallesCancha(canchaId);
}

function seleccionarCancha(canchaId) {
    sistema.seleccionarCancha(canchaId);
}

function avanzarPaso(paso) {
    // Validar que se puede avanzar
    if (paso === 2 && !sistema.reservaActual.cancha) {
        sistema.mostrarNotificacion('❌ Primero selecciona una cancha', 'error');
        return;
    }
    
    if (paso === 3 && !sistema.reservaActual.fecha) {
        sistema.mostrarNotificacion('❌ Primero selecciona una fecha', 'error');
        return;
    }
    
    if (paso === 4 && !sistema.reservaActual.horario) {
        sistema.mostrarNotificacion('❌ Primero selecciona un horario', 'error');
        return;
    }
    
    sistema.actualizarProgreso(paso);
}

function retrocederPaso(paso) {
    sistema.actualizarProgreso(paso);
}

function confirmarReservaFinal() {
    sistema.confirmarReservaMejorada();
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