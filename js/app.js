// Main Application Logic

const appDiv = document.getElementById('app');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-message');

function showNotification(message) {
    toastMsg.textContent = message;
    toastEl.classList.remove('hidden');
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    setTimeout(() => { toastEl.classList.remove('show'); }, 4000);
}

// Global state
let currentRole = null;
let currentUser = null; 

function initApp() {
    renderRoleSelection();
}

function renderHeader(title, showLogout = true) {
    let profileBtn = '';
    if (currentUser) {
        profileBtn = `<button class="btn btn-outline btn-small" onclick="renderProfileView()"><i class="fas fa-user-circle"></i> ${currentUser.name}</button>`;
    }

    return `
        <header class="header container">
            <div class="logo">
                <img src="img/logo.png" alt="Taller Garcia" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <i class="fas fa-screwdriver-wrench" style="display:none;"></i>
                <span class="logo-text">Taller Garcia</span>
            </div>
            <div style="display: flex; gap: 0.75rem; align-items: center;">
                ${profileBtn}
                ${showLogout ? `<button class="btn btn-outline btn-small" onclick="logout()" title="Cerrar Sesión"><i class="fas fa-power-off"></i></button>` : ''}
            </div>
        </header>
    `;
}

window.logout = async function() {
    await store.logout();
    currentRole = null;
    currentUser = null;
    renderRoleSelection();
};

window.setRole = function(role) {
    if (role === 'client') {
        currentRole = role;
        renderClientView();
    } else {
        renderLoginView(role);
    }
};

function renderRoleSelection() {
    appDiv.innerHTML = `
        ${renderHeader('Inicio', false)}
        <div class="container role-selection">
            <div class="text-center" style="margin-bottom: 2rem;">
                <img src="img/logo.png" alt="Logo Taller Garcia" class="logo-welcome" onerror="this.style.display='none';">
                <h1 style="font-size: 3.5rem; margin-bottom: 1rem; background: var(--grad-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Taller Garcia</h1>
                <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                    Excelencia en mecánica y gestión integral para su vehículo.
                </p>
            </div>
            <div class="role-cards">
                <div class="role-card glass" onclick="setRole('client')">
                    <i class="fas fa-car-side"></i>
                    <h3>Portal Clientes</h3>
                    <p>Consulte el progreso de su reparación y su historial de servicios en tiempo real.</p>
                </div>
                <div class="role-card glass" onclick="setRole('staff')">
                    <i class="fas fa-user-gear"></i>
                    <h3>Personal Técnico</h3>
                    <p>Acceso para mecánicos y recepción para gestión de trabajos y actualizaciones.</p>
                </div>
                <div class="role-card glass" onclick="setRole('admin')">
                    <i class="fas fa-shield-halved"></i>
                    <h3>Administración</h3>
                    <p>Control total de operaciones, gestión de personal y analíticas del taller.</p>
                </div>
            </div>
        </div>
    `;
}

