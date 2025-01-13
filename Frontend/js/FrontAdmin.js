/*document.addEventListener('DOMContentLoaded', () => {
  const panelBtn = document.getElementById('panelBtn');
  const gestionPacientesBtn = document.getElementById('gestionPacientesBtn');
  const gestionCitasBtn = document.getElementById('gestionCitasBtn');
  
  const panelCard = document.getElementById('panelCard');
  const gestionPacientesCard = document.getElementById('gestionPacientesCard');
  const gestionCitasCard = document.getElementById('gestionCitasCard');

  const DENTISTA_ID = 1001; // Cambiar según el dentista actual

  panelBtn?.addEventListener('click', () => showCard(panelCard));
  gestionPacientesBtn?.addEventListener('click', () => {
    showCard(gestionPacientesCard);
    loadPacientes(DENTISTA_ID);
  });
  gestionCitasBtn?.addEventListener('click', () => {
    showCard(gestionCitasCard);
    loadCitas(DENTISTA_ID);
  });

  function showCard(card) {
    const cards = [panelCard, gestionPacientesCard, gestionCitasCard];
    cards.forEach(c => c && (c.style.display = 'none'));
    if (card) card.style.display = 'block';
  }

  // Inicializar el panel principal
  showCard(panelCard);

  // Cargar pacientes asignados al dentista
  function loadPacientes(dentistaId) {
    fetch(`http://localhost:4000/api/pacientes?numeroDeEmpleado=${dentistaId}`)
      .then(response => response.json())
      .then(data => {
        const pacientesTableBody = document.getElementById('pacientesTableBody');
        if (pacientesTableBody) {
          pacientesTableBody.innerHTML = '';
          data.forEach(paciente => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${paciente.ID_PACIENTE}</td>
              <td>${paciente.NOMBRE}</td>
              <td>
                <button class="btn btn-warning btn-sm" onclick="editPaciente(${paciente.ID_PACIENTE})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deletePaciente(${paciente.ID_PACIENTE})">Eliminar</button>
              </td>
            `;
            pacientesTableBody.appendChild(row);
          });
        }
      })
      .catch(error => console.error('Error al cargar los pacientes:', error));
  }

  // Cargar citas asignadas al dentista
  function loadCitas(dentistaId) {
    fetch(`http://localhost:4000/api/citas?dentista=${dentistaId}`)
      .then(response => response.json())
      .then(data => {
        const citasTableBody = document.getElementById('citasTableBody');
        if (citasTableBody) {
          citasTableBody.innerHTML = '';
          data.forEach(cita => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${cita.ID_CITA}</td>
              <td>${cita.ID_PACIENTE}</td>
              <td>${new Date(cita.FECHA_REGISTRO).toLocaleDateString()}</td>
              <td>${new Date(cita.HORA).toLocaleTimeString()}</td>
              <td>${cita.ESTADO_CITA}</td>
              <td>
                ${cita.ESTADO_CITA === 'Pendiente' ? `
                  <button class="btn btn-success btn-sm" onclick="aceptarCita(${cita.ID_CITA})">Aceptar</button>
                  <button class="btn btn-danger btn-sm" onclick="rechazarCita(${cita.ID_CITA})">Rechazar</button>
                ` : ''}
                ${cita.ESTADO_CITA === 'Rechazada' ? `
                  <button class="btn btn-warning btn-sm" onclick="reagendarCita(${cita.ID_CITA})">Reagendar</button>
                ` : ''}
              </td>
            `;
            citasTableBody.appendChild(row);
          });
        }
      })
      .catch(error => console.error('Error al cargar las citas:', error));
  }

  // Agregar paciente
  const addPatientForm = document.getElementById('addPatientForm');
  addPatientForm?.addEventListener('submit', function(event) {
    event.preventDefault();
    const nombre = document.getElementById('patientName')?.value;
    fetch('http://localhost:4000/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, dentistaId: DENTISTA_ID })
    })
      .then(response => response.json())
      .then(data => {
        alert('Paciente agregado con éxito');
        loadPacientes(DENTISTA_ID);
      })
      .catch(error => console.error('Error al agregar el paciente:', error));
  });

  // Eliminar paciente
  window.deletePaciente = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      fetch(`http://localhost:4000/api/pacientes/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
          alert('Paciente eliminado con éxito');
          loadPacientes(DENTISTA_ID);
        })
        .catch(error => console.error('Error al eliminar el paciente:', error));
    }
  };

  // Editar paciente
  window.editPaciente = function(id) {
    const nombre = prompt('Ingrese el nuevo nombre del paciente:');
    if (nombre) {
      fetch(`http://localhost:4000/api/pacientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre })
      })
        .then(response => response.json())
        .then(data => {
          alert('Paciente actualizado con éxito');
          loadPacientes(DENTISTA_ID);
        })
        .catch(error => console.error('Error al actualizar el paciente:', error));
    }
  };

  // Aceptar cita
  window.aceptarCita = function(id) {
    fetch(`http://localhost:4000/api/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Aceptada' })
    })
      .then(response => response.json())
      .then(data => {
        alert('Cita aceptada con éxito');
        loadCitas(DENTISTA_ID);
      })
      .catch(error => console.error('Error al aceptar la cita:', error));
  };

  // Rechazar cita
  window.rechazarCita = function(id) {
    fetch(`http://localhost:4000/api/citas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'Rechazada' })
    })
      .then(response => response.json())
      .then(data => {
        alert('Cita rechazada con éxito');
        loadCitas(DENTISTA_ID);
      })
      .catch(error => console.error('Error al rechazar la cita:', error));
  };

  // Reagendar cita
  window.reagendarCita = function(id) {
    const nuevaFecha = prompt('Ingrese la nueva fecha para la cita (YYYY-MM-DD):');
    const nuevaHora = prompt('Ingrese la nueva hora para la cita (HH:MM):');
    if (nuevaFecha && nuevaHora) {
      fetch(`http://localhost:4000/api/citas/${id}/reagendar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora })
      })
        .then(response => response.json())
        .then(data => {
          alert('Cita reagendada con éxito');
          loadCitas(DENTISTA_ID);
        })
        .catch(error => console.error('Error al reagendar la cita:', error));
    }
  };

  // Inicializar carga de datos
  loadPacientes(DENTISTA_ID);
  loadCitas(DENTISTA_ID);
});*/











