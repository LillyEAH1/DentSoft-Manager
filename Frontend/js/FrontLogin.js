document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const toggleButton = document.querySelector('.toggle');
  const closeButton = document.querySelector('.close');

  toggleButton.addEventListener('click', () => {
    document.querySelector('.container').classList.toggle('active');
  });

  closeButton.addEventListener('click', () => {
    document.querySelector('.container').classList.remove('active');
  });

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const userId = document.getElementById('Username').value;
    const password = document.getElementById('Password').value;

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

  registerForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const repeatPassword = document.getElementById('repeatPassword').value;

    if (password !== repeatPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Aquí puedes agregar la lógica para enviar los datos al servidor
    console.log('Register:', { username, email, password });

    // Redirigir a Front_A_P.html
    window.location.href = '../Pages/Front_A_P.html';
  });
});