function renderLoginView(role) {
    const roleTitle = role === 'admin' ? 'Administración' : 'Personal Técnico';
    appDiv.innerHTML = `
        ${renderHeader('Acceso Restringido', false)}
        <div class="container role-selection">
            <div class="card glass" style="max-width: 450px; width: 100%; padding: 3rem;">
                <div style="text-align: center; margin-bottom: 2.5rem;">
                    <div style="width: 64px; height: 64px; background: var(--grad-primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                        <i class="fas fa-lock" style="font-size: 1.5rem; color: white;"></i>
                    </div>
                    <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${roleTitle}</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Ingrese sus credenciales para continuar</p>
                </div>

                <form id="login-form">
                    <div class="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" class="form-control" id="login-email" required autocomplete="email" placeholder="nombre@empresa.com">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control" id="login-pass" required autocomplete="current-password" placeholder="••••••••">
                    </div>
                    <button type="submit" id="login-btn" class="btn btn-primary w-full" style="margin-top: 1rem;">
                        <span>Ingresar al Sistema</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </form>

                <div class="auth-divider">
                    <span>O continuar con</span>
                </div>

                <button type="button" id="google-login-btn" class="btn btn-outline w-full" style="background: white; color: #1f2937; border: none; font-weight: 600;">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 20px; height: 20px;">
                    Google Account
                </button>

                <button type="button" class="btn btn-outline w-full" style="margin-top: 1.5rem; border: none; color: var(--text-muted); font-size: 0.875rem;" onclick="renderRoleSelection()">
                    <i class="fas fa-chevron-left"></i> Volver al inicio
                </button>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verificando...';
        btn.disabled = true;

        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value.trim();

        const authResult = await store.loginWithEmail(email, pass);

        if (authResult.error) {
            showNotification(authResult.error);
            btn.innerHTML = originalContent;
            btn.disabled = false;
        } else if (authResult.role === role) {
            currentUser = authResult;
            currentRole = role;
            showNotification(`Bienvenido, ${currentUser.name}`);
            if (role === 'admin') await renderAdminView();
            if (role === 'staff') await renderStaffView();
        } else {
            showNotification(`Acceso denegado: Rol ${authResult.role} no autorizado aquí.`);
            await store.logout();
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });

    document.getElementById('google-login-btn').addEventListener('click', async () => {
        const btn = document.getElementById('google-login-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';
        btn.disabled = true;

        const authResult = await store.loginWithGoogle();

        if (authResult.error) {
            showNotification(authResult.error);
            btn.innerHTML = originalContent;
            btn.disabled = false;
        } else if (authResult.role === role) {
            currentUser = authResult;
            currentRole = role;
            showNotification(`Bienvenido, ${currentUser.name}`);
            if (role === 'admin') await renderAdminView();
            if (role === 'staff') await renderStaffView();
        } else {
            showNotification(`Acceso denegado: Rol ${authResult.role} no autorizado aquí.`);
            await store.logout();
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });
}

// Profile View (Change Password)
window.renderProfileView = function() {
    appDiv.innerHTML = `
        ${renderHeader('Mi Perfil')}
        <div class="container">
            <div class="card glass" style="max-width: 500px; margin: 0 auto;">
                <h2 class="card-title"><i class="fas fa-user-cog"></i> Mi Perfil</h2>
                <p style="margin-bottom: 1.5rem;"><strong>Nombre:</strong> ${currentUser.name}<br><strong>Correo:</strong> ${currentUser.email}</p>
                
                <h3 style="margin-bottom: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">Cambiar Contraseña</h3>
                <form id="password-form">
                    <div class="form-group">
                        <label>Nueva Contraseña (mín. 6 caracteres)</label>
                        <input type="password" class="form-control" id="new-pass" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Nueva Contraseña</label>
                        <input type="password" class="form-control" id="confirm-pass" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary" id="pass-btn" style="width: 100%; justify-content: center;">Actualizar Contraseña</button>
                    <button type="button" class="btn btn-outline mt-4" style="width: 100%; justify-content: center;" onclick="currentRole === 'admin' ? renderAdminView() : renderStaffView()">Volver al Panel</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPass = document.getElementById('new-pass').value;
        const confirmPass = document.getElementById('confirm-pass').value;

        if (newPass !== confirmPass) {
            showNotification('Las contraseñas no coinciden');
            return;
        }

        const btn = document.getElementById('pass-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        btn.disabled = true;

        const success = await store.updatePassword(newPass);
        if (success) {
            showNotification('Contraseña actualizada correctamente');
            setTimeout(() => {
                currentRole === 'admin' ? renderAdminView() : renderStaffView();
            }, 1000);
        } else {
            showNotification('Error al actualizar contraseña. Es posible que deba cerrar sesión y volver a entrar.');
            btn.innerHTML = 'Actualizar Contraseña';
            btn.disabled = false;
        }
    });
};


