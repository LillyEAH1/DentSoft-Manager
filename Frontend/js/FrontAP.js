document.addEventListener('DOMContentLoaded', () => {
  const registroBtn = document.getElementById('registroBtn');
  const nuevoPacienteBtn = document.getElementById('nuevoPacienteBtn');
  const busquedaBtn = document.getElementById('busquedaBtn');
  const nuevoPacienteCard = document.getElementById('nuevoPacienteCard');
  const nuevoDentistaCard = document.getElementById('nuevoDentistaCard');
  const busquedaCard = document.getElementById('busquedaCard');
  

  registroBtn.addEventListener('click', () => {
    nuevoDentistaCard.style.display = 'block';
    nuevoPacienteCard.style.display = 'none';
    busquedaCard.style.display = 'none';
  });

  nuevoPacienteBtn.addEventListener('click', () => {
    nuevoDentistaCard.style.display = 'none';
    nuevoPacienteCard.style.display = 'block';
    busquedaCard.style.display = 'none';
  });

  busquedaBtn.addEventListener('click', () => {
    nuevoDentistaCard.style.display = 'none';
    nuevoPacienteCard.style.display = 'none';
    busquedaCard.style.display = 'block';
  });

  // Manejo del formulario de nuevo dentista
  document.getElementById('nuevoDentistaForm').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Submitting nuevoDentistaForm');
    const numeroDeEmpleado = document.getElementById('nuevoDentistaNumero').value;
    const nombre = document.getElementById('nuevoDentistaNombre').value;
    const apellidoPa = document.getElementById('nuevoDentistaApellidoPa').value;
    const apellidoMa = document.getElementById('nuevoDentistaApellidoMa').value;
    const especialidadDentista = document.getElementById('nuevoDentistaEspecialidad').value;

    if (numeroDeEmpleado && nombre && apellidoPa && especialidadDentista) {
      fetch('http://localhost:4000/api/agregarDentista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numeroDeEmpleado, nombre, apellidoPa, apellidoMa, especialidadDentista }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          alert(data.message); // Mensaje dinámico
          document.getElementById('nuevoDentistaForm').reset(); // Restablecer el formulario
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al conectar con el servidor. Por favor, intente nuevamente.');
        });
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  });

  // Manejo del formulario de nuevo paciente
  document.getElementById('nuevoPacienteForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Submitting nuevoPacienteForm');
    const idPaciente = document.getElementById('nuevoPacienteId').value;
    const nombre = document.getElementById('nuevoPacienteNombre').value;
    const apellidoPa = document.getElementById('nuevoPacienteApellidoPa').value;
    const apellidoMa = document.getElementById('nuevoPacienteApellidoMa').value;
    const fechaNac = document.getElementById('nuevoPacienteFecha').value;
    const genero = document.getElementById('nuevoPacienteGenero').value;
    const numeroTel = document.getElementById('nuevoPacienteTelefono').value;
    const correo = document.getElementById('nuevoPacienteCorreo').value;
    const tipoDeSangrePaciente = document.getElementById('nuevoPacienteTipoSangre').value;
    const estadoCivilPaciente = document.getElementById('nuevoPacienteEstadoCivil').value;
    const contactoPaciente = document.getElementById('nuevoPacienteContacto').value;

    if (idPaciente && nombre && apellidoPa && fechaNac && numeroTel && correo) {
      fetch('http://localhost:4000/api/agregarPaciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPaciente,
          nombre,
          apellidoPa,
          apellidoMa,
          fechaNac,
          genero,
          numeroTel,
          correo,
          tipoDeSangrePaciente,
          estadoCivilPaciente,
          contactoPaciente,
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          alert(data.message); // Mensaje dinámico
          document.getElementById('nuevoPacienteForm').reset(); // Restablecer el formulario
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error al conectar con el servidor. Por favor, intente nuevamente.');
        });
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  });

  // Manejo del formulario de búsqueda
  document.getElementById('busquedaForm').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Submitting busquedaForm');
    const busqueda = document.getElementById('busquedaInput').value;

    fetch('http://localhost:4000/api/buscar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busqueda }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data);
        const resultadosContainer = document.getElementById('resultadosContainer');
        resultadosContainer.innerHTML = ''; // Limpiar resultados previos

        if (data.message) {
          resultadosContainer.innerHTML = `<p>${data.message}</p>`;
        } else {
          data.forEach(item => {
            const div = document.createElement('div');
            div.innerHTML = `
              <p><strong>${item.tipo}:</strong> ${item.nombre} ${item.apellidoPa || ''} ${item.apellidoMa || ''} (ID: ${item.id})</p>
              <button class="btn btn-warning btn-sm edit-btn" data-id="${item.id}" data-tipo="${item.tipo}">Editar</button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}" data-tipo="${item.tipo}">Eliminar</button>
            `;
            resultadosContainer.appendChild(div);
          });

          // Añadir eventos a los botones de editar y eliminar
          document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEdit);
          });
          document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDelete);
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al conectar con el servidor. Por favor, intente nuevamente.');
      });
  });

  // Manejo del botón de editar
  function handleEdit(event) {
    const id = event.target.getAttribute('data-id');
    const tipo = event.target.getAttribute('data-tipo');
  
    // Obtener datos del servidor
    fetch(`http://localhost:4000/api/obtener/${tipo}/${id}`)
      .then(response => response.json())
      .then(data => {
        // Llenar el formulario con los datos obtenidos
        document.getElementById('editId').value = data.id;
        document.getElementById('editNombre').value = data.nombre;
        document.getElementById('editApellidoPa').value = data.apellidoPa;
        document.getElementById('editApellidoMa').value = data.apellidoMa;
  
        // Mostrar el modal
        new bootstrap.Modal(document.getElementById('editModal')).show();
      })
      .catch(error => console.error('Error:', error));
  }
  

  // Manejo del formulario de edición
  document.getElementById('editForm').addEventListener('submit', function (event) {
    event.preventDefault();
  
    const id = document.getElementById('editId').value;
    const nombre = document.getElementById('editNombre').value;
    const apellidoPa = document.getElementById('editApellidoPa').value;
    const apellidoMa = document.getElementById('editApellidoMa').value;
  
    fetch(`http://localhost:4000/api/editar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellidoPa, apellidoMa }),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        // Cerrar el modal y actualizar resultados
        new bootstrap.Modal(document.getElementById('editModal')).hide();
        document.getElementById('busquedaForm').dispatchEvent(new Event('submit'));
      })
      .catch(error => console.error('Error:', error));
  });
  

  // Manejo del botón de eliminar
  function handleDelete(event) {
    const id = event.target.getAttribute('data-id');
    const tipo = event.target.getAttribute('data-tipo');
  
    // Llenar los datos en el modal
    document.getElementById('deleteId').textContent = id;
    document.getElementById('deleteTipo').textContent = tipo;
  
    // Mostrar el modal
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
  
    // Configurar el botón de confirmar eliminación
    document.getElementById('confirmDeleteBtn').onclick = function () {
      fetch(`http://localhost:4000/api/eliminar/${tipo}/${id}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message);
          // Cerrar el modal y actualizar resultados
          new bootstrap.Modal(document.getElementById('deleteModal')).hide();
          document.getElementById('busquedaForm').dispatchEvent(new Event('submit'));
        })
        .catch(error => console.error('Error:', error));
    };
  }
  