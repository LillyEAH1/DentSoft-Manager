document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    // IDs de pacientes válidos
    const validPatientIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
    // ID de empleado válido
    const validEmployeeId = '1001';

    if (validPatientIds.includes(userId)) {
        // Redirigir a VisualUsuario.html
        window.location.href = '../Pages/VisualUsuario.html';
    } else if (userId === validEmployeeId) {
        // Mostrar mensaje de elección
        const choice = confirm('¿Quiere ir a dashboard administrador o dashboard dentista?');
        if (choice) {
            // Redirigir a Front_A_P.html
            window.location.href = '../Pages/Front_A_P.html';
        } else {
            // Redirigir a FrontAdmin.html
            window.location.href = '../Pages/FrontAdmin.html';
        }
    } else {
        alert('ID de usuario no válido');
    }
});