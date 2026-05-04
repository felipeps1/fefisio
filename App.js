import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@fisioagenda:appointments';

function parseDateTime(value) {
  const normalized = value.trim().replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function formatDateLabel(value) {
  const date = parseDateTime(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

<<<<<<< codex/create-appointment-management-app-6qzpt3
=======
function getWeekRange(baseDate) {
  const day = baseDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

>>>>>>> main
export default function App() {
  const [patient, setPatient] = useState('');
  const [address, setAddress] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
<<<<<<< codex/create-appointment-management-app-6qzpt3
  const [calendarCursor, setCalendarCursor] = useState(new Date());
=======
  const [dateFilter, setDateFilter] = useState('');
  const [viewMode, setViewMode] = useState('all');
>>>>>>> main

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAppointments(JSON.parse(saved));
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
<<<<<<< codex/create-appointment-management-app-6qzpt3
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();

    return appointments
      .filter((item) => {
        const itemDate = parseDateTime(item.dateTime);
        return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() === month;
      })
      .sort((a, b) => parseDateTime(a.dateTime) - parseDateTime(b.dateTime));
  }, [appointments, calendarCursor]);

  const calendarTitle = useMemo(() => (
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(calendarCursor)
  ), [calendarCursor]);
=======
    const now = new Date();
    const { start, end } = getWeekRange(now);
    const todayIso = now.toISOString().slice(0, 10);
    const normalizedFilter = dateFilter.trim();

    const filtered = appointments.filter((item) => {
      const itemDate = parseDateTime(item.dateTime);
      if (!itemDate) return false;

      if (normalizedFilter && !item.dateTime.startsWith(normalizedFilter)) return false;

      if (viewMode === 'today') {
        return itemDate.toISOString().slice(0, 10) === todayIso;
      }

      if (viewMode === 'week') {
        return itemDate >= start && itemDate <= end;
      }

      return true;
    });

    return [...filtered].sort((a, b) => parseDateTime(a.dateTime) - parseDateTime(b.dateTime));
  }, [appointments, dateFilter, viewMode]);
>>>>>>> main

  const clearForm = () => {
    setPatient('');
    setAddress('');
    setDateTime('');
    setNotes('');
    setEditingId(null);
  };

  const saveAppointment = () => {
    if (!patient || !address || !dateTime) {
      Alert.alert('Campos obrigatórios', 'Preencha paciente, endereço e data/hora.');
      return;
    }

    if (!parseDateTime(dateTime)) {
      Alert.alert('Data inválida', 'Use o formato YYYY-MM-DD HH:mm. Ex.: 2026-05-10 14:30');
      return;
    }

    if (editingId) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, patient, address, dateTime, notes } : item,
        ),
      );
      clearForm();
      return;
    }

    const newAppointment = {
      id: `${Date.now()}`,
      patient,
      address,
      dateTime,
      notes,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    clearForm();
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setPatient(item.patient);
    setAddress(item.address);
    setDateTime(item.dateTime);
    setNotes(item.notes ?? '');
  };

  const removeAppointment = (id) => {
    setAppointments((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) clearForm();
  };

  const openMapRoute = async (destination) => {
    const encoded = encodeURIComponent(destination);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps neste dispositivo.');
      return;
    }

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>FisioAgenda</Text>
      <Text style={styles.subtitle}>Seus atendimentos domiciliares, organizados.</Text>

<<<<<<< codex/create-appointment-management-app-6qzpt3
      <View style={styles.calendarControls}>
        <TouchableOpacity style={styles.modeButton} onPress={() => setCalendarCursor((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))}>
          <Text style={styles.modeButtonText}>« Ano anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
          <Text style={styles.modeButtonText}>‹ Mês anterior</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{calendarTitle.charAt(0).toUpperCase() + calendarTitle.slice(1)}</Text>
        <TouchableOpacity style={styles.modeButton} onPress={() => setCalendarCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
          <Text style={styles.modeButtonText}>Mês seguinte ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => setCalendarCursor((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))}>
          <Text style={styles.modeButtonText}>Ano seguinte »</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shortcutRow}>
        <TouchableOpacity style={styles.modeButtonActive} onPress={() => setCalendarCursor(new Date())}>
          <Text style={styles.modeButtonTextActive}>Mês atual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modeButton} onPress={() => setCalendarCursor(new Date())}>
          <Text style={styles.modeButtonText}>Hoje</Text>
        </TouchableOpacity>
=======
      <View style={styles.modeRow}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'today', label: 'Hoje' },
          { key: 'week', label: 'Semana' },
        ].map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[styles.modeButton, viewMode === mode.key ? styles.modeButtonActive : null]}
            onPress={() => setViewMode(mode.key)}
          >
            <Text style={[styles.modeButtonText, viewMode === mode.key ? styles.modeButtonTextActive : null]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
>>>>>>> main
      </View>

      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Paciente" value={patient} onChangeText={setPatient} />
        <TextInput style={styles.input} placeholder="Endereço" value={address} onChangeText={setAddress} />
        <TextInput
          style={styles.input}
          placeholder="Data/Hora (YYYY-MM-DD HH:mm)"
          value={dateTime}
          onChangeText={setDateTime}
        />
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Observações"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.addButton} onPress={saveAppointment}>
            <Text style={styles.buttonText}>{editingId ? 'Salvar edição' : 'Adicionar agendamento'}</Text>
          </TouchableOpacity>
          {editingId ? (
            <TouchableOpacity style={styles.cancelButton} onPress={clearForm}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

<<<<<<< codex/create-appointment-management-app-6qzpt3
=======
      <TextInput
        style={styles.input}
        placeholder="Filtro extra por data (YYYY-MM-DD)"
        value={dateFilter}
        onChangeText={setDateFilter}
      />

>>>>>>> main
      <FlatList
        data={visibleAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
<<<<<<< codex/create-appointment-management-app-6qzpt3
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum agendamento neste mês.</Text>}
=======
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>}
>>>>>>> main
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.patient}</Text>
            <Text style={styles.cardText}>📍 {item.address}</Text>
            <Text style={styles.cardText}>🕒 {formatDateLabel(item.dateTime)}</Text>
            {item.notes ? <Text style={styles.cardText}>📝 {item.notes}</Text> : null}

            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => startEditing(item)}>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openMapRoute(item.address)}>
                <Text style={styles.routeText}>Ir com Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeAppointment(item.id)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb', paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '700', marginTop: 10, color: '#0b3d91' },
  subtitle: { color: '#4b5563', marginBottom: 14 },
<<<<<<< codex/create-appointment-management-app-6qzpt3
  calendarControls: { gap: 8, marginBottom: 10 },
  shortcutRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#0b3d91' },
=======
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
>>>>>>> main
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  modeButtonActive: { backgroundColor: '#0b3d91' },
  modeButtonText: { color: '#374151', fontWeight: '600' },
  modeButtonTextActive: { color: '#fff' },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  notesInput: { minHeight: 64, textAlignVertical: 'top' },
  addButton: {
    backgroundColor: '#0b3d91',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexGrow: 1,
  },
  cancelButton: {
    borderColor: '#9ca3af',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  cancelText: { color: '#4b5563', fontWeight: '600' },
  listContent: { paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: '#6b7280', marginTop: 30 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardText: { color: '#374151', marginBottom: 2 },
  editText: { color: '#1d4ed8', fontWeight: '600' },
  routeText: { color: '#0f766e', fontWeight: '600' },
  removeText: { color: '#b91c1c', fontWeight: '600' },
});