// 2. Admin View
async function renderAdminView() {
    appDiv.innerHTML = `
        ${renderHeader('Panel de Administrador')}
        <div class="container text-center"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Cargando datos...</p></div>
    `;

    const jobs = await store.getJobs();
    
    appDiv.innerHTML = `
        ${renderHeader('Panel de Administrador')}
        <div class="container dashboard-grid">
            <div>
                <div class="card glass" style="margin-bottom: 2rem;">
                    <h2 class="card-title"><i class="fas fa-plus-circle"></i> Nuevo Trabajo</h2>
                    <form id="add-job-form">
                        <div class="form-group">
                            <label>Cliente</label>
                            <input type="text" class="form-control" id="clientName" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono (WhatsApp)</label>
                            <input type="tel" class="form-control" id="phone" required placeholder="Ej: 595975110668">
                        </div>
                        <div class="form-group">
                            <label>Vehículo</label>
                            <input type="text" class="form-control" id="car" required placeholder="Marca, Modelo, Año">
                        </div>
                        <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label>Patente</label>
                                <input type="text" class="form-control" id="plate" required>
                            </div>
                            <div>
                                <label>Kilometraje (Km)</label>
                                <input type="number" class="form-control" id="mileage" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Descripción del Trabajo</label>
                            <input list="service-list" class="form-control" id="description" placeholder="Ej: Cambio de Aceite y Filtro" required>
                            <datalist id="service-list">
                                <option value="Cambio de Aceite y Filtro">
                                <option value="Frenos (Pastillas y Discos)">
                                <option value="Suspensión y Tren Delantero">
                                <option value="Distribución (Correa y Tensores)">
                                <option value="Embrague (Kit completo)">
                                <option value="Alineación y Balanceo">
                                <option value="Diagnóstico Computarizado">
                                <option value="Service Programado (10.000 km)">
                                <option value="Service Programado (20.000 km)">
                                <option value="Service Programado (50.000 km)">
                                <option value="Batería y Sistema Eléctrico">
                                <option value="Alternador y Arranque">
                                <option value="Aire Acondicionado (Carga y Control)">
                                <option value="Inyección (Limpieza de Inyectores)">
                                <option value="Luces e Iluminación">
                                <option value="Neumáticos y Llantas">
                                <option value="Revisión General / Pre-Venta">
                                <option value="Reparación de Motor (Ajuste)">
                                <option value="Sistema de Escape">
                                <option value="Otros (Ver observaciones)">
                            </datalist>
                        </div>
                        <button type="submit" id="add-job-btn" class="btn btn-primary" style="width: 100%; justify-content: center;">Registrar Trabajo</button>
                    </form>
                </div>

                <div class="card glass">
                    <h2 class="card-title"><i class="fas fa-user-plus"></i> Registrar Mecánico</h2>
                    <form id="add-staff-form">
                        <div class="form-group">
                            <label>Nombre del Mecánico</label>
                            <input type="text" class="form-control" id="staff-name" required>
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" class="form-control" id="staff-email" required placeholder="ejemplo@correo.com">
                        </div>
                        <div class="form-group">
                            <label>Contraseña Temporal</label>
                            <input type="password" class="form-control" id="staff-pass" required minlength="6" placeholder="Mínimo 6 caracteres">
                        </div>
                        <button type="submit" id="add-staff-btn" class="btn btn-outline" style="width: 100%; justify-content: center; color: var(--primary); border-color: var(--primary);">Crear Usuario</button>
                    </form>
                </div>
            </div>
            
            <div>
                <div class="card glass">
                    <h2 class="card-title">Trabajos Registrados <span class="status-badge" style="background: var(--glass-border);">${jobs.length}</span></h2>
                    <div class="job-list">
                        ${jobs.length === 0 ? '<p style="color: var(--text-muted);">No hay trabajos registrados.</p>' : ''}
                        ${jobs.map(job => renderJobItem(job, true)).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('add-job-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        btn.disabled = true;

        await store.addJob({
            clientName: document.getElementById('clientName').value,
            phone: document.getElementById('phone').value,
            car: document.getElementById('car').value,
            plate: document.getElementById('plate').value,
            mileage: document.getElementById('mileage').value,
            description: document.getElementById('description').value,
        });
        showNotification('Trabajo registrado exitosamente');
        renderAdminView();
    });

    document.getElementById('add-staff-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('add-staff-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
        btn.disabled = true;

        const success = await store.addUser({
            name: document.getElementById('staff-name').value,
            email: document.getElementById('staff-email').value,
            role: 'staff'
        }, document.getElementById('staff-pass').value);
        
        if (success) {
            showNotification('Mecánico creado exitosamente');
            document.getElementById('add-staff-form').reset();
        } else {
            showNotification('Error: Este correo ya está registrado.');
        }
        btn.innerHTML = 'Crear Usuario';
        btn.disabled = false;
    });
}

// 3. Staff View
async function renderStaffView() {
    appDiv.innerHTML = `
        ${renderHeader('Panel de Mecánicos')}
        <div class="container text-center"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Cargando datos...</p></div>
    `;

    const jobs = await store.getJobs();
    const activeJobs = jobs.filter(j => j.status !== 'completed');
    const completedJobs = jobs.filter(j => j.status === 'completed');
    
    appDiv.innerHTML = `
        ${renderHeader('Panel de Mecánicos')}
        <div class="container">
            <div class="card glass">
                <h2 class="card-title">Trabajos en Curso</h2>
                <div class="job-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem;">
                    ${activeJobs.length === 0 ? '<p style="color: var(--text-muted);">No hay trabajos asignados en curso.</p>' : ''}
                    ${activeJobs.map(job => renderJobItem(job, false)).join('')}
                </div>
            </div>
            ${completedJobs.length > 0 ? `
                <div class="card glass mt-4">
                    <h2 class="card-title">Trabajos Finalizados</h2>
                    <div class="job-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem;">
                        ${completedJobs.slice(0, 10).map(job => renderJobItem(job, false)).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Helper to render a job item
function renderJobItem(job, isAdmin) {
    const statusLabels = {
        'pending': 'Pendiente',
        'progress': 'En Taller',
        'completed': 'Terminado'
    };
    
    return `
        <div class="job-item glass">
            <div class="job-header">
                <div>
                    <div class="job-car">${job.car}</div>
                    <div class="job-client">
                        <span><i class="fas fa-id-card"></i> ${job.plate}</span>
                        <span><i class="fas fa-user"></i> ${job.clientName}</span>
                        <span><i class="fas fa-gauge-high"></i> ${job.mileage || 0} km</span>
                    </div>
                </div>
                <span class="status-badge status-${job.status}">${statusLabels[job.status]}</span>
            </div>
            <div class="job-desc">${job.description}</div>
            
            <div class="job-actions">
                ${job.status !== 'completed' ? `
                    <select class="form-control" style="width: auto; min-width: 140px; padding: 0.5rem;" onchange="updateJob('${job.id}', this.value, '${job.phone}', this)">
                        <option value="pending" ${job.status === 'pending' ? 'selected' : ''}>${statusLabels['pending']}</option>
                        <option value="progress" ${job.status === 'progress' ? 'selected' : ''}>${statusLabels['progress']}</option>
                        <option value="completed">${statusLabels['completed']}</option>
                    </select>
                ` : `<span style="font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-calendar-check"></i> Finalizado: ${new Date(job.dateAdded).toLocaleDateString()}</span>`}
                
                <div style="margin-left: auto; display: flex; gap: 0.75rem;">
                    ${isAdmin ? `
                        <button class="btn btn-outline btn-small" onclick="deleteJob('${job.id}')" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);" title="Eliminar Registro">
                            <i class="fas fa-trash-can"></i>
                        </button>
                    ` : ''}
                    <a href="https://wa.me/${job.phone}?text=Hola%20${encodeURIComponent(job.clientName)},%20te%20escribimos%20de%20Taller%20Garcia..." target="_blank" class="btn btn-whatsapp btn-small" title="Contactar por WhatsApp">
                        <i class="fab fa-whatsapp"></i> Notificar
                    </a>
                </div>
            </div>
        </div>
    `;
}

window.updateJob = async function(id, status, phone, selectEl) {
    selectEl.disabled = true;
    const job = await store.updateJobStatus(id, status);
    
    if (status === 'completed') {
        showNotification('Trabajo finalizado. Notificando al cliente...');
        setTimeout(() => {
            const sendWpp = confirm('¿Desea enviar un mensaje de WhatsApp al cliente informando que el trabajo está listo?');
            if(sendWpp) {
                const text = `Hola ${job.clientName}, te informamos desde Taller Garcia que el trabajo en tu ${job.car} (Patente: ${job.plate}) ha sido FINALIZADO. Ya puedes pasar a retirarlo.`;
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
            }
        }, 1000);
    } else {
        showNotification('Estado actualizado');
    }
    
    if (currentRole === 'admin') renderAdminView();
    if (currentRole === 'staff') renderStaffView();
};

window.deleteJob = async function(id) {
    if (confirm('¿Está seguro de eliminar este trabajo?')) {
        await store.deleteJob(id);
        showNotification('Trabajo eliminado');
        renderAdminView();
    }
};

// 4. Client View
function renderClientView() {
    const savedPlate = localStorage.getItem('taller_client_plate');
    
    if (savedPlate && !appDiv.querySelector('#search-form')) {
        // If we have a saved plate, we could auto-search, 
        // but it's better to show the main portal with the option to go to "My Vehicle"
    }

    appDiv.innerHTML = `
        ${renderHeader('Portal de Clientes', true)}
        <div class="container">
            <div id="client-main-options" class="role-cards" style="margin-top: 0; margin-bottom: 3rem;">
                <div class="role-card glass" onclick="showClientSearch()">
                    <i class="fas fa-magnifying-glass"></i>
                    <h3>Mi Vehículo</h3>
                    <p>Acceda con su patente para ver el estado actual e historial de reparaciones.</p>
                </div>
                <div class="role-card glass" onclick="showClientRegistration()">
                    <i class="fas fa-file-signature"></i>
                    <h3>Registrarme</h3>
                    <p>¿Es su primera vez? Registre sus datos y los de su vehículo para agilizar su atención.</p>
                </div>
            </div>
            
            <div id="client-content-area">
                ${savedPlate ? `<div class="text-center"><button class="btn btn-primary" onclick="searchPlate('${savedPlate}')"><i class="fas fa-car"></i> Ver mi ${savedPlate}</button></div>` : ''}
            </div>
            
            <div class="client-search glass card mt-4" style="text-align: center; padding: 2rem;">
                <h3>¿Necesitas un turno?</h3>
                <p style="color: var(--text-muted); margin: 1rem 0;">Agenda rápidamente escribiéndonos por WhatsApp.</p>
                <a href="https://wa.me/595975110668?text=Hola,%20quisiera%20agendar%20un%20turno%20para%20mi%20vehículo." target="_blank" class="btn btn-whatsapp" style="font-size: 1.1rem; padding: 1rem 2rem;">
                    <i class="fab fa-whatsapp"></i> Agendar por WhatsApp
                </a>
            </div>
        </div>
    `;
}

window.showClientSearch = function() {
    const contentArea = document.getElementById('client-content-area');
    contentArea.innerHTML = `
        <div class="client-search glass card" style="margin-top: 0;">
            <h2 style="margin-bottom: 1rem;"><i class="fas fa-search"></i> Consultar mi Historial</h2>
            <p style="color: var(--text-muted);">Ingrese su número de patente para verificar el estado de su vehículo.</p>
            
            <form id="search-form" class="search-box">
                <input type="text" class="form-control" id="search-plate" placeholder="Ej: AB123CD" required style="text-transform: uppercase;">
                <button type="submit" class="btn btn-primary" id="search-btn"><i class="fas fa-search"></i> Acceder</button>
            </form>
        </div>
        <div id="client-result"></div>
    `;

    document.getElementById('search-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const plate = document.getElementById('search-plate').value.trim().toUpperCase();
        await searchPlate(plate);
    });
};

window.searchPlate = async function(plate) {
    const btn = document.getElementById('search-btn');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        btn.disabled = true;
    }

    const jobs = await store.findJobsByPlate(plate);
    const resultDiv = document.getElementById('client-result') || document.getElementById('client-content-area');
    
    if (jobs && jobs.length > 0) {
        localStorage.setItem('taller_client_plate', plate);
        resultDiv.innerHTML = renderClientStatus(jobs);
    } else {
        resultDiv.innerHTML = `
            <div class="client-status-card glass card text-center">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                <h3>Vehículo no encontrado</h3>
                <p style="color: var(--text-muted);">No se encontró ningún historial asociado a la patente <strong>${plate}</strong>.</p>
                <button class="btn btn-outline mt-4" onclick="showClientRegistration('${plate}')">Registrar mi Vehículo</button>
            </div>
        `;
    }
    
    if (btn) {
        btn.innerHTML = '<i class="fas fa-search"></i> Acceder';
        btn.disabled = false;
    }
};

window.showClientRegistration = function(prefillPlate = '') {
    const contentArea = document.getElementById('client-content-area');
    contentArea.innerHTML = `
        <div class="card glass" style="max-width: 600px; margin: 0 auto;">
            <h2 class="card-title"><i class="fas fa-user-plus"></i> Registro de Nuevo Cliente</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Complete sus datos para que podamos agendar su ingreso al taller.</p>
            
            <form id="client-reg-form">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" class="form-control" id="reg-name" required placeholder="Juan Pérez">
                </div>
                <div class="form-group">
                    <label>Teléfono / WhatsApp</label>
                    <input type="tel" class="form-control" id="reg-phone" required placeholder="54911...">
                </div>
                <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label>Patente</label>
                        <input type="text" class="form-control" id="reg-plate" required style="text-transform: uppercase;" value="${prefillPlate}">
                    </div>
                    <div>
                        <label>Vehículo (Marca/Modelo)</label>
                        <input type="text" class="form-control" id="reg-car" required placeholder="Toyota Corolla">
                    </div>
                </div>
                <div class="form-group">
                    <label>Motivo de Consulta / Falla</label>
                    <textarea class="form-control" id="reg-desc" rows="2" placeholder="Ej: Ruido en el tren delantero"></textarea>
                </div>
                <button type="submit" id="reg-btn" class="btn btn-primary w-full">Enviar Registro</button>
                <button type="button" class="btn btn-outline w-full mt-4" onclick="showClientSearch()">Ya estoy registrado (Buscar Patente)</button>
            </form>
        </div>
    `;

    document.getElementById('client-reg-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        btn.disabled = true;

        const plate = document.getElementById('reg-plate').value.trim().toUpperCase();
        const name = document.getElementById('reg-name').value.trim();
        
        await store.addJob({
            clientName: name,
            phone: document.getElementById('reg-phone').value.trim(),
            car: document.getElementById('reg-car').value.trim(),
            plate: plate,
            description: "REGISTRO INICIAL CLIENTE: " + document.getElementById('reg-desc').value,
            status: 'pending'
        });

        localStorage.setItem('taller_client_plate', plate);
        showNotification('¡Registro enviado! Ya puedes ver tu perfil.');
        searchPlate(plate);
    });
};

function renderClientStatus(jobs) {
    const latestJob = jobs[0];
    const isPending = latestJob.status === 'pending';
    const isProgress = latestJob.status === 'progress' || latestJob.status === 'completed';
    const isCompleted = latestJob.status === 'completed';
    
    let historyHtml = '';
    if (jobs.length > 1 || latestJob.status === 'completed') {
        historyHtml = `
            <h3 style="margin-top: 3rem; margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">
                <i class="fas fa-history"></i> Historial de Servicios
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${jobs.map(job => `
                    <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600;">${new Date(job.dateAdded).toLocaleDateString()}</span>
                            <span style="color: var(--text-muted);"><i class="fas fa-tachometer-alt"></i> ${job.mileage || '-'} km</span>
                        </div>
                        <p style="font-size: 0.9rem; color: var(--text-main);">${job.description}</p>
                        <span class="status-badge status-${job.status}" style="margin-top: 0.5rem; display: inline-block;">${job.status === 'completed' ? 'Finalizado' : 'En Curso'}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    return `
        <div class="client-status-card glass card">
            <h2 class="card-title">Estado Actual: ${latestJob.car} <span class="status-badge status-${latestJob.status}">${latestJob.status === 'pending' ? 'Pendiente' : latestJob.status === 'progress' ? 'En Taller' : 'Listo / Terminado'}</span></h2>
            <div style="display: flex; gap: 2rem; color: var(--text-muted); margin-bottom: 1rem; flex-wrap: wrap;">
                <p><strong>Propietario:</strong> ${latestJob.clientName}</p>
                <p><strong>Patente:</strong> <span style="text-transform: uppercase;">${latestJob.plate}</span></p>
                <p><strong>Kilometraje:</strong> ${latestJob.mileage || 0} km</p>
            </div>
            
            ${latestJob.status !== 'completed' ? `
                <div class="progress-track">
                    <div class="progress-step ${isPending || isProgress ? 'active' : ''} ${isProgress ? 'completed' : ''}">
                        <div class="step-icon"><i class="fas fa-clipboard-list"></i></div>
                        <div class="step-label">Recepcionado</div>
                    </div>
                    <div class="progress-step ${isProgress ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                        <div class="step-icon"><i class="fas fa-tools"></i></div>
                        <div class="step-label">En Reparación</div>
                    </div>
                    <div class="progress-step ${isCompleted ? 'active completed' : ''}">
                        <div class="step-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="step-label">Terminado</div>
                    </div>
                </div>
            ` : `
                <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent); padding: 1rem; border-radius: 8px; text-align: center; color: var(--accent); margin: 2rem 0;">
                    <i class="fas fa-check-circle" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    El último servicio registrado se encuentra <strong>Terminado</strong>.
                </div>
            `}
            
            ${historyHtml}
        </div>
    `;
}

initApp();
