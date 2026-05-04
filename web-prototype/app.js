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
const newPatientBtn = document.getElementById('new-patient');
const repeatPatientBtn = document.getElementById('repeat-patient');
const toast = document.getElementById('toast');

let patients = JSON.parse(localStorage.getItem(STORAGE.patients) || '[]');
let appointments = JSON.parse(localStorage.getItem(STORAGE.appointments) || '[]');

const showToast = (msg, ok = true) => {
  toast.textContent = msg;
  toast.className = `toast show ${ok ? 'ok' : 'error'}`;
  setTimeout(() => (toast.className = 'toast'), 2800);
};

const setTab = (id) => {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === id));
  tabContents.forEach((c) => c.classList.toggle('active', c.id === id));
  if (id === 'pacientes') renderPatients();
};
tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

const saveAll = () => {
  localStorage.setItem(STORAGE.patients, JSON.stringify(patients));
  localStorage.setItem(STORAGE.appointments, JSON.stringify(appointments));
};

function resetPatientForm() { patientForm.reset(); patientForm.id.value = ''; patientForm.classList.add('hidden'); }
function resetAppointmentForm() { appointmentForm.reset(); appointmentForm.id.value = ''; }

function renderPatients() {
  patientSelect.innerHTML = '<option value="">Selecione o paciente</option>';
  patients.forEach((p) => {
    const option = document.createElement('option'); option.value = p.id; option.textContent = p.patientName; patientSelect.appendChild(option);
  });
  if (!patients.length) {
    patientsList.innerHTML = '<p class="empty">Nenhum paciente cadastrado.</p>';
    return;
  }
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
  const month = now.toISOString().slice(0, 7);
  return items.filter((a) => a.date.startsWith(month));
}

function renderMonthGrid(items, patientMap) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = (firstDay.getDay() + 6) % 7;

  const byDate = items.reduce((acc, a) => {
    acc[a.date] ||= [];
    acc[a.date].push(a);
    return acc;
  }, {});

  let html = '<div class="month-grid">';
  ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach((d) => { html += `<div class="head">${d}</div>`; });
  for (let i = 0; i < startWeekDay; i++) html += '<div class="cell empty"></div>';

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayItems = (byDate[d] || []).sort((a,b)=>a.time.localeCompare(b.time));
    html += `<div class="cell"><div class="day-number">${day}</div>${dayItems.map((a)=>{const p=patientMap[a.patientId];return `<div class="appt">${a.time} - ${p?.patientName || 'Paciente'}</div>`;}).join('')}</div>`;
  }
  html += '</div>';
  appointmentsList.innerHTML = html;
}

function renderAppointments() {
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const sorted = [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const filtered = filterAppointments(sorted);
  if (!filtered.length) { appointmentsList.innerHTML = '<p class="empty">Nenhum agendamento para o filtro atual.</p>'; return; }

  if (agendaFilter.value === 'month') {
    renderMonthGrid(filtered, patientMap);
    return;
  }

  const grouped = filtered.reduce((acc, a) => {
    acc[a.date] ||= [];
    acc[a.date].push(a);
    return acc;
  }, {});

  appointmentsList.innerHTML = Object.entries(grouped).map(([date, list]) => `<div class="calendar-day"><h3>${date}</h3>${list.map((a) => {
    const p = patientMap[a.patientId];
    return `<div class="list-item"><strong>${a.time}</strong> - ${p?.patientName || 'Não encontrado'}<br/>Contato: ${p?.patientPhone || '-'}<br/>Obs: ${a.notes || '-'}<div class="inline-actions"><button onclick="editAppointment('${a.id}')">Editar</button><button onclick="removeAppointment('${a.id}')" class="danger">Cancelar</button></div></div>`;
  }).join('')}</div>`).join('');
}

window.editPatient = (id) => {
  const p = patients.find((x) => x.id === id); if (!p) return;
  Object.entries(p).forEach(([k,v]) => { if (patientForm[k]) patientForm[k].value = v; });
  patientForm.classList.remove('hidden');
  setTab('pacientes');
};
window.removePatient = (id) => {
  const p = patients.find((x) => x.id === id);
  try {
    patients = patients.filter((x) => x.id !== id);
    appointments = appointments.filter((a) => a.patientId !== id);
    saveAll(); renderPatients(); renderAppointments();
    showToast(`Cadastro do paciente ${p?.patientName || ''} excluído com sucesso.`);
  } catch { showToast(`Erro ao excluir o paciente ${p?.patientName || ''}.`, false); }
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
  const action = data.id ? 'alterado' : 'criado';
  try {
    if (data.id) patients = patients.map((p) => (p.id === data.id ? data : p));
    else patients.push({ id: `${Date.now()}`, ...data });
    resetPatientForm(); saveAll(); renderPatients(); renderAppointments();
    showToast(`Cadastro do paciente ${data.patientName} ${action} com sucesso.`);
  } catch { showToast(`Erro ao alterar o paciente ${data.patientName}.`, false); }
});

appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(appointmentForm).entries());
  if (!data.patientId) return showToast('Selecione o paciente.', false);
  const p = patients.find((x) => x.id === data.patientId);
  if (data.id) appointments = appointments.map((a) => (a.id === data.id ? data : a));
  else appointments.push({ id: `${Date.now()}`, ...data });
  resetAppointmentForm(); saveAll(); renderAppointments();
  showToast(`Confirmado agendamento do paciente ${p?.patientName || ''} cadastrado para ${data.date.split('-').reverse().join('/')} às ${data.time}hs.`);
});

newPatientBtn.addEventListener('click', () => { resetPatientForm(); patientForm.classList.remove('hidden'); });
cancelPatientBtn.addEventListener('click', resetPatientForm);
cancelAppointmentBtn.addEventListener('click', resetAppointmentForm);
repeatPatientBtn.addEventListener('click', () => {
  patientForm.financialName.value = patientForm.patientName.value;
  patientForm.financialPhone.value = patientForm.patientPhone.value;
});
agendaFilter.addEventListener('change', renderAppointments);

renderPatients();
renderAppointments();
