// Simulación de pacientes
let patients = [
    { id: 1, name: "Juan Pérez", email: "juan.perez@example.com", phone: "555-1234" }
  ];
  
  const patientTable = document.getElementById("patientTable");
  const selectPatientButton = document.getElementById("selectPatientButton");
  
  // Renderizar pacientes
  function renderPatients() {
    patientTable.innerHTML = ""; // Limpiar tabla
    patients.forEach((patient) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${patient.id}</td>
        <td>${patient.name}</td>
        <td>${patient.email}</td>
        <td>${patient.phone}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="viewPatientHistory(${patient.id})">Ver Historial</button>
          <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editPatientModal" onclick="prepareEditPatient(${patient.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">Eliminar</button>
        </td>
      `;
      patientTable.appendChild(row);
    });
  }
  
  // Agregar paciente
  document.getElementById("addPatientForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("patientName").value;
    const email = document.getElementById("patientEmail").value;
    const phone = document.getElementById("patientPhone").value;
  
    patients.push({ id: patients.length + 1, name, email, phone });
    renderPatients();
    document.getElementById("addPatientForm").reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById("addPatientModal"));
    modal.hide();
  });
  
  // Editar paciente
  function prepareEditPatient(id) {
    const patient = patients.find((p) => p.id === id);
    document.getElementById("editPatientName").value = patient.name;
    document.getElementById("editPatientEmail").value = patient.email;
    document.getElementById("editPatientPhone").value = patient.phone;
  
    document.getElementById("editPatientForm").onsubmit = (e) => {
      e.preventDefault();
      patient.name = document.getElementById("editPatientName").value;
      patient.email = document.getElementById("editPatientEmail").value;
      patient.phone = document.getElementById("editPatientPhone").value;
      renderPatients();
      const modal = bootstrap.Modal.getInstance(document.getElementById("editPatientModal"));
      modal.hide();
    };
  }
  
  // Eliminar paciente
  function deletePatient(id) {
    patients = patients.filter((p) => p.id !== id);
    renderPatients();
  }
  
  // Inicializar tabla
  renderPatients();
// Simulación de citas
let appointments = [
    {
      id: 1,
      patient: "Juan Pérez",
      date: "2025-01-10",
      time: "10:00 AM",
      status: "Pendiente",
    },
  ];
  
  const appointmentTable = document.getElementById("appointmentTable");
  const addAppointmentButton = document.getElementById("addAppointmentButton");
  const addAppointmentForm = document.getElementById("addAppointmentForm");
  
  // Renderizar citas
  function renderAppointments() {
    appointmentTable.innerHTML = ""; // Limpiar tabla
    appointments.forEach((appointment) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${appointment.id}</td>
        <td>${appointment.patient}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
        <td><span class="badge bg-${getStatusBadge(appointment.status)}">${appointment.status}</span></td>
        <td>
          <button class="btn btn-success btn-sm" onclick="acceptAppointment(${appointment.id})">Aceptar</button>
          <button class="btn btn-danger btn-sm" onclick="rejectAppointment(${appointment.id})">Rechazar</button>
          <button class="btn btn-warning btn-sm" style="display: none;" onclick="prepareReschedule(${appointment.id})">Reagendar</button>
        </td>
      `;
      appointmentTable.appendChild(row);
    });
  }
  
  // Obtener color de badge según estado
  function getStatusBadge(status) {
    switch (status) {
      case "Aceptada":
        return "success";
      case "Rechazada":
      case "Reagendada":
        return "warning";
      default:
        return "secondary";
    }
  }
  
  // Agendar nueva cita
  addAppointmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;
    const patient = document.getElementById("appointmentPatient").value;
  
    appointments.push({
      id: appointments.length + 1,
      patient,
      date,
      time,
      status: "Pendiente",
    });
  
    renderAppointments();
    addAppointmentForm.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById("addAppointmentModal"));
    modal.hide();
  });
  
  // Aceptar cita
  function acceptAppointment(id) {
    const appointment = appointments.find((app) => app.id === id);
    if (appointment) {
      appointment.status = "Aceptada";
      renderAppointments();
    }
  }
  
  // Rechazar cita
  function rejectAppointment(id) {
    const appointment = appointments.find((app) => app.id === id);
    if (appointment) {
      appointment.status = "Rechazada";
      renderAppointments();
      showRescheduleButton(id);
    }
  }
  
  // Mostrar botón de reagendar
  function showRescheduleButton(id) {
    const row = Array.from(appointmentTable.rows).find((r) => r.innerHTML.includes(`>${id}<`));
    if (row) {
      const rescheduleButton = row.querySelector("button.btn-warning");
      rescheduleButton.style.display = "inline-block";
    }
  }
  
  // Preparar reagendar cita
  function prepareReschedule(id) {
    const appointment = appointments.find((app) => app.id === id);
    if (appointment) {
      document.getElementById("newAppointmentDate").value = appointment.date;
      document.getElementById("newAppointmentTime").value = appointment.time;
  
      document.getElementById("rescheduleAppointmentForm").onsubmit = (e) => {
        e.preventDefault();
        appointment.date = document.getElementById("newAppointmentDate").value;
        appointment.time = document.getElementById("newAppointmentTime").value;
        appointment.status = "Reagendada";
  
        renderAppointments();
        const modal = bootstrap.Modal.getInstance(document.getElementById("rescheduleAppointmentModal"));
        modal.hide();
      };
    }
  }
  
  // Inicializar citas
  renderAppointments();
