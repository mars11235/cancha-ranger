// ===== SISTEMA PROFESIONAL CANCHA RANGER - VERSIÓN CORREGIDA =====

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
    }

    inicializarComponentes() {
        // Inicializar grid de canchas
        const canchasGrid = document.getElementById('canchasGrid');
        if (canchasGrid) {
            canchasGrid.innerHTML = this.generarHTMLCanchas();
        }

        // Inicializar lista de canchas en sidebar
        const canchasLista = document.getElementById('canchasLista');
        if (canchasLista) {
            canchasLista.innerHTML = this.generarHTMLListaCanchas();
        }

        this.actualizarEstadoUsuario();
    }

    actualizarInterfaz() {
        this.actualizarEstadoUsuario();
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
            <div class="cancha-item-lista" 
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
        
        // Scroll a reservas
        document.getElementById('reservas')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // ===== USUARIOS =====
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
                throw new Error('Credenciales incorrectas');
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

    // ===== UTILIDADES =====
    setLoading(estado) {
        this.state.isLoading = estado;
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        // En un sistema real, aquí mostrarías un toast
        alert(`[${tipo.toUpperCase()}] ${mensaje}`);
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    validarTelefono(telefono) {
        const regex = /^[0-9]{8,15}$/;
        return regex.test(telefono);
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
}

// ===== INICIALIZACIÓN GLOBAL =====
let sistema;

document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaCanchaRanger();
});

// Funciones globales para onclick
function mostrarDetallesCancha(canchaId) {
    sistema.mostrarDetallesCancha(canchaId);
}

function seleccionarCancha(canchaId) {
    sistema.seleccionarCancha(canchaId);
}