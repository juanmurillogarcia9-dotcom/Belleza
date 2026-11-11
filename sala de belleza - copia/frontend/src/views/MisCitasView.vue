<template>
  <q-page class="appointments-page q-pa-xl">
    <div class="appointments-wrapper">
      <header class="page-heading">
        <span class="eyebrow">Tu espacio personal</span>
        <h1>Bienvenida/o, {{ auth.usuario?.nombre || 'cliente' }}</h1>
        <p>Aquí puedes consultar tus citas y cancelar las que ya no necesites.</p>
      </header>

      <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
      <div v-if="cargando" class="empty-card">Cargando tus citas...</div>
      <div v-else-if="citas.length === 0" class="empty-card">
        <span class="empty-icon">🌸</span>
        <h2>Aún no tienes citas</h2>
        <p>Cuando reserves una cita, aparecerá aquí con su fecha y horario.</p>
        <router-link class="primary-link" to="/agendar">Agendar una cita</router-link>
      </div>
      <div v-else class="appointment-list">
        <article v-for="cita in citas" :key="cita._id" class="appointment-card">
          <div class="appointment-details">
            <span class="appointment-date">{{ fechaLegible(cita.fecha) }} · {{ cita.horaInicio }}–{{ cita.horaFin }}</span>
            <h2>{{ cita.servicio }}</h2>
            <p>Con {{ cita.estilistaUsuarioId?.nombre || 'tu estilista' }}</p>
            <span v-if="cita.estado === 'cancelada'" class="status cancelled">Cancelada</span>
            <span v-else class="status active">Confirmada</span>
          </div>
          <button
            v-if="cita.estado !== 'cancelada' && cita.fecha >= hoy"
            class="cancel-button"
            type="button"
            :disabled="cancelando === cita._id"
            @click="cancelar(cita)"
          >
            {{ cancelando === cita._id ? 'Cancelando...' : 'Cancelar cita' }}
          </button>
        </article>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const auth = useAuthStore()
const citas = ref([])
const cargando = ref(true)
const error = ref('')
const cancelando = ref('')
const fecha = new Date()
const hoy = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

function fechaLegible(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(year, month - 1, day))
}

async function cargarCitas() {
  cargando.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_URL}/citas/mis-citas`, { headers: auth.encabezadosAutenticados() })
    const resultado = await response.json()
    if (!response.ok) throw new Error(resultado.error || 'No se pudieron cargar tus citas.')
    citas.value = resultado
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

async function cancelar(cita) {
  if (!window.confirm(`¿Deseas cancelar la cita de ${cita.servicio} del ${fechaLegible(cita.fecha)}?`)) return
  cancelando.value = cita._id
  error.value = ''
  try {
    const response = await fetch(`${API_URL}/citas/${cita._id}/cancelar`, {
      method: 'PATCH',
      headers: auth.encabezadosAutenticados()
    })
    const resultado = await response.json()
    if (!response.ok) throw new Error(resultado.error || 'No se pudo cancelar la cita.')
    cita.estado = 'cancelada'
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.'
  } finally {
    cancelando.value = ''
  }
}

onMounted(cargarCitas)
</script>

<style scoped>
.appointments-page { min-height: 100vh; background: #f8f3f1; }
.appointments-wrapper { width: min(100%, 900px); margin: 0 auto; }
.page-heading { margin-bottom: 30px; text-align: center; }
.eyebrow { color: #a2546c; font-size: .8rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
h1, h2 { color: #292525; font-family: 'Playfair Display', Georgia, serif; }
h1 { margin: 9px 0; font-size: 2.2rem; }
.page-heading p, .appointment-details p { color: #6e6463; }
.empty-card { padding: 42px 24px; border: 1px solid #eadce1; border-radius: 14px; background: #fff; text-align: center; color: #6e6463; }
.empty-icon { font-size: 2.4rem; }
.empty-card h2 { margin: 10px 0; }
.primary-link { display: inline-block; margin-top: 12px; padding: 11px 20px; border-radius: 5px; background: #8f455e; color: white; text-decoration: none; font-weight: 700; }
.appointment-list { display: grid; gap: 14px; }
.appointment-card { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 22px 24px; border: 1px solid #eadce1; border-radius: 12px; background: #fff; }
.appointment-date { color: #8f455e; font-weight: 700; }
.appointment-details h2 { margin: 8px 0 2px; font-size: 1.25rem; }
.appointment-details p { margin: 0 0 10px; }
.status { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: .8rem; font-weight: 700; }
.active { background: #e6f4eb; color: #287348; }
.cancelled { background: #f8e9e9; color: #a32d3d; }
.cancel-button { padding: 10px 14px; border: 1px solid #a32d3d; border-radius: 5px; background: #fff; color: #a32d3d; font-weight: 700; cursor: pointer; white-space: nowrap; }
.cancel-button:disabled { opacity: .6; cursor: wait; }
.feedback { margin: 0 0 18px; color: #a32d3d; }
@media (max-width: 600px) { .appointment-card { align-items: flex-start; flex-direction: column; } h1 { font-size: 1.8rem; } }
</style>