// Simulación de historial clínico
let clinicalHistory = [
    {
      patient: "Juan Pérez",
      records: [
        { date: "2025-01-01", procedure: "Limpieza Dental", notes: "Todo en orden." },
        { date: "2025-01-15", procedure: "Endodoncia", notes: "Procedimiento exitoso." },
      ],
    },
    {
      patient: "Ana López",
      records: [
        { date: "2025-01-05", procedure: "Extracción Dental", notes: "Extracción sin complicaciones." },
      ],
    },
  ];
  
  const clinicalHistoryTable = document.getElementById("clinicalHistoryTable");
  const fullHistoryTable = document.getElementById("fullHistoryTable");
  const viewFullHistoryButton = document.getElementById("viewFullHistoryButton");
  
  // Renderizar historial clínico resumido
  function renderClinicalHistory(selectedPatient) {
    clinicalHistoryTable.innerHTML = ""; // Limpiar tabla
    const patientHistory = clinicalHistory.find((history) => history.patient === selectedPatient);
  
    if (patientHistory) {
      viewFullHistoryButton.disabled = false;
  
      // Mostrar últimos 2 registros como resumen
      const recentRecords = patientHistory.records.slice(-2);
      recentRecords.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.date}</td>
          <td>${record.procedure}</td>
          <td>${record.notes}</td>
        `;
        clinicalHistoryTable.appendChild(row);
      });
    } else {
      viewFullHistoryButton.disabled = true;
    }
  }
  
  // Renderizar historial clínico completo
  function renderFullHistory(selectedPatient) {
    fullHistoryTable.innerHTML = ""; // Limpiar tabla
    const patientHistory = clinicalHistory.find((history) => history.patient === selectedPatient);
  
    if (patientHistory) {
      patientHistory.records.forEach((record) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${record.date}</td>
          <td>${record.procedure}</td>
          <td>${record.notes}</td>
          <td>${selectedPatient}</td>
          <td>Consultorio 1</td> <!-- Simulado -->
        `;
        fullHistoryTable.appendChild(row);
      });
    }
  }
  
  // Evento para botón "Ver Historial Completo"
  viewFullHistoryButton.addEventListener("click", () => {
    const selectedRow = document.querySelector("#patientTable tr.selected");
    if (selectedRow) {
      const selectedPatient = selectedRow.querySelector("td:nth-child(2)").innerText;
      renderFullHistory(selectedPatient);
    }
  });
  
  // Inicialización: desactivar botón hasta seleccionar paciente
  viewFullHistoryButton.disabled = true;
// Simulación de recordatorios
let reminders = [
    {
      id: 1,
      patient: "Juan Pérez",
      message: "Recuerda tu cita mañana a las 10:00 AM.",
      date: "2025-01-10",
    },
    {
      id: 2,
      patient: "Ana López",
      message: "Revisión dental programada para el lunes a las 9:00 AM.",
      date: "2025-01-11",
    },
  ];
  
  const reminderTable = document.getElementById("reminderTable");
  const addReminderButton = document.getElementById("addReminderButton");
  const addReminderForm = document.getElementById("addReminderForm");
  const reminderMessage = document.getElementById("reminderMessage");
  
  // Renderizar la tabla de recordatorios
  function renderReminders(selectedPatient = null) {
    reminderTable.innerHTML = ""; // Limpiar tabla
    const filteredReminders = selectedPatient
      ? reminders.filter((reminder) => reminder.patient === selectedPatient)
      : reminders;
  
    filteredReminders.forEach((reminder) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reminder.id}</td>
        <td>${reminder.patient}</td>
        <td>${reminder.message}</td>
        <td>${reminder.date}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteReminder(${reminder.id})">Eliminar</button>
        </td>
      `;
      reminderTable.appendChild(row);
    });
  }
  
  // Agregar un recordatorio
  addReminderForm.addEventListener("submit", (event) => {
    event.preventDefault();
  
    const selectedRow = document.querySelector("#patientTable tr.selected");
    if (!selectedRow) {
      alert("Por favor, selecciona un paciente para agregar un recordatorio.");
      return;
    }
  
    const selectedPatient = selectedRow.querySelector("td:nth-child(2)").innerText;
    const message = reminderMessage.value;
    const reminderDate = new Date().toISOString().split("T")[0]; // Fecha actual
    const newReminder = {
      id: reminders.length + 1,
      patient: selectedPatient,
      message,
      date: reminderDate,
    };
  
    reminders.push(newReminder);
    renderReminders(selectedPatient); // Actualizar tabla
    addReminderForm.reset(); // Limpiar formulario
    const modal = bootstrap.Modal.getInstance(document.getElementById("addReminderModal"));
    modal.hide(); // Cerrar modal
  });
  
  // Eliminar un recordatorio
  function deleteReminder(id) {
    reminders = reminders.filter((reminder) => reminder.id !== id);
    renderReminders();
  }
  
  // Habilitar botón para agregar recordatorio al seleccionar un paciente
  document.getElementById("patientTable").addEventListener("click", (event) => {
    const selectedRow = event.target.closest("tr");
    if (selectedRow) {
      document.querySelectorAll("#patientTable tr").forEach((tr) => tr.classList.remove("selected"));
      selectedRow.classList.add("selected");
  
      const selectedPatient = selectedRow.querySelector("td:nth-child(2)").innerText;
      renderReminders(selectedPatient);
      addReminderButton.disabled = false;
    }
  });
  
  // Inicializar la tabla de recordatorios
  renderReminders();
// Elementos de la sección Generar Recetas
const recipeText = document.getElementById("recipeText");
const signatureCanvas = document.getElementById("signatureCanvas");
const signatureText = document.getElementById("signatureText");
const saveRecipeButton = document.getElementById("generateRecipeForm");
const clearSignatureButton = document.getElementById("clearSignatureButton");
const saveSignatureButton = document.getElementById("saveSignatureButton");

let currentSignature = ""; // Almacena la firma actual
let recipes = []; // Lista de recetas asociadas

// Firma en Canvas
const ctx = signatureCanvas.getContext("2d");
let isDrawing = false;

function startDrawing(e) {
  isDrawing = true;
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// Eventos para dibujar en el Canvas
signatureCanvas.addEventListener("mousedown", startDrawing);
signatureCanvas.addEventListener("mousemove", draw);
signatureCanvas.addEventListener("mouseup", stopDrawing);
signatureCanvas.addEventListener("mouseout", stopDrawing);

// Limpiar firma
clearSignatureButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});

// Guardar firma
saveSignatureButton.addEventListener("click", () => {
  const signatureFromCanvas = signatureCanvas.toDataURL();
  currentSignature = signatureText.value || signatureFromCanvas;
  const modal = bootstrap.Modal.getInstance(document.getElementById("addSignatureModal"));
  modal.hide();
});

// Guardar receta
saveRecipeButton.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedRow = document.querySelector("#patientTable tr.selected");
  if (!selectedRow) {
    alert("Por favor, selecciona un paciente antes de guardar una receta.");
    return;
  }

  const selectedPatient = selectedRow.querySelector("td:nth-child(2)").innerText;
  if (!currentSignature) {
    alert("Por favor, agrega una firma antes de guardar la receta.");
    return;
  }

  const newRecipe = {
    patient: selectedPatient,
    text: recipeText.value,
    signature: currentSignature,
  };

  recipes.push(newRecipe);
  alert(`Receta guardada exitosamente para ${selectedPatient}.`);
  recipeText.value = "";
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});
// Elementos de la sección de reportes
const patientReportButton = document.getElementById("patientReportButton");
const generalReportButton = document.getElementById("generalReportButton");
const patientReportTable = document.getElementById("patientReportTable");
const generalReportTable = document.getElementById("generalReportTable");

// Simulación de reportes
const patientReports = [
  {
    patientId: 1,
    patientName: "Juan Pérez",
    history: [
      {
        date: "2025-01-01",
        procedure: "Limpieza Dental",
        notes: "Todo en orden",
        status: "Finalizado",
      },
      {
        date: "2025-01-15",
        procedure: "Endodoncia",
        notes: "Procedimiento exitoso",
        status: "Finalizado",
      },
    ],
  },
  {
    patientId: 2,
    patientName: "Ana López",
    history: [
      {
        date: "2025-01-05",
        procedure: "Consulta General",
        notes: "Revisar caries",
        status: "Finalizado",
      },
    ],
  },
];

const generalReport = [
  { category: "Limpieza Dental", count: 5 },
  { category: "Endodoncia", count: 3 },
  { category: "Consulta General", count: 10 },
];

// Función para habilitar/deshabilitar el botón de reporte por paciente
function enablePatientReportButton(patientId) {
  const patientExists = patientReports.some(
    (report) => report.patientId === patientId
  );
  patientReportButton.disabled = !patientExists;
}

// Renderizar reporte por paciente
function renderPatientReport(patientId) {
  const patientReport = patientReports.find(
    (report) => report.patientId === patientId
  );
  if (!patientReport) return;

  patientReportTable.innerHTML = patientReport.history
    .map(
      (entry) => `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.procedure}</td>
          <td>${entry.notes}</td>
          <td>${entry.status}</td>
        </tr>
      `
    )
    .join("");
}

// Renderizar reporte general
function renderGeneralReport() {
  generalReportTable.innerHTML = generalReport
    .map(
      (entry) => `
        <tr>
          <td>${entry.category}</td>
          <td>${entry.count}</td>
        </tr>
      `
    )
    .join("");
}

// Evento de botón de reporte por paciente
patientReportButton.addEventListener("click", () => {
  const selectedRow = document.querySelector("#patientTable tr.selected");
  if (selectedRow) {
    const patientId = parseInt(selectedRow.dataset.patientId);
    renderPatientReport(patientId);
  }
});

// Evento de botón de reporte general
generalReportButton.addEventListener("click", renderGeneralReport);
// Elementos
const costTable = document.getElementById("costTable");
const editCostForm = document.getElementById("editCostForm");
const procedureNameInput = document.getElementById("procedureName");
const procedureCostInput = document.getElementById("procedureCost");
const generateCostTicketButton = document.getElementById("generateCostTicketButton");
const ticketList = document.getElementById("ticketList");

// Simulación de costos
let costs = [
  { id: "001", name: "Limpieza Dental", cost: 500 },
  { id: "002", name: "Endodoncia", cost: 3000 },
  { id: "003", name: "Ortodoncia", cost: 7000 },
];

let selectedProcedure = null;

// Función para renderizar la tabla de costos
function renderCosts() {
  costTable.innerHTML = costs
    .map(
      (procedure) => `
        <tr>
          <td>${procedure.id}</td>
          <td>${procedure.name}</td>
          <td>$${procedure.cost.toFixed(2)}</td>
          <td>
            <button
              class="btn btn-warning btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#editCostModal"
              onclick="editProcedure('${procedure.id}')"
            >
              Editar
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Función para editar un procedimiento
function editProcedure(id) {
  selectedProcedure = costs.find((procedure) => procedure.id === id);
  if (selectedProcedure) {
    procedureNameInput.value = selectedProcedure.name;
    procedureCostInput.value = selectedProcedure.cost;
  }
}

