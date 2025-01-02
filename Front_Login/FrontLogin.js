document.addEventListener('DOMContentLoaded', () => {
  // Registro
  document.querySelector('.toggle').addEventListener('click', function () {
    console.log('Lápiz clicado, agregando clase "active".');
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('active');
      console.log('Clase "active" añadida.');
    } else {
      console.error('No se encontró el contenedor con clase "container".');
    }
  });

  // Login (return)
  document.querySelector('.close').addEventListener('click', function () {
    console.log('Botón cerrar clicado, removiendo clase "active".');
    const container = document.querySelector('.container');
    if (container) {
      container.classList.remove('active');
      console.log('Clase "active" eliminada.');
    } else {
      console.error('No se encontró el contenedor con clase "container".');
    }
  });
});
