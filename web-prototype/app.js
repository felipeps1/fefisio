const STORAGE = { patients: 'fefisio:patients', appointments: 'fefisio:appointments' };
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const patientForm = document.getElementById('patient-form');
const appointmentForm = document.getElementById('appointment-form');
const patientsList = document.getElementById('patients-list');
const appointmentsList = document.getElementById('appointments-list');
const patientSelect = document.getElementById('appointment-patient');
const cancelPatientBtn = document.getElementById('cancel-patient');
const cancelAppointmentBtn = document.getElementById('cancel-appointment');
const agendaFilter = document.getElementById('agenda-filter');

let patients = JSON.parse(localStorage.getItem(STORAGE.patients) || '[]');
let appointments = JSON.parse(localStorage.getItem(STORAGE.appointments) || '[]');

const setTab = (id) => {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === id));
  tabContents.forEach((c) => c.classList.toggle('active', c.id === id));
};
tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

const saveAll = () => {
  localStorage.setItem(STORAGE.patients, JSON.stringify(patients));
  localStorage.setItem(STORAGE.appointments, JSON.stringify(appointments));
};

function resetPatientForm() { patientForm.reset(); patientForm.id.value = ''; }
function resetAppointmentForm() { appointmentForm.reset(); appointmentForm.id.value = ''; }

function renderPatients() {
  patientSelect.innerHTML = '';
  if (!patients.length) {
    patientSelect.innerHTML = '<option value="">Cadastre um paciente primeiro</option>';
    patientsList.innerHTML = '<p class="empty">Nenhum paciente cadastrado.</p>';
    return;
  }
  patients.forEach((p) => {
    const option = document.createElement('option'); option.value = p.id; option.textContent = p.patientName; patientSelect.appendChild(option);
  });

  patientsList.innerHTML = patients.map((p) => `<div class="list-item"><strong>${p.patientName}</strong><br/>Endereço: ${p.patientAddress}<br/>Tel paciente: ${p.patientPhone}<br/>Resp. financeiro: ${p.financialName} (${p.financialPhone})<div class="inline-actions"><button onclick="editPatient('${p.id}')">Editar</button><button onclick="removePatient('${p.id}')" class="danger">Excluir</button></div></div>`).join('');
}

function filterAppointments(items) {
  const mode = agendaFilter.value;
  const now = new Date();
  if (mode === 'all') return items;
  if (mode === 'day') {
    const today = now.toISOString().slice(0, 10);
    return items.filter((a) => a.date === today);
  }
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now); monday.setDate(now.getDate() + diffToMonday); monday.setHours(0,0,0,0);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999);
  return items.filter((a) => {
    const dt = new Date(`${a.date}T${a.time}`);
    return dt >= monday && dt <= sunday;
  });
}

function renderAppointments() {
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const filtered = filterAppointments([...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)));
  if (!filtered.length) { appointmentsList.innerHTML = '<p class="empty">Nenhum agendamento para o filtro atual.</p>'; return; }
  appointmentsList.innerHTML = filtered.map((a) => {
    const p = patientMap[a.patientId];
    return `<div class="list-item"><strong>${a.date} ${a.time}</strong><br/>Paciente: ${p?.patientName || 'Não encontrado'}<br/>Endereço: ${p?.patientAddress || '-'}<br/>Contato: ${p?.patientPhone || '-'}<br/>Obs: ${a.notes || '-'}<div class="inline-actions"><button onclick="editAppointment('${a.id}')">Editar</button><button onclick="removeAppointment('${a.id}')" class="danger">Cancelar</button></div></div>`;
  }).join('');
}

window.editPatient = (id) => {
  const p = patients.find((x) => x.id === id); if (!p) return;
  Object.entries(p).forEach(([k,v]) => { if (patientForm[k]) patientForm[k].value = v; });
  setTab('pacientes');
};
window.removePatient = (id) => {
  patients = patients.filter((p) => p.id !== id);
  appointments = appointments.filter((a) => a.patientId !== id);
  saveAll(); renderPatients(); renderAppointments();
};
window.editAppointment = (id) => {
  const a = appointments.find((x) => x.id === id); if (!a) return;
  Object.entries(a).forEach(([k,v]) => { if (appointmentForm[k]) appointmentForm[k].value = v; });
  setTab('agendamento');
};
window.removeAppointment = (id) => {
  appointments = appointments.filter((a) => a.id !== id);
  saveAll(); renderAppointments();
};

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(patientForm).entries());
  if (data.id) patients = patients.map((p) => (p.id === data.id ? data : p));
  else patients.push({ id: `${Date.now()}`, ...data });
  resetPatientForm(); saveAll(); renderPatients(); renderAppointments();
});
appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(appointmentForm).entries());
  if (!patients.length) return alert('Cadastre um paciente antes de agendar.');
  if (data.id) appointments = appointments.map((a) => (a.id === data.id ? data : a));
  else appointments.push({ id: `${Date.now()}`, ...data });
  resetAppointmentForm(); saveAll(); renderAppointments();
});

cancelPatientBtn.addEventListener('click', resetPatientForm);
cancelAppointmentBtn.addEventListener('click', resetAppointmentForm);
agendaFilter.addEventListener('change', renderAppointments);

renderPatients();
renderAppointments();