// Guardar cambios en el costo
editCostForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (selectedProcedure) {
    const newCost = parseFloat(procedureCostInput.value);
    if (!isNaN(newCost) && newCost > 0) {
      selectedProcedure.cost = newCost;
      renderCosts();
      const modalInstance = bootstrap.Modal.getInstance(
        document.getElementById("editCostModal")
      );
      modalInstance.hide();
    } else {
      alert("Por favor, introduce un costo válido.");
    }
  }
});

// Generar ticket de costos
generateCostTicketButton.addEventListener("click", () => {
  ticketList.innerHTML = costs
    .map(
      (procedure) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${procedure.name}
          <span>$${procedure.cost.toFixed(2)}</span>
        </li>
      `
    )
    .join("");
});

// Inicializar
renderCosts();
// Elementos
const reminderTable = document.getElementById("reminderTable");
const addReminderForm = document.getElementById("addReminderForm");
const reminderPatient = document.getElementById("reminderPatient");
const reminderMessage = document.getElementById("reminderMessage");

// Simulación de recordatorios y pacientes
let reminders = [];
let patients = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "Ana López" },
];

let reminderIdCounter = 0;

// Función para renderizar la tabla de recordatorios
function renderReminders() {
  reminderTable.innerHTML = reminders
    .map(
      (reminder) => `
        <tr>
          <td>${reminder.id}</td>
          <td>${reminder.patientName}</td>
          <td>${reminder.message}</td>
          <td>${reminder.date}</td>
          <td>
            <button
              class="btn btn-danger btn-sm"
              onclick="deleteReminder(${reminder.id})"
            >
              Eliminar
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Función para agregar opciones de pacientes
function populatePatientOptions() {
  reminderPatient.innerHTML = patients
    .map(
      (patient) => `
        <option value="${patient.id}">${patient.name}</option>
      `
    )
    .join("");
}

// Función para agregar un nuevo recordatorio
addReminderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const patientId = parseInt(reminderPatient.value);
  const patientName = patients.find((p) => p.id === patientId)?.name;
  const message = reminderMessage.value.trim();
  const date = new Date().toLocaleDateString();

  if (!patientName || !message) {
    alert("Selecciona un paciente y escribe un mensaje.");
    return;
  }

  reminders.push({
    id: ++reminderIdCounter,
    patientId,
    patientName,
    message,
    date,
  });

  renderReminders();
  addReminderForm.reset();

  const modalInstance = bootstrap.Modal.getInstance(
    document.getElementById("addReminderModal")
  );
  modalInstance.hide();
});

// Función para eliminar un recordatorio
function deleteReminder(id) {
  reminders = reminders.filter((reminder) => reminder.id !== id);
  renderReminders();
}

// Inicializar
populatePatientOptions();
renderReminders();
// Elementos de la sección Generar Recetas
const recipeText = document.getElementById("recipeText");
const signatureCanvas = document.getElementById("signatureCanvas");
const signatureText = document.getElementById("signatureText");
const saveRecipeButton = document.getElementById("generateRecipeForm");
const clearSignatureButton = document.getElementById("clearSignatureButton");
const saveSignatureButton = document.getElementById("saveSignatureButton");

let currentSignature = ""; // Almacena la firma actual
let recipes = []; // Lista de recetas asociadas

// Firma en Canvas
const ctx = signatureCanvas.getContext("2d");
let isDrawing = false;

function startDrawing(e) {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// Eventos para dibujar en el Canvas
signatureCanvas.addEventListener("mousedown", startDrawing);
signatureCanvas.addEventListener("mousemove", draw);
signatureCanvas.addEventListener("mouseup", stopDrawing);
signatureCanvas.addEventListener("mouseout", stopDrawing);

// Limpiar firma
clearSignatureButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});

// Guardar firma
saveSignatureButton.addEventListener("click", () => {
  const signatureFromCanvas = signatureCanvas.toDataURL();
  currentSignature = signatureText.value || signatureFromCanvas;
  alert("Firma guardada correctamente.");
  const modalInstance = bootstrap.Modal.getInstance(
    document.getElementById("addSignatureModal")
  );
  modalInstance.hide();
});

// Guardar receta
saveRecipeButton.addEventListener("submit", (e) => {
  e.preventDefault();

  const recipeContent = recipeText.value.trim();
  if (!recipeContent) {
    alert("Por favor, escribe la receta.");
    return;
  }

  if (!currentSignature) {
    alert("Por favor, agrega una firma antes de guardar la receta.");
    return;
  }

  const newRecipe = {
    content: recipeContent,
    signature: currentSignature,
    date: new Date().toLocaleDateString(),
  };

  recipes.push(newRecipe);
  alert("Receta guardada correctamente.");
  recipeText.value = "";
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});
// Elementos de la sección de reportes
const patientReportButton = document.getElementById("patientReportButton");
const generalReportButton = document.getElementById("generalReportButton");
const patientReportTable = document.getElementById("patientReportTable");
const generalReportTable = document.getElementById("generalReportTable");

// Datos simulados
let patientReports = [
  {
    patientId: 1,
    patientName: "Juan Pérez",
    history: [
      {
        date: "2025-01-01",
        procedure: "Limpieza Dental",
        notes: "Todo en orden",
        status: "Finalizado",
      },
      {
        date: "2025-01-15",
        procedure: "Endodoncia",
        notes: "Procedimiento exitoso",
        status: "Finalizado",
      },
    ],
  },
  {
    patientId: 2,
    patientName: "Ana López",
    history: [
      {
        date: "2025-01-05",
        procedure: "Consulta General",
        notes: "Revisar caries",
        status: "Finalizado",
      },
    ],
  },
];

let generalReport = [
  { category: "Limpieza Dental", count: 5 },
  { category: "Endodoncia", count: 3 },
  { category: "Consulta General", count: 10 },
];

// Función para habilitar el botón de reporte por paciente
function enablePatientReportButton(patientId) {
  const patientExists = patientReports.some(
    (report) => report.patientId === patientId
  );
  patientReportButton.disabled = !patientExists;
}

// Función para abrir el reporte por paciente
function openPatientReport(patientId) {
  const patientReport = patientReports.find(
    (report) => report.patientId === patientId
  );
  if (!patientReport) {
    alert("No se encontró información para el paciente seleccionado.");
    return;
  }

  patientReportTable.innerHTML = patientReport.history
    .map(
      (entry) => `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.procedure}</td>
          <td>${entry.notes}</td>
          <td>${entry.status}</td>
        </tr>
      `
    )
    .join("");

  const patientReportModal = new bootstrap.Modal(
    document.getElementById("patientReportModal")
  );
  patientReportModal.show();
}

// Función para abrir el reporte general
function openGeneralReport() {
  generalReportTable.innerHTML = generalReport
    .map(
      (entry) => `
        <tr>
          <td>${entry.category}</td>
          <td>${entry.count}</td>
        </tr>
      `
    )
    .join("");

  const generalReportModal = new bootstrap.Modal(
    document.getElementById("generalReportModal")
  );
  generalReportModal.show();
}

// Eventos de botones
patientReportButton.addEventListener("click", () => {
  openPatientReport(1); // Cambiar según paciente seleccionado
});
generalReportButton.addEventListener("click", openGeneralReport);

// Inicialización
enablePatientReportButton(null);
// Elementos de la sección de costos
const costTable = document.getElementById("costTable");
const editCostForm = document.getElementById("editCostForm");
const procedureNameInput = document.getElementById("procedureName");
const procedureCostInput = document.getElementById("procedureCost");
const generateCostTicketButton = document.getElementById(
  "generateCostTicketButton"
);

// Datos simulados de procedimientos
let procedures = [
  { id: "001", name: "Limpieza Dental", cost: 500 },
  { id: "002", name: "Endodoncia", cost: 3000 },
  { id: "003", name: "Ortodoncia", cost: 7000 },
];

let currentProcedureId = null; // ID del procedimiento seleccionado para editar

// Función para renderizar la tabla de costos
function renderProcedures() {
  costTable.innerHTML = procedures
    .map(
      (procedure) => `
        <tr>
          <td>${procedure.id}</td>
          <td>${procedure.name}</td>
          <td>$${procedure.cost.toFixed(2)}</td>
          <td>
            <button
              class="btn btn-warning btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#editCostModal"
              onclick="prepareEditCost('${procedure.id}')"
            >
              Editar
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Función para preparar la edición de un costo
function prepareEditCost(procedureId) {
  const procedure = procedures.find((proc) => proc.id === procedureId);
  if (!procedure) return;

  currentProcedureId = procedureId;
  procedureNameInput.value = procedure.name;
  procedureCostInput.value = procedure.cost;
}

// Función para guardar cambios en el costo de un procedimiento
function saveCost(event) {
  event.preventDefault();

  const newCost = parseFloat(procedureCostInput.value);
  if (isNaN(newCost) || newCost <= 0) {
    alert("Por favor, ingresa un costo válido.");
    return;
  }

  const procedure = procedures.find((proc) => proc.id === currentProcedureId);
  if (!procedure) return;

  procedure.cost = newCost;
  renderProcedures();

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editCostModal")
  );
  modal.hide();
}

// Función para generar un ticket de costos
function generateCostTicket() {
  const ticketContent = procedures
    .map(
      (procedure) => `
        <tr>
          <td>${procedure.name}</td>
          <td>$${procedure.cost.toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  const ticketWindow = window.open("", "_blank", "width=400,height=600");
  ticketWindow.document.write(`
    <html>
      <head>
        <title>Ticket de Costos</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <h2>Ticket de Costos</h2>
        <table>
          <thead>
            <tr>
              <th>Procedimiento</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            ${ticketContent}
          </tbody>
        </table>
      </body>
    </html>
  `);
  ticketWindow.document.close();
}

// Inicialización
editCostForm.addEventListener("submit", saveCost);
generateCostTicketButton.addEventListener("click", generateCostTicket);
renderProcedures();
// Elementos de la sección de recordatorios
const reminderTable = document.getElementById("reminderTable");
const addReminderForm = document.getElementById("addReminderForm");
const reminderPatientSelect = document.getElementById("reminderPatient");
const reminderMessageInput = document.getElementById("reminderMessage");

// Datos simulados de recordatorios y pacientes
let reminders = [
  {
    id: 1,
    patientId: 1,
    patientName: "Juan Pérez",
    message: "No olvides tu cita mañana a las 10:00 AM",
    date: "2025-01-14",
  },
];
let patients = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "Ana López" },
];

let reminderIdCounter = reminders.length; // Contador para IDs únicos

// Función para renderizar la tabla de recordatorios
function renderReminders() {
  reminderTable.innerHTML = reminders
    .map(
      (reminder) => `
        <tr>
          <td>${reminder.id}</td>
          <td>${reminder.patientName}</td>
          <td>${reminder.message}</td>
          <td>${reminder.date}</td>
          <td>
            <button
              class="btn btn-danger btn-sm"
              onclick="deleteReminder(${reminder.id})"
            >
              Eliminar
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Función para renderizar el selector de pacientes
function renderPatientOptions() {
  reminderPatientSelect.innerHTML = patients
    .map(
      (patient) => `
        <option value="${patient.id}">${patient.name}</option>
      `
    )
    .join("");
}

// Función para agregar un nuevo recordatorio
function addReminder(event) {
  event.preventDefault(); // Evita el comportamiento por defecto del formulario

  const patientId = parseInt(reminderPatientSelect.value);
  const patientName = reminderPatientSelect.options[reminderPatientSelect.selectedIndex].text;
  const message = reminderMessageInput.value;
  const date = new Date().toISOString().split("T")[0]; // Fecha actual

  if (!patientId || !message.trim()) {
    alert("Por favor, selecciona un paciente y escribe un mensaje.");
    return;
  }

  reminders.push({
    id: ++reminderIdCounter,
    patientId,
    patientName,
    message,
    date,
  });

  renderReminders();
  addReminderForm.reset(); // Limpia el formulario
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addReminderModal")
  );
  modal.hide();
}

// Función para eliminar un recordatorio
function deleteReminder(reminderId) {
  reminders = reminders.filter((reminder) => reminder.id !== reminderId);
  renderReminders();
}

// Inicialización
addReminderForm.addEventListener("submit", addReminder);
renderPatientOptions();
renderReminders();
// Elementos de la sección Generar Recetas
const recipeText = document.getElementById("recipeText");
const signatureCanvas = document.getElementById("signatureCanvas");
const signatureText = document.getElementById("signatureText");
const saveRecipeButton = document.getElementById("generateRecipeForm");
const clearSignatureButton = document.getElementById("clearSignatureButton");
const saveSignatureButton = document.getElementById("saveSignatureButton");

let currentSignature = ""; // Almacena la firma actual
let recipes = []; // Lista de recetas

// Firma en Canvas
const ctx = signatureCanvas.getContext("2d");
let isDrawing = false;

function startDrawing(e) {
  isDrawing = true;
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// Eventos para dibujar en el Canvas
signatureCanvas.addEventListener("mousedown", startDrawing);
signatureCanvas.addEventListener("mousemove", draw);
signatureCanvas.addEventListener("mouseup", stopDrawing);
signatureCanvas.addEventListener("mouseout", stopDrawing);

// Limpiar firma
clearSignatureButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});

// Guardar firma
saveSignatureButton.addEventListener("click", () => {
  const signatureFromCanvas = signatureCanvas.toDataURL();
  currentSignature = signatureText.value || signatureFromCanvas;
  const modal = bootstrap.Modal.getInstance(document.getElementById("addSignatureModal"));
  modal.hide();
});

// Guardar receta
saveRecipeButton.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!currentSignature) {
    alert("Por favor, agrega una firma antes de guardar la receta.");
    return;
  }

  const newRecipe = {
    text: recipeText.value,
    signature: currentSignature,
  };

  recipes.push(newRecipe);
  alert("Receta guardada exitosamente.");
  recipeText.value = "";
  ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  currentSignature = "";
});
// Simulación de datos
const patientReports = [
    {
      patientId: 1,
      patientName: "Juan Pérez",
      history: [
        { date: "2025-01-01", procedure: "Limpieza Dental", notes: "Todo en orden.", status: "Finalizado" },
        { date: "2025-01-15", procedure: "Endodoncia", notes: "Procedimiento exitoso.", status: "Finalizado" },
      ],
    },
  ];
  
  const generalReport = [
    { category: "Limpieza Dental", count: 5 },
    { category: "Endodoncia", count: 3 },
  ];
  
  // Función para renderizar Reporte por Paciente
  function renderPatientReport(patientId) {
    const patientReport = patientReports.find(report => report.patientId === patientId);
    const reportTable = document.getElementById("patientReportTable");
    reportTable.innerHTML = patientReport.history.map(entry => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.procedure}</td>
        <td>${entry.notes}</td>
        <td>${entry.status}</td>
      </tr>
    `).join("");
  }
  
  // Función para renderizar Reporte General
  function renderGeneralReport() {
    const generalReportTable = document.getElementById("generalReportTable");
    generalReportTable.innerHTML = generalReport.map(entry => `
      <tr>
        <td>${entry.category}</td>
        <td>${entry.count}</td>
      </tr>
    `).join("");
  }
  
  // Eventos para abrir los reportes
  document.getElementById("patientReportButton").addEventListener("click", () => {
    const selectedPatientId = 1; // Simulación de selección
    renderPatientReport(selectedPatientId);
  });
  
  document.getElementById("generalReportButton").addEventListener("click", renderGeneralReport);
         