document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const addPatientButton = document.getElementById('addPatientButton');
    const addAppointmentButton = document.getElementById('addAppointmentButton');
    const saveRecipeButton = document.getElementById('saveRecipeButton');
  
    // Cerrar sesión
    logoutButton.addEventListener('click', () => {
      alert('Sesión cerrada.');
    });
  
    // Agregar paciente
    addPatientButton.addEventListener('click', () => {
      alert('Función para agregar paciente.');
    });
  
    // Agendar cita
    addAppointmentButton.addEventListener('click', () => {
      alert('Función para agendar cita.');
    });
  
    // Guardar receta
    saveRecipeButton.addEventListener('click', () => {
      alert('Receta guardada.');
    });
  });
  