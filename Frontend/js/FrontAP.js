document.addEventListener('DOMContentLoaded', () => {
  const registroBtn = document.getElementById('registroBtn');
  const nuevoPacienteBtn = document.getElementById('nuevoPacienteBtn');
  const busquedaBtn = document.getElementById('busquedaBtn');
  const asignacionCard = document.getElementById('asignacionCard');
  const nuevoPacienteCard = document.getElementById('nuevoPacienteCard');
  const busquedaCard = document.getElementById('busquedaCard');

  registroBtn.addEventListener('click', () => {
    asignacionCard.style.display = 'block';
    nuevoPacienteCard.style.display = 'none';
    busquedaCard.style.display = 'none';
  });

  nuevoPacienteBtn.addEventListener('click', () => {
    asignacionCard.style.display = 'none';
    nuevoPacienteCard.style.display = 'block';
    busquedaCard.style.display = 'none';
  });

  busquedaBtn.addEventListener('click', () => {
    asignacionCard.style.display = 'none';
    nuevoPacienteCard.style.display = 'none';
    busquedaCard.style.display = 'block';
  });

  // Manejo del formulario de asignación
  document.getElementById('asignacionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const pacienteId = document.getElementById('selectPaciente').value;
    const dentistaId = document.getElementById('selectDentista').value;
    const consultorio = document.getElementById('selectConsultorio').value;

    if (pacienteId && dentistaId && consultorio) {
      // Aquí puedes agregar la lógica para enviar los datos al servidor
      console.log('Asignación:', { pacienteId, dentistaId, consultorio });
      alert('Asignación realizada con éxito');
    } else {
      alert('Por favor, complete todos los campos');
    }
  });

  // Manejo del formulario de nuevo paciente
  document.getElementById('nuevoPacienteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nombre = document.getElementById('nuevoPacienteNombre').value;
    const fechaNacimiento = document.getElementById('nuevoPacienteFecha').value;
    const dentistaId = document.getElementById('nuevoPacienteDentista').value;
    const consultorio = document.getElementById('nuevoPacienteConsultorio').value;

    if (nombre && fechaNacimiento && dentistaId && consultorio) {
      // Aquí puedes agregar la lógica para enviar los datos al servidor
      fetch('http://localhost:4000/registrarPaciente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, fechaNacimiento, dentistaId, consultorio })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        alert('Paciente registrado y asignado con éxito');
        console.log('Nuevo Paciente:', data);
      })
      .catch(error => console.error('Error:', error));
    } else {
      alert('Por favor, complete todos los campos');
    }
  });

  // Manejo del formulario de búsqueda
  document.getElementById('busquedaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const busqueda = document.getElementById('busquedaInput').value;

    if (busqueda) {
      fetch('http://localhost:4000/buscar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ busqueda })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        const resultadosContainer = document.getElementById('resultadosContainer');
        if (!resultadosContainer) {
          console.error('No se encontró el contenedor para mostrar resultados.');
          return;
        }

        resultadosContainer.innerHTML = ''; // Limpiar resultados anteriores

        if (data.message) {
          resultadosContainer.innerHTML = `<p>${data.message}</p>`;
        } else {
          data.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            resultItem.innerHTML = `<strong>${item.tipo}:</strong> ${item.nombre} (ID: ${item.id})`;
            resultadosContainer.appendChild(resultItem);
          });
        }
      })
      .catch(error => console.error('Error:', error));
    } else {
      alert('Por favor, ingrese un nombre o ID para buscar');
    }
  });
});