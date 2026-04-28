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
        profileBtn = `<button class="btn btn-outline btn-small" onclick="renderProfileView()" style="margin-right: 0.5rem;"><i class="fas fa-user-cog"></i> ${currentUser.name}</button>`;
    }

    return `
        <header class="header container">
            <div class="logo">
                <i class="fas fa-wrench"></i> Taller Garcia
            </div>
            <div>
                ${profileBtn}
                ${showLogout ? `<button class="btn btn-outline btn-small" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Salir</button>` : ''}
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
            <h1 style="margin-bottom: 1rem; font-size: 2.5rem; text-align: center;">Bienvenido</h1>
            <p style="color: var(--text-muted); text-align: center; max-width: 600px;">
                Seleccione su perfil de acceso para ingresar al sistema de gestión.
            </p>
            <div class="role-cards">
                <div class="role-card glass" onclick="setRole('client')">
                    <i class="fas fa-user-car"></i>
                    <h3>Cliente</h3>
                    <p>Consultar el estado e historial de su vehículo.</p>
                </div>
                <div class="role-card glass" onclick="setRole('staff')">
                    <i class="fas fa-tools"></i>
                    <h3>Mecánico / Recepción</h3>
                    <p>Cargar trabajos y actualizar el avance.</p>
                </div>
                <div class="role-card glass" onclick="setRole('admin')">
                    <i class="fas fa-user-shield"></i>
                    <h3>Administrador</h3>
                    <p>Gestión total del taller y personal.</p>
                </div>
            </div>
        </div>
    `;
}

    function renderLoginView(role) {
    const roleTitle = role === 'admin' ? 'Administrador' : 'Mecánico';
    appDiv.innerHTML = `
        ${renderHeader('Acceso Restringido', false)}
        <div class="container role-selection">
            <div class="card glass" style="max-width: 400px; width: 100%; padding: 2rem;">
                <h2 class="card-title" style="justify-content: center; margin-bottom: 1rem;"><i class="fas fa-lock" style="margin-right: 0.5rem;"></i> Acceso ${roleTitle}</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" class="form-control" id="login-email" required autocomplete="email" placeholder="ejemplo@correo.com">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-control" id="login-pass" required autocomplete="current-password">
                    </div>
                    <button type="submit" id="login-btn" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 1rem;">Ingresar</button>
                </form>

                <div style="margin: 1.5rem 0; text-align: center; border-bottom: 1px solid var(--glass-border); line-height: 0.1em;">
                    <span style="background: var(--bg-card); padding: 0 10px; color: var(--text-muted); font-size: 0.85rem;">O ingresar con</span>
                </div>

                <button type="button" id="google-login-btn" class="btn btn-outline" style="width: 100%; justify-content: center; background-color: #ffffff; color: #757575; font-weight: 500; font-family: Roboto, sans-serif; box-shadow: 0 2px 4px 0 rgba(0,0,0,.25); border: none;">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google Logo" style="width: 20px; height: 20px; margin-right: 10px;">
                    Google
                </button>
                <button type="button" class="btn btn-outline" style="width: 100%; justify-content: center; margin-top: 1rem;" onclick="renderRoleSelection()">Volver</button>
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
        btn.disabled = true;

        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value.trim();

        const authResult = await store.loginWithEmail(email, pass);

        if (authResult.error) {
            showNotification(authResult.error);
            btn.innerHTML = 'Ingresar';
            btn.disabled = false;
        } else if (authResult.role === role) {
            currentUser = authResult;
            currentRole = role;
            showNotification(`Bienvenido, ${currentUser.name}`);
            if (role === 'admin') await renderAdminView();
            if (role === 'staff') await renderStaffView();
        } else {
            showNotification(`Su cuenta tiene rol de ${authResult.role}, no de ${role}.`);
            await store.logout();
            btn.innerHTML = 'Ingresar';
            btn.disabled = false;
        }
    });

    document.getElementById('google-login-btn').addEventListener('click', async () => {
        const btn = document.getElementById('google-login-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> Conectando...';
        btn.disabled = true;

        const authResult = await store.loginWithGoogle();

        if (authResult.error) {
            showNotification(authResult.error);
            btn.innerHTML = '<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 20px; height: 20px; margin-right: 10px;"> Google';
            btn.disabled = false;
        } else if (authResult.role === role) {
            currentUser = authResult;
            currentRole = role;
            showNotification(`Bienvenido, ${currentUser.name}`);
            if (role === 'admin') await renderAdminView();
            if (role === 'staff') await renderStaffView();
        } else {
            showNotification(`Su cuenta tiene rol de ${authResult.role}, no de ${role}.`);
            await store.logout();
            btn.innerHTML = '<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 20px; height: 20px; margin-right: 10px;"> Google';
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
                            <input type="tel" class="form-control" id="phone" required placeholder="Ej: 5491123456789">
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
                            <textarea class="form-control" id="description" rows="3" required></textarea>
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
        'progress': 'En Proceso',
        'completed': 'Finalizado'
    };
    
    return `
        <div class="job-item">
            <div class="job-header">
                <div>
                    <div class="job-car">${job.car}</div>
                    <div class="job-client"><i class="fas fa-user"></i> ${job.clientName} | <i class="fas fa-hashtag"></i> ${job.plate} | <i class="fas fa-tachometer-alt"></i> ${job.mileage || 0} km</div>
                </div>
                <span class="status-badge status-${job.status}">${statusLabels[job.status]}</span>
            </div>
            <div class="job-desc">${job.description}</div>
            
            <div class="job-actions">
                ${job.status !== 'completed' ? `
                    <select class="form-control" style="padding: 0.5rem; font-size: 0.875rem; width: auto;" onchange="updateJob('${job.id}', this.value, '${job.phone}', this)">
                        <option value="pending" ${job.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="progress" ${job.status === 'progress' ? 'selected' : ''}>En Proceso</option>
                        <option value="completed">Finalizar</option>
                    </select>
                ` : '<span style="font-size: 0.8rem; color: var(--text-muted);">Completado el ' + new Date(job.dateAdded).toLocaleDateString() + '</span>'}
                
                <div style="margin-left: auto; display: flex; gap: 0.5rem;">
                    ${isAdmin ? `
                        <button class="btn btn-outline btn-small" onclick="deleteJob('${job.id}')" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3);" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                    <a href="https://wa.me/${job.phone}?text=Hola%20${encodeURIComponent(job.clientName)},%20te%20escribimos%20de%20Taller%20Garcia..." target="_blank" class="btn btn-whatsapp btn-small" title="Contactar por WhatsApp">
                        <i class="fab fa-whatsapp"></i>
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
    appDiv.innerHTML = `
        ${renderHeader('Portal de Clientes', true)}
        <div class="container">
            <div class="client-search glass card">
                <h2 style="margin-bottom: 1rem;"><i class="fas fa-search"></i> Consultar Historial y Estado</h2>
                <p style="color: var(--text-muted);">Ingrese su número de patente para verificar el estado de su vehículo y ver reparaciones pasadas.</p>
                
                <form id="search-form" class="search-box">
                    <input type="text" class="form-control" id="search-plate" placeholder="Ej: AB123CD" required style="text-transform: uppercase;">
                    <button type="submit" class="btn btn-primary" id="search-btn"><i class="fas fa-search"></i> Buscar</button>
                </form>
            </div>
            
            <div id="client-result"></div>
            
            <div class="client-search glass card mt-4" style="text-align: center; padding: 2rem;">
                <h3>¿Necesitas un turno?</h3>
                <p style="color: var(--text-muted); margin: 1rem 0;">Agenda rápidamente escribiéndonos por WhatsApp.</p>
                <a href="https://wa.me/5491123456789?text=Hola,%20quisiera%20agendar%20un%20turno%20para%20mi%20vehículo." target="_blank" class="btn btn-whatsapp" style="font-size: 1.1rem; padding: 1rem 2rem;">
                    <i class="fab fa-whatsapp"></i> Agendar por WhatsApp
                </a>
            </div>
        </div>
    `;

    document.getElementById('search-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('search-btn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        btn.disabled = true;

        const plate = document.getElementById('search-plate').value;
        const jobs = await store.findJobsByPlate(plate);
        
        const resultDiv = document.getElementById('client-result');
        if (jobs && jobs.length > 0) {
            resultDiv.innerHTML = renderClientStatus(jobs);
        } else {
            resultDiv.innerHTML = `
                <div class="client-status-card glass card text-center">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
                    <h3>Vehículo no encontrado</h3>
                    <p style="color: var(--text-muted);">No se encontró ningún trabajo asociado a la patente ingresada.</p>
                </div>
            `;
        }
        
        btn.innerHTML = '<i class="fas fa-search"></i> Buscar';
        btn.disabled = false;
    });
}

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
