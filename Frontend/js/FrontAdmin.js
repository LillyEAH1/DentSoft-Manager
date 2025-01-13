document.addEventListener('DOMContentLoaded', () => {
  const panelBtn = document.getElementById('panelBtn');
  const gestionPacientesBtn = document.getElementById('gestionPacientesBtn');
  const gestionCitasBtn = document.getElementById('gestionCitasBtn');
  const historialClinicoBtn = document.getElementById('historialClinicoBtn');
  const generarRecetasBtn = document.getElementById('generarRecetasBtn');
  const recordatoriosBtn = document.getElementById('recordatoriosBtn');
  const reportesBtn = document.getElementById('reportesBtn');
  const costosBtn = document.getElementById('costosBtn');

  const panelCard = document.getElementById('panelCard');
  const gestionPacientesCard = document.getElementById('gestionPacientesCard');
  const gestionCitasCard = document.getElementById('gestionCitasCard');
  const historialClinicoCard = document.getElementById('historialClinicoCard');
  const generarRecetasCard = document.getElementById('generarRecetasCard');
  const recordatoriosCard = document.getElementById('recordatoriosCard');
  const reportesCard = document.getElementById('reportesCard');
  const costosCard = document.getElementById('costosCard');

  let selectedPacienteId = null;

  panelBtn.addEventListener('click', () => {
    showCard(panelCard);
    loadPanelData();
  });

  gestionPacientesBtn.addEventListener('click', () => {
    showCard(gestionPacientesCard);
    loadPacientes();
  });

  gestionCitasBtn.addEventListener('click', () => {
    showCard(gestionCitasCard);
    loadCitas();
  });

  historialClinicoBtn.addEventListener('click', () => {
    showCard(historialClinicoCard);
    loadHistorialReciente();
  });

  generarRecetasBtn.addEventListener('click', () => {
    showCard(generarRecetasCard);
  });

  recordatoriosBtn.addEventListener('click', () => {
    showCard(recordatoriosCard);
  });

  reportesBtn.addEventListener('click', () => {
    showCard(reportesCard);
  });

  costosBtn.addEventListener('click', () => {
    showCard(costosCard);
    loadCostos();
  });

  function showCard(card) {
    const cards = [
      panelCard,
      gestionPacientesCard,
      gestionCitasCard,
      historialClinicoCard,
      generarRecetasCard,
      recordatoriosCard,
      reportesCard,
      costosCard,
    ];

    cards.forEach(c => c.style.display = 'none');
    card.style.display = 'block';
  }

  // Inicialmente mostrar el panel principal
  showCard(panelCard);

  // Cargar datos del panel
  function loadPanelData() {
    fetch('http://localhost:4000/api/panel-data')
      .then(response => response.json())
      .then(data => {
        document.getElementById('pacientesAsignados').textContent = data.pacientesAsignados;
        document.getElementById('citasDelDia').textContent = data.citasDelDia;
        document.getElementById('procedimientosDelMes').textContent = data.procedimientosDelMes;
      })
      .catch(error => console.error('Error al cargar los datos del panel:', error));

    fetch('http://localhost:4000/api/contadores/pacientes-asignados?numeroDeEmpleado=1001')
      .then(response => response.json())
      .then(data => {
        document.getElementById('contadorPacientesAsignados').textContent = data.total;
      })
      .catch(error => console.error('Error al cargar el contador de pacientes asignados:', error));
  }

  // Cargar pacientes
  function loadPacientes() {
    fetch('http://localhost:4000/api/pacientes')
      .then(response => response.json())
      .then(data => {
        const pacientesTableBody = document.getElementById('pacientesTableBody');
        pacientesTableBody.innerHTML = '';
        data.forEach(paciente => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${paciente.ID_PACIENTE}</td>
            <td>${paciente.NOMBRE}</td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editPaciente(${paciente.ID_PACIENTE})">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deletePaciente(${paciente.ID_PACIENTE})">Eliminar</button>
              <button class="btn btn-info btn-sm" onclick="verHistorial(${paciente.ID_PACIENTE})">Ver Historial</button>
              <button class="btn btn-primary btn-sm" onclick="seleccionarPaciente(${paciente.ID_PACIENTE})">Seleccionar Paciente</button>
            </td>
          `;
          pacientesTableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error al cargar los pacientes:', error));
  }

  // Agregar paciente
  const addPatientForm = document.getElementById('addPatientForm');
  addPatientForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const nombre = document.getElementById('patientName').value;
    const fechaNacimiento = document.getElementById('patientDOB').value;

    fetch('http://localhost:4000/api/pacientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, fechaNacimiento })
    })
    .then(response => response.json())
    .then(data => {
      alert('Paciente agregado con éxito');
      loadPacientes();
      const addPatientModal = new bootstrap.Modal(document.getElementById('addPatientModal'));
      addPatientModal.hide();
    })
    .catch(error => console.error('Error al agregar el paciente:', error));
  });

  // Eliminar paciente
  window.deletePaciente = function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      fetch(`http://localhost:4000/api/pacientes/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        alert('Paciente eliminado con éxito');
        loadPacientes();
      })
      .catch(error => console.error('Error al eliminar el paciente:', error));
    }
  };

  // Editar paciente
  window.editPaciente = function(id) {
    const nombre = prompt('Ingrese el nuevo nombre del paciente:');
    const fechaNacimiento = prompt('Ingrese la nueva fecha de nacimiento del paciente (YYYY-MM-DD):');
    if (nombre && fechaNacimiento) {
      fetch(`http://localhost:4000/api/pacientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, fechaNacimiento })
      })
      .then(response => response.json())
      .then(data => {
        alert('Paciente actualizado con éxito');
        loadPacientes();
      })
      .catch(error => console.error('Error al actualizar el paciente:', error));
    }
  };

  // Cargar citas
  function loadCitas() {
    fetch('http://localhost:4000/api/citas')
      .then(response => response.json())
      .then(data => {
        const citasTableBody = document.getElementById('citasTableBody');
        citasTableBody.innerHTML = '';
        data.forEach(cita => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${cita.ID_CITA}</td>
            <td>${cita.NOMBRE_PACIENTE}</td>
            <td>${cita.FECHA}</td>
            <td>${cita.HORA}</td>
            <td>${cita.ESTADO}</td>
            <td>
              ${cita.ESTADO === 'Pendiente' ? `
                <button class="btn btn-success btn-sm" onclick="aceptarCita(${cita.ID_CITA})">Aceptar</button>
                <button class="btn btn-danger btn-sm" onclick="rechazarCita(${cita.ID_CITA})">Rechazar</button>
              ` : ''}
              ${cita.ESTADO === 'Rechazada' ? `
                <button class="btn btn-warning btn-sm" onclick="reagendarCita(${cita.ID_CITA})">Reagendar</button>
              ` : ''}
            </td>
          `;
          citasTableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error al cargar las citas:', error));
  }

  // Aceptar cita
  window.aceptarCita = function(id) {
    fetch(`http://localhost:4000/api/citas/${id}/aceptar`, {
      method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
      alert('Cita aceptada con éxito');
      loadCitas();
    })
    .catch(error => console.error('Error al aceptar la cita:', error));
  };

  // Rechazar cita
  window.rechazarCita = function(id) {
    fetch(`http://localhost:4000/api/citas/${id}/rechazar`, {
      method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
      alert('Cita rechazada con éxito');
      loadCitas();
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fecha: nuevaFecha, hora: nuevaHora })
      })
      .then(response => response.json())
      .then(data => {
        alert('Cita reagendada con éxito');
        loadCitas();
      })
      .catch(error => console.error('Error al reagendar la cita:', error));
    }
  };

  // Filtrar citas
  document.getElementById('filtroCitas').addEventListener('change', function() {
    const filtro = this.value;
    fetch(`http://localhost:4000/api/citas?estado=${filtro}`)
      .then(response => response.json())
      .then(data => {
        const citasTableBody = document.getElementById('citasTableBody');
        citasTableBody.innerHTML = '';
        data.forEach(cita => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${cita.ID_CITA}</td>
            <td>${cita.NOMBRE_PACIENTE}</td>
            <td>${cita.FECHA}</td>
            <td>${cita.HORA}</td>
            <td>${cita.ESTADO}</td>
            <td>
              ${cita.ESTADO === 'Pendiente' ? `
                <button class="btn btn-success btn-sm" onclick="aceptarCita(${cita.ID_CITA})">Aceptar</button>
                <button class="btn btn-danger btn-sm" onclick="rechazarCita(${cita.ID_CITA})">Rechazar</button>
              ` : ''}
              ${cita.ESTADO === 'Rechazada' ? `
                <button class="btn btn-warning btn-sm" onclick="reagendarCita(${cita.ID_CITA})">Reagendar</button>
              ` : ''}
            </td>
          `;
          citasTableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error al filtrar las citas:', error));
  });

  // Cargar historial reciente
  function loadHistorialReciente() {
    const pacienteId = prompt('Ingrese el ID del paciente para ver el historial reciente:');
    if (pacienteId) {
      fetch(`http://localhost:4000/api/historial-reciente/${pacienteId}`)
        .then(response => response.json())
        .then(data => {
          const historialRecienteContainer = document.getElementById('historialRecienteContainer');
          historialRecienteContainer.innerHTML = '';
          data.forEach(entry => {
            const div = document.createElement('div');
            div.innerHTML = `
              <p><strong>Fecha:</strong> ${entry.FECHA}</p>
              <p><strong>Diagnóstico:</strong> ${entry.DIAGNOSTICO}</p>
              <p><strong>Tratamiento:</strong> ${entry.TRATAMIENTO}</p>
              <hr>
            `;
            historialRecienteContainer.appendChild(div);
          });
        })
        .catch(error => console.error('Error al cargar el historial reciente:', error));
    }
  }

  // Ver historial completo
  window.verHistorial = function(pacienteId) {
    fetch(`http://localhost:4000/api/reporte-completo/${pacienteId}`)
      .then(response => response.json())
      .then(data => {
        const historialCompletoModalBody = document.getElementById('historialCompletoModalBody');
        historialCompletoModalBody.innerHTML = '';
        data.forEach(entry => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p><strong>Fecha:</strong> ${entry.FECHA}</p>
            <p><strong>Diagnóstico:</strong> ${entry.DIAGNOSTICO}</p>
            <p><strong>Tratamiento:</strong> ${entry.TRATAMIENTO}</p>
            <hr>
          `;
          historialCompletoModalBody.appendChild(div);
        });
        const historialCompletoModal = new bootstrap.Modal(document.getElementById('historialCompletoModal'));
        historialCompletoModal.show();
      })
      .catch(error => console.error('Error al cargar el historial completo:', error));
  };

  // Enviar recordatorio
  const enviarRecordatorioForm = document.getElementById('enviarRecordatorioForm');
  enviarRecordatorioForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const mensaje = document.getElementById('mensajeRecordatorio').value;

    fetch('http://localhost:4000/api/recordatorios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mensaje })
    })
    .then(response => response.json())
    .then(data => {
      alert('Recordatorio enviado con éxito');
      document.getElementById('mensajeRecordatorio').value = '';
    })
    .catch(error => console.error('Error al enviar el recordatorio:', error));
  });

  // Enviar receta
  const enviarRecetaForm = document.getElementById('enviarRecetaForm');
  enviarRecetaForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const receta = document.getElementById('receta').value;
    const firma = document.getElementById('firma').value;

    fetch('http://localhost:4000/api/recetas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receta, firma })
    })
    .then(response => response.json())
    .then(data => {
      alert('Receta enviada con éxito');
      document.getElementById('receta').value = '';
      document.getElementById('firma').value = '';
    })
    .catch(error => console.error('Error al enviar la receta:', error));
  });

  // Seleccionar paciente
  window.seleccionarPaciente = function(id) {
    selectedPacienteId = id;
    alert(`Paciente ${id} seleccionado`);
    // Desbloquear todas las tablas menos gestión de citas
    gestionCitasBtn.disabled = true;
    historialClinicoBtn.disabled = false;
    generarRecetasBtn.disabled = false;
    recordatoriosBtn.disabled = false;
    reportesBtn.disabled = false;
    costosBtn.disabled = false;
  };

  // Cargar costos
  function loadCostos() {
    fetch('http://localhost:4000/api/costos')
      .then(response => response.json())
      .then(data => {
        const costosTableBody = document.getElementById('costosTableBody');
        costosTableBody.innerHTML = '';
        data.forEach(costo => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${costo.TRABAJO}</td>
            <td>${costo.COSTO}</td>
            <td><input type="checkbox" class="trabajo-checkbox" data-costo="${costo.COSTO}"></td>
          `;
          costosTableBody.appendChild(row);
        });
      })
      .catch(error => console.error('Error al cargar los costos:', error));
  }

  // Calcular precio final
  document.getElementById('calcularPrecioFinalBtn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.trabajo-checkbox');
    let precioFinal = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        precioFinal += parseFloat(checkbox.getAttribute('data-costo'));
      }
    });
    document.getElementById('precioFinal').textContent = `Precio Final: $${precioFinal.toFixed(2)}`;
  });

  // Generar ticket
  document.getElementById('generarTicketBtn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.trabajo-checkbox');
    const trabajosSeleccionados = [];
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        trabajosSeleccionados.push({
          trabajo: checkbox.closest('tr').children[0].textContent,
          costo: parseFloat(checkbox.getAttribute('data-costo'))
        });
      }
    });

    fetch('http://localhost:4000/api/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pacienteId: selectedPacienteId, trabajos: trabajosSeleccionados })
    })
    .then(response => response.json())
    .then(data => {
      alert('Ticket generado con éxito');
      // Aquí puedes redirigir a VisualUsuario.html o actualizar la interfaz según sea necesario
    })
    .catch(error => console.error('Error al generar el ticket:', error));
  });

  // Generar reporte de paciente
  document.getElementById('reportePacienteBtn').addEventListener('click', function() {
    fetch(`http://localhost:4000/api/reporte-paciente/${selectedPacienteId}`)
      .then(response => response.json())
      .then(data => {
        const reportePacienteModalBody = document.getElementById('reportePacienteModalBody');
        reportePacienteModalBody.innerHTML = '';
        data.forEach(entry => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p><strong>Fecha:</strong> ${entry.FECHA}</p>
            <p><strong>Detalle:</strong> ${entry.DETALLE}</p>
            <hr>
          `;
          reportePacienteModalBody.appendChild(div);
        });
        const reportePacienteModal = new bootstrap.Modal(document.getElementById('reportePacienteModal'));
        reportePacienteModal.show();
      })
      .catch(error => console.error('Error al generar el reporte del paciente:', error));
  });

  // Generar reporte de dentista
  document.getElementById('reporteDentistaBtn').addEventListener('click', function() {
    fetch(`http://localhost:4000/api/reporte-dentista/${selectedPacienteId}`)
      .then(response => response.json())
      .then(data => {
        const reporteDentistaModalBody = document.getElementById('reporteDentistaModalBody');
        reporteDentistaModalBody.innerHTML = '';
        data.forEach(entry => {
          const div = document.createElement('div');
          div.innerHTML = `
            <p><strong>Fecha:</strong> ${entry.FECHA}</p>
            <p><strong>Detalle:</strong> ${entry.DETALLE}</p>
            <hr>
          `;
          reporteDentistaModalBody.appendChild(div);
        });
        const reporteDentistaModal = new bootstrap.Modal(document.getElementById('reporteDentistaModal'));
        reporteDentistaModal.show();
      })
      .catch(error => console.error('Error al generar el reporte del dentista:', error));
  });

  // Inicializar carga de datos
  loadPacientes();
  loadCitas();
});
