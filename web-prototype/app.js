const STORAGE = { patients: 'fefisio:patients', appointments: 'fefisio:appointments' };

function safeReadArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizePatients(rawPatients) {
  let changed = false;
  const normalized = rawPatients.map((p, i) => {
    if (!p.id || p.id === 'undefined') {
      changed = true;
      return { ...p, id: `p_${Date.now()}_${i}` };
    }
    return p;
  });
  if (changed) localStorage.setItem(STORAGE.patients, JSON.stringify(normalized));
  return normalized;
}

function normalizeAppointments(rawAppointments) {
  let changed = false;
  const normalized = rawAppointments.map((a, i) => {
    if (!a.id || a.id === 'undefined') {
      changed = true;
      return { ...a, id: `a_${Date.now()}_${i}` };
    }
    return a;
  });
  if (changed) localStorage.setItem(STORAGE.appointments, JSON.stringify(normalized));
  return normalized;
}

const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const patientForm = document.getElementById('patient-form');
const appointmentForm = document.getElementById('appointment-form');
const patientsList = document.getElementById('patients-list');
const appointmentsList = document.getElementById('appointments-list');
const patientSelect = document.getElementById('appointment-patient');
const cancelPatientBtn = document.getElementById('cancel-patient');
const cancelAppointmentBtn = document.getElementById('cancel-appointment');
const newPatientBtn = document.getElementById('new-patient');
const repeatPatientBtn = document.getElementById('repeat-patient');
const toast = document.getElementById('toast');
const patientNameInput = patientForm.patientName;
const calendarTitle = document.getElementById('calendar-title');
const welcomeScreen = document.getElementById('welcome-screen');
const systemScreen = document.getElementById('system-screen');
const enterSystemBtn = document.getElementById('enter-system');
const recurringCheckbox = document.getElementById('is-recurring');
const recurrenceFields = document.getElementById('recurrence-fields');
const recurrenceEndDate = document.getElementById('recurrence-end-date');
const todayMessage = document.getElementById('today-message');
const appointmentHour = document.getElementById('appointment-hour');
const appointmentMinute = document.getElementById('appointment-minute');
const appointmentTimeHidden = document.getElementById('appointment-time-hidden');

let patients = normalizePatients(safeReadArray(STORAGE.patients));
let appointments = normalizeAppointments(safeReadArray(STORAGE.appointments));
let calendarCursor = new Date();

const showToast = (msg, ok = true) => {
  toast.textContent = msg;
  toast.className = `toast show ${ok ? 'ok' : 'error'}`;
  setTimeout(() => (toast.className = 'toast'), 2800);
};

const setTab = (id) => {
  tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === id));
  tabContents.forEach((c) => c.classList.toggle('active', c.id === id));
  if (id === 'pacientes') renderPatients();
  if (id === 'agenda') renderAppointments();
};
tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

const saveAll = () => {
  localStorage.setItem(STORAGE.patients, JSON.stringify(patients));
  localStorage.setItem(STORAGE.appointments, JSON.stringify(appointments));
};

