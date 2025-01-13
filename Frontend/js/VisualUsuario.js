const API_BASE_URL = 'http://localhost:4000/api';
let selectedDate = null;

// Función para obtener y renderizar las citas del usuario
async function obtenerCitas() {
  try {
    const response = await fetch(`${API_BASE_URL}/citas?dentista=1001`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const citas = await response.json();
    renderizarCitas(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
  }
}

function renderizarCitas(citas) {
  const tbody = document.getElementById('citas-tbody');
  tbody.innerHTML = '';
  citas.forEach(cita => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cita.FECHA_REGISTRO}</td>
      <td>${cita.HORA}</td>
      <td>${cita.ESTADO_CITA}</td>
      <td>${cita.COMENTARIOS || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para obtener y renderizar las recetas del usuario
async function obtenerRecetas() {
  try {
    const response = await fetch(`${API_BASE_URL}/recetas?pacienteId=1`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const recetas = await response.json();
    renderizarRecetas(recetas);
  } catch (error) {
    console.error('Error al obtener recetas:', error);
  }
}

function renderizarRecetas(recetas) {
  const textarea = document.getElementById('recetas-textarea');
  textarea.value = recetas.map(receta => receta.RECETA).join('\n');
}

// Función para obtener y renderizar los costos
async function obtenerCostos() {
  try {
    const response = await fetch(`${API_BASE_URL}/costos`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const costos = await response.json();
    renderizarCostos(costos);
  } catch (error) {
    console.error('Error al obtener costos:', error);
  }
}

function renderizarCostos(costos) {
  const list = document.getElementById('costos-list');
  list.innerHTML = '';
  let total = 0;
  costos.forEach(costo => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `Tratamiento: ${costo.NOMBRE_TRABAJO} - <strong>$${costo.COSTO}</strong>`;
    list.appendChild(li);
    total += costo.COSTO;
  });
  document.getElementById('total-costos').textContent = `$${total}`;
}

// Función para obtener y renderizar los recordatorios del usuario
async function obtenerRecordatorios() {
  try {
    const response = await fetch(`${API_BASE_URL}/recordatorios?dentistaId=1001`);
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    const recordatorios = await response.json();
    renderizarRecordatorios(recordatorios);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
  }
}

function renderizarRecordatorios(recordatorios) {
  const list = document.getElementById('recordatorios-list');
  list.innerHTML = '';
  recordatorios.forEach(recordatorio => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<span>${recordatorio.FECHA}</span><span>${recordatorio.MENSAJE}</span>`;
    list.appendChild(li);
  });
}

// Función para confirmar una cita
async function confirmarCita() {
  const hora = document.getElementById('hora-select').value;
  if (!selectedDate) {
    alert('Por favor selecciona una fecha en el calendario.');
    return;
  }
  const cita = {
    pacienteId: 1, // ID del paciente
    fecha: selectedDate,
    hora,
    tipoCita: 'Consulta General'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cita)
    });
    if (!response.ok) {
      throw new Error('Error en la solicitud: ' + response.statusText);
    }
    alert('Cita confirmada con éxito');
    obtenerCitas(); // Actualizar la lista de citas
  } catch (error) {
    console.error('Error al confirmar la cita:', error);
  }
}

// Inicializar el calendario
document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    dateClick: function(info) {
      selectedDate = info.dateStr;
      alert('Fecha seleccionada: ' + selectedDate);
    }
  });
  calendar.render();

  obtenerCitas();
  obtenerRecetas();
  obtenerCostos();
  obtenerRecordatorios();

  document.getElementById('confirmar-cita-btn').addEventListener('click', confirmarCita);
});

// Función para obtener y renderizar pacientes
async function obtenerPacientes() {
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes?numeroDeEmpleado=1001`); // Ajusta según tu flujo
      if (!response.ok) {
        throw new Error('Error al obtener los pacientes: ' + response.statusText);
      }
      const pacientes = await response.json();
      renderizarPacientes(pacientes);
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
    }
  }
  
  function renderizarPacientes(pacientes) {
    const tbody = document.getElementById('pacientes-tbody');
    tbody.innerHTML = '';
    pacientes.forEach((paciente) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${paciente.ID_PACIENTE}</td>
        <td>${paciente.NOMBRE}</td>
        <td>${paciente.APELLIDO_PA || ''}</td>
        <td>${paciente.APELLIDO_MA || ''}</td>
      `;
      tbody.appendChild(row);
    });
  }
  