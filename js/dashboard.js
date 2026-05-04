document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    // Simulate dynamic updates
    updateLiveStats();
    
    // Add hover effects to table rows
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            const vehicle = row.querySelector('strong').textContent;
            showNotification(`Abriendo detalles de: ${vehicle}`);
        });
    });
}

function updateLiveStats() {
    // This could connect to Firebase in a real scenario
    console.log('Sistema de gestión listo. Conectado a la base de datos de Taller García.');
}

function showNotification(message) {
    // Reuse existing toast logic if available, or create a simple one
    console.log('NOTIFICACIÓN:', message);
    // For now, just a console log or we could implement a small toast here
}