function showPatientListMode() { patientForm.classList.add('hidden'); patientsList.classList.remove('hidden'); }
function showPatientFormMode() { patientForm.classList.remove('hidden'); patientsList.classList.remove('hidden'); }
function resetPatientForm() { patientForm.reset(); patientForm.id.value = ''; showPatientListMode(); }
function resetAppointmentForm() { appointmentForm.reset(); appointmentForm.id.value = ''; }
function syncTimeHiddenField() {
  appointmentTimeHidden.value = `${appointmentHour.value}:${appointmentMinute.value}`;
}
function getRecurringDates(startDate, endDate, weekdays) {
  const dates = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const last = new Date(`${endDate}T00:00:00`);
  while (cursor <= last) {
    if (weekdays.includes(cursor.getDay())) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function renderPatients() {
  patientSelect.innerHTML = '<option value="" selected disabled>Selecione o paciente</option>';
  patients.forEach((p) => {
    const option = document.createElement('option'); option.value = p.id; option.textContent = p.patientName; patientSelect.appendChild(option);
  });
  if (!patients.length) return (patientsList.innerHTML = '<p class="empty">Nenhum paciente cadastrado.</p>');
  const helper = '<p class="empty">Para editar um paciente já cadastrado, clique em "Editar" no cartão abaixo.</p>';
  patientsList.innerHTML = patients.map((p) => `<div class="list-item"><strong>${p.patientName}</strong><br/>Endereço: ${p.patientAddress}<br/>Tel paciente: ${p.patientPhone}<br/>Resp. financeiro: ${p.financialName} (${p.financialPhone})<div class="inline-actions"><button onclick="editPatient('${p.id}')">Editar</button><button onclick="removePatient('${p.id}')" class="danger">Excluir</button></div></div>`).join('');
  patientsList.innerHTML = helper + patientsList.innerHTML;
}

function renderMonthGrid(items, patientMap, year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekDay = (firstDay.getDay() + 6) % 7;
  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(firstDay);
  calendarTitle.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const byDate = items.reduce((acc, a) => { acc[a.date] ||= []; acc[a.date].push(a); return acc; }, {});
  const today = new Date().toISOString().slice(0, 10);

  let html = '<div class="month-grid">';
  ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].forEach((d) => { html += `<div class="head">${d}</div>`; });
  for (let i = 0; i < startWeekDay; i++) html += '<div class="cell empty"></div>';

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayItems = (byDate[d] || []).sort((a,b)=>a.time.localeCompare(b.time));
    const todayClass = d === today ? 'today' : '';
    html += `<div class="cell ${todayClass}"><div class="day-number">${day}</div>${dayItems.map((a)=>{const p=patientMap[a.patientId];return `<div class="appt">${a.time} - ${p?.patientName || 'Paciente'}</div>`;}).join('')}</div>`;
  }
  html += '</div>';
  appointmentsList.innerHTML = html;
}

function renderAppointments() {
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const sorted = [...appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const monthItems = sorted.filter((a) => {
    if (!a.date) return false;
    const [y, m] = a.date.split('-').map(Number);
    return y === year && m === month + 1;
  });

  renderMonthGrid(monthItems, patientMap, year, month);
  appointmentsList.innerHTML += `<div class="card">${renderMonthAppointmentsList(monthItems, patientMap)}</div>`;
}

function renderMonthAppointmentsList(items, patientMap) {
  if (!items.length) return '<p class="empty">Nenhum agendamento neste mês.</p>';
  return items.map((a) => {
    const p = patientMap[a.patientId];
    const recurringAction = a.recurrenceGroupId ? `<button onclick="removeRecurringGroup('${a.recurrenceGroupId}')" class="danger">Excluir recorrência</button>` : '';
    return `<div class="list-item"><strong>${p?.patientName || 'Paciente'}</strong><br/>Data: ${a.date} às ${a.time}<br/>Endereço: ${p?.patientAddress || '-'}<br/>Observações: ${a.notes || '-'}<div class="inline-actions"><button onclick="editAppointment('${a.id}')">Editar</button><button onclick="removeAppointment('${a.id}')" class="danger">Excluir</button>${recurringAction}</div></div>`;
  }).join('');
}

window.editPatient = (id) => {
  const p = patients.find((x) => x.id === id); if (!p) return;
  Object.entries(p).forEach(([k,v]) => { if (patientForm[k]) patientForm[k].value = v; });
  showPatientFormMode(); setTab('pacientes');
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
  if (a.time) {
    const [h, m] = a.time.split(':');
    appointmentHour.value = h;
    appointmentMinute.value = m;
    syncTimeHiddenField();
  }
  setTab('agendamento');
};
window.removeAppointment = (id) => { appointments = appointments.filter((a) => a.id !== id); saveAll(); renderAppointments(); };
window.removeRecurringGroup = (groupId) => {
  appointments = appointments.filter((a) => a.recurrenceGroupId !== groupId);
  saveAll(); renderAppointments();
  showToast('Recorrência excluída com sucesso.');
};

patientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(patientForm).entries());
  const action = data.id ? 'alterado' : 'criado';
  try {
    if (data.id) patients = patients.map((p) => (p.id === data.id ? data : p));
    else patients.push({ ...data, id: `p_${Date.now()}` });
    resetPatientForm(); saveAll(); renderPatients(); renderAppointments();
    showToast(`Cadastro do paciente ${data.patientName} ${action} com sucesso.`);
  } catch { showToast(`Erro ao alterar o paciente ${data.patientName}.`, false); }
});

appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    syncTimeHiddenField();
    const data = Object.fromEntries(new FormData(appointmentForm).entries());
    let selectedPatient = patients.find((x) => String(x.id) === String(data.patientId));
    if (!selectedPatient) {
      const selectedLabel = patientSelect.options[patientSelect.selectedIndex]?.textContent?.trim();
      selectedPatient = patients.find((x) => x.patientName === selectedLabel);
      if (selectedPatient) data.patientId = selectedPatient.id;
    }
    if (!data.patientId || !selectedPatient) return showToast('Selecione o paciente.', false);
    if (data.id) {
      appointments = appointments.map((a) => (a.id === data.id ? data : a));
    } else if (recurringCheckbox.checked) {
      const weekdays = [...appointmentForm.querySelectorAll('input[name="weekdays"]:checked')].map((el) => Number(el.value));
      if (!weekdays.length) return showToast('Selecione ao menos um dia da semana para recorrência.', false);
      if (!recurrenceEndDate.value) return showToast('Informe a data final da recorrência.', false);
      const recurrenceGroupId = `rg_${Date.now()}`;
      const recurringDates = getRecurringDates(data.date, recurrenceEndDate.value, weekdays);
      recurringDates.forEach((date, idx) => {
        appointments.push({ ...data, date, id: `a_${Date.now()}_${idx}`, recurrenceGroupId });
      });
    } else {
      appointments.push({ ...data, id: `a_${Date.now()}` });
    }
    const formattedDate = data.date.includes('-') ? data.date.split('-').reverse().join('/') : data.date;
    resetAppointmentForm(); saveAll(); renderAppointments();
    showToast(`Confirmado agendamento do paciente ${selectedPatient.patientName} cadastrado para ${formattedDate} às ${data.time}hs.`);
  } catch { showToast('Erro ao salvar agendamento.', false); }
});

newPatientBtn.addEventListener('click', () => {
  patientForm.reset(); patientForm.id.value = ''; toast.className = 'toast'; toast.textContent = '';
  showPatientFormMode(); patientNameInput.focus();
});
enterSystemBtn.addEventListener('click', () => {
  welcomeScreen.classList.remove('active');
  systemScreen.classList.add('active');
  setTab('home');
});
recurringCheckbox.addEventListener('change', () => recurrenceFields.classList.toggle('hidden', !recurringCheckbox.checked));
appointmentHour.addEventListener('change', syncTimeHiddenField);
appointmentMinute.addEventListener('change', syncTimeHiddenField);
cancelPatientBtn.addEventListener('click', resetPatientForm);
cancelAppointmentBtn.addEventListener('click', resetAppointmentForm);
repeatPatientBtn.addEventListener('click', () => {
  patientForm.financialName.value = patientForm.patientName.value;
  patientForm.financialPhone.value = patientForm.patientPhone.value;
});

document.getElementById('prev-month').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()-1); renderAppointments(); });
document.getElementById('next-month').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth()+1); renderAppointments(); });
document.getElementById('prev-year').addEventListener('click', () => { calendarCursor.setFullYear(calendarCursor.getFullYear()-1); renderAppointments(); });
document.getElementById('next-year').addEventListener('click', () => { calendarCursor.setFullYear(calendarCursor.getFullYear()+1); renderAppointments(); });
document.getElementById('go-current-month').addEventListener('click', () => { calendarCursor = new Date(); renderAppointments(); });
document.getElementById('go-today').addEventListener('click', () => { calendarCursor = new Date(); setTab('agenda'); renderAppointments(); });

welcomeScreen.classList.add('active');
systemScreen.classList.remove('active');
todayMessage.textContent = `Seja bem-vindo, hoje é dia ${new Intl.DateTimeFormat('pt-BR').format(new Date())}.`;
renderPatients();
showPatientListMode();
renderAppointments();
for (let h = 0; h < 24; h++) {
  const hh = String(h).padStart(2, '0');
  const option = document.createElement('option');
  option.value = hh;
  option.textContent = hh;
  appointmentHour.appendChild(option);
}
appointmentHour.value = '08';
appointmentMinute.value = '00';
syncTimeHiddenField();
