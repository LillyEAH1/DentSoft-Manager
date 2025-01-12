let firma = '';

let selectedPacienteId = null;

// Generar cita
async function obtenerCitas(dentistaId, estado = 'todas') {
  try {
    let url = `http://localhost:3001/api/citas?dentista=${dentistaId}`;
    if (estado !== 'todas') {
      url += `&estado=${estado}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    // Procesa los datos aquí
    renderizarCitas(data);
  } catch (error) {
    console.error('Error al obtener citas:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => obtenerCitas(1001));

document.getElementById('filtro-citas').addEventListener('change', (event) => {
  const estado = event.target.value;
  obtenerCitas(1001, estado);
});

function renderizarCitas(citas) {
  const tbody = document.querySelector('#gestion-citas tbody');
  tbody.innerHTML = ''; // Limpiar tabla
  citas.forEach(cita => {
    const estadoCita = cita[2] === 'P' ? 'Pendiente' : cita[2] === 'A' ? 'Aceptada' : cita[2] === 'R' ? 'Rechazada' : 'Reagendada';
    const row = `
      <tr>
        <td>${cita[0]}</td>
        <td>${cita[5]}</td>
        <td>${cita[1]}</td>
        <td>${cita[3]}</td>
        <td>${estadoCita}</td>
        <td>
          <button class="btn btn-success btn-sm" onclick="actualizarEstadoCita(${cita[0]}, 'A')">Aceptar</button>
          <button class="btn btn-danger btn-sm" onclick="actualizarEstadoCita(${cita[0]}, 'R')">Rechazar</button>
          <button class="btn btn-warning btn-sm d-none reagendar-btn" onclick="mostrarModalReagendar(${cita[0]})">Reagendar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function actualizarEstadoCita(idCita, estado) {
  try {
    const response = await fetch(`http://localhost:3001/api/citas/${idCita}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    // Actualizar la interfaz de usuario
    const row = document.querySelector(`button[onclick="actualizarEstadoCita(${idCita}, '${estado}')"]`).closest('tr');
    row.querySelector('td:nth-child(5)').innerText = estado === 'A' ? 'Aceptada' : estado === 'R' ? 'Rechazada' : 'Reagendada';
    if (estado === 'A') {
      row.querySelectorAll('button').forEach(button => button.remove());
    } else if (estado === 'R') {
      row.querySelectorAll('button').forEach(button => button.classList.add('d-none'));
      const btnReagendar = row.querySelector(`button[onclick="mostrarModalReagendar(${idCita})"]`);
      btnReagendar.classList.remove('d-none');
    }
  } catch (error) {
    console.error('Error al actualizar el estado de la cita:', error);
  }
}

function mostrarModalReagendar(idCita) {
  document.getElementById('idCitaReagendar').value = idCita;
  const modal = new bootstrap.Modal(document.getElementById('reagendarModal'));
  modal.show();
}

async function guardarReagendar() {
  const idCita = document.getElementById('idCitaReagendar').value;
  const fecha = document.getElementById('fechaReagendada').value;
  const hora = document.getElementById('horaReagendada').value;
  const estado = 'Reagendada';

  // Validar que fecha y hora no sean null
  if (!fecha || !hora) {
    alert('Fecha y hora son requeridos');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/api/citas/${idCita}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado, fecha, hora }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    // Actualizar la interfaz de usuario
    const row = document.querySelector(`button[onclick="mostrarModalReagendar(${idCita})"]`).closest('tr');
    row.querySelector('td:nth-child(5)').innerText = 'Reagendada';
    row.querySelector('td:nth-child(3)').innerText = fecha;
    row.querySelector('td:nth-child(4)').innerText = hora;
    row.querySelectorAll('button').forEach(button => button.remove());
    const modal = bootstrap.Modal.getInstance(document.getElementById('reagendarModal'));
    modal.hide();
  } catch (error) {
    console.error('Error al reagendar la cita:', error);
  }
}

// Obtener recordatorios
async function obtenerRecordatorios(dentistaId) {
  try {
    const response = await fetch(`http://localhost:3001/api/recordatorios?dentista=${dentistaId}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    renderizarRecordatorios(data);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => obtenerRecordatorios(1001));

function renderizarRecordatorios(recordatorios) {
  const tbody = document.querySelector('#recordatoriosTableBody');
  tbody.innerHTML = ''; // Limpiar tabla
  recordatorios.forEach(recordatorio => {
    const row = `
      <tr>
        <td>${recordatorio[0]}</td>
        <td>${recordatorio[1]}</td>
        <td>${recordatorio[2]}</td>
        <td>${recordatorio[3]}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function enviarRecordatorio() {
  const pacienteId = document.getElementById('idPacienteRecordatorio').value;
  const mensaje = document.getElementById('mensajeRecordatorio').value;

  try {
    const response = await fetch('http://localhost:3002/api/recordatorios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pacienteId, mensaje }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    alert('Recordatorio enviado correctamente');
    document.getElementById('enviarRecordatorioForm').reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('enviarRecordatorioModal'));
    modal.hide();
  } catch (error) {
    console.error('Error al enviar el recordatorio:', error);
  }
}

// Obtener pacientes
async function obtenerPacientes(numeroDeEmpleado) {
  try {
    const response = await fetch(`http://localhost:3001/api/pacientes?numeroDeEmpleado=${numeroDeEmpleado}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    renderizarPacientes(data);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
  }
}

function renderizarPacientes(pacientes) {
  const tbody = document.querySelector('#patientsTableBody');
  tbody.innerHTML = ''; // Limpiar tabla
  pacientes.forEach(paciente => {
    const row = `
      <tr>
        <td>${paciente.ID_PACIENTE}</td>
        <td>${paciente.NOMBRE}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="verHistorial(${paciente.ID_PACIENTE})">Historial</button>
          <button class="btn btn-warning btn-sm" onclick="editarPaciente(${paciente.ID_PACIENTE})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${paciente.ID_PACIENTE})">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function agregarPaciente() {
  const id = document.getElementById('pacienteId').value;
  const nombre = document.getElementById('pacienteNombre').value;
  const dentistaId = 1001;

  try {
    const response = await fetch('http://localhost:3001/api/pacientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, nombre, dentistaId }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    obtenerPacientes(dentistaId); // Actualizar la lista de pacientes
  } catch (error) {
    console.error('Error al agregar paciente:', error);
  }
}

async function eliminarPaciente(id) {
  try {
    const response = await fetch(`http://localhost:3001/api/pacientes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    obtenerPacientes(1001); // Actualizar la lista de pacientes
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
  }
}

function seleccionarPaciente(id) {
  selectedPacienteId = id;
  // Habilitar las demás tablas
  document.querySelectorAll('.table-container').forEach(container => {
    container.classList.remove('d-none');
  });
}

async function verHistorial(pacienteId) {
  selectedPacienteId = pacienteId;
  try {
    const response = await fetch(`http://localhost:3001/api/historial-reciente/${pacienteId}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    renderizarHistorialReciente(data);
  } catch (error) {
    console.error('Error al obtener el historial clínico reciente:', error);
  }
}

function renderizarHistorialReciente(historial) {
  const tbody = document.querySelector('#historialTableBody');
  tbody.innerHTML = ''; // Limpiar tabla
  historial.forEach(entry => {
    const row = `
      <tr>
        <td>${entry.FECHA}</td>
        <td>${entry.PROCEDIMIENTO}</td>
        <td>${entry.NOTAS}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

async function verHistorialCompleto() {
  if (!selectedPacienteId) {
    alert('Por favor, seleccione un paciente primero.');
    return;
  }
  try {
    const response = await fetch(`http://localhost:3001/api/historial/${selectedPacienteId}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    mostrarHistorialCompleto(data);
  } catch (error) {
    console.error('Error al obtener el historial clínico completo:', error);
  }
}

function mostrarHistorialCompleto(historial) {
  const modalBody = document.querySelector('#historialCompletoModal .modal-body');
  modalBody.innerHTML = ''; // Limpiar modal
  historial.forEach(entry => {
    const row = `
      <div>
        <p><strong>Fecha:</strong> ${entry.FECHA}</p>
        <p><strong>Procedimiento:</strong> ${entry.PROCEDIMIENTO}</p>
        <p><strong>Notas:</strong> ${entry.NOTAS}</p>
        <hr>
      </div>
    `;
    modalBody.innerHTML += row;
  });
  const modal = new bootstrap.Modal(document.getElementById('historialCompletoModal'));
  modal.show();
}

// Duplicate function removed

async function obtenerHistorialClinico(pacienteId) {
  try {
    const response = await fetch(`http://localhost:3001/api/historial-clinico?paciente=${pacienteId}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    renderizarHistorialClinico(data);
  } catch (error) {
    console.error('Error al obtener historial clínico:', error);
  }
}

function renderizarHistorialClinico(historial) {
  const tbody = document.querySelector('#historialClinicoTableBody');
  tbody.innerHTML = ''; // Limpiar tabla
  historial.forEach(entry => {
    const row = `
      <tr>
        <td>${entry[0]}</td>
        <td>${entry[1]}</td>
        <td>${entry[2]}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Obtener costos
async function obtenerCostos() {
  try {
    const response = await fetch('http://localhost:3001/api/costos');
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    renderizarCostos(data);
  } catch (error) {
    console.error('Error al obtener costos:', error);
  }
}

function renderizarCostos(costos) {
  const list = document.querySelector('#costosList');
  list.innerHTML = ''; // Limpiar lista
  costos.forEach(costo => {
    const item = `
      <li class="list-group-item">
        <input type="checkbox" id="costo-${costo.ID_TIPO_DE_TRABAJO}" data-nombre="${costo.NOMBRE_TRABAJO}" data-precio="${costo.COSTO}">
        <label for="costo-${costo.ID_TIPO_DE_TRABAJO}">${costo.NOMBRE_TRABAJO} - $${costo.COSTO}</label>
      </li>
    `;
    list.innerHTML += item;
  });
}

async function generarTicket() {
  if (!selectedPacienteId) {
    alert('Por favor, seleccione un paciente primero.');
    return;
  }

  const items = [];
  document.querySelectorAll('#costosList input[type="checkbox"]:checked').forEach(checkbox => {
    items.push({
      nombre: checkbox.getAttribute('data-nombre'),
      precio: checkbox.getAttribute('data-precio')
    });
  });

  if (items.length === 0) {
    alert('Por favor, seleccione al menos un costo.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pacienteId: selectedPacienteId, items }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    mostrarTicket(items);
  } catch (error) {
    console.error('Error al generar el ticket:', error);
  }
}

function mostrarTicket(items) {
  const modalBody = document.querySelector('#ticketModal .modal-body');
  modalBody.innerHTML = ''; // Limpiar modal
  let total = 0;
  items.forEach(item => {
    total += parseFloat(item.precio);
    const row = `
      <div>
        <p><strong>${item.nombre}:</strong> $${item.precio}</p>
      </div>
    `;
    modalBody.innerHTML += row;
  });
  modalBody.innerHTML += `<hr><p><strong>Total:</strong> $${total}</p>`;
  const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
  modal.show();
}

// Guardar receta
async function guardarReceta() {
  if (!selectedPacienteId) {
    alert('Por favor, seleccione un paciente primero.');
    return;
  }

  const receta = document.getElementById('receta-texto').value;

  if (!receta) {
    alert('Por favor, escriba la receta.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/recetas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pacienteId: selectedPacienteId, receta, firma }),
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    console.log(data.message);
    alert('Receta guardada correctamente');
  } catch (error) {
    console.error('Error al guardar la receta:', error);
  }
}

function abrirModalFirma() {
  const modal = new bootstrap.Modal(document.getElementById('firmaModal'));
  modal.show();
}

function guardarFirma() {
  const firmaInput = document.getElementById('firma-input');
  firma = firmaInput.value;
  const modal = bootstrap.Modal.getInstance(document.getElementById('firmaModal'));
  modal.hide();
}

function limpiarFirma() {
  const firmaInput = document.getElementById('firma-input');
  firmaInput.value = '';
  firma = '';
}

// Obtener reporte por paciente
async function obtenerReportePaciente() {
  if (!selectedPacienteId) {
    alert('Por favor, seleccione un paciente primero.');
    return;
  }
  try {
    const response = await fetch(`http://localhost:3001/api/reporte/paciente/${selectedPacienteId}`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    mostrarReporte(data);
  } catch (error) {
    console.error('Error al obtener el reporte por paciente:', error);
  }
}

// Obtener reporte general
async function obtenerReporteGeneral() {
  try {
    const response = await fetch('http://localhost:3001/api/reporte/general');
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const data = await response.json();
    mostrarReporte(data);
  } catch (error) {
    console.error('Error al obtener el reporte general:', error);
  }
}

function mostrarReporte(reporte) {
  const modalBody = document.querySelector('#reporteModal .modal-body');
  modalBody.innerHTML = ''; // Limpiar modal
  reporte.forEach(entry => {
    const row = `
      <div>
        <p><strong>Fecha:</strong> ${entry.FECHA}</p>
        <p><strong>Procedimiento:</strong> ${entry.PROCEDIMIENTO}</p>
        <p><strong>Notas:</strong> ${entry.NOTAS}</p>
        <hr>
      </div>
    `;
    modalBody.innerHTML += row;
  });
  const modal = new bootstrap.Modal(document.getElementById('reporteModal'));
  modal.show();
}

// Obtener contadores en tiempo real
async function obtenerContadores(numeroDeEmpleado) {
  try {
    const [pacientesAsignados, citasDelDia, trabajosDelMes] = await Promise.all([
      fetch(`http://localhost:3001/api/contadores/pacientes-asignados?numeroDeEmpleado=${numeroDeEmpleado}`)
        .then(res => {
          if (!res.ok) throw new Error('Error en la solicitud: ' + res.statusText);
          return res.json();
        }),
      fetch(`http://localhost:3001/api/contadores/citas-del-dia?numeroDeEmpleado=${numeroDeEmpleado}`)
        .then(res => {
          if (!res.ok) throw new Error('Error en la solicitud: ' + res.statusText);
          return res.json();
        }),
      fetch(`http://localhost:3001/api/contadores/trabajos-del-mes?numeroDeEmpleado=${numeroDeEmpleado}`)
        .then(res => {
          if (!res.ok) throw new Error('Error en la solicitud: ' + res.statusText);
          return res.json();
        })
    ]);

    document.getElementById('pacientesAsignados').innerText = pacientesAsignados.total;
    document.getElementById('citasDelDia').innerText = citasDelDia.total;
    document.getElementById('trabajosDelMes').innerText = trabajosDelMes.total;
  } catch (error) {
    console.error('Error al obtener los contadores:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const numeroDeEmpleado = 1001; // Reemplaza con el número de empleado correspondiente
  obtenerPacientes(numeroDeEmpleado);
  obtenerCostos();
  obtenerContadores(numeroDeEmpleado);
});
