<template>
  <q-page class="esther-page q-pa-xl flex flex-center">
    <div class="salon-background"></div>

    <div class="form-wrapper">
      <div class="text-center q-mb-xl">
        <span class="sub-title-badge">✨ Reservaciones ✨</span>
        <h1 class="luxury-heading text-h3 text-weight-bold text-dark q-mt-sm q-mb-xs">Reservar Cita</h1>
        <p class="text-subtitle1 text-muted luxury-subtitle">Separa tu espacio para una experiencia única de belleza</p>
      </div>

      <div class="esther-card">
        <form class="esther-form" @submit.prevent="registrarCita">
          
          <div class="profile-note">Reservando como <strong>{{ auth.usuario?.nombre || 'Cliente' }}</strong></div>

          <!-- Seleccionar Servicio -->
          <div class="input-group">
            <label class="input-label">Seleccionar Servicio</label>
            <select v-model="form.servicioId" class="luxury-input" required>
              <option disabled value="">Seleccione un servicio...</option>
              <option v-for="servicio in servicios" :key="servicio._id" :value="servicio._id">
                {{ servicio.nombre }} - {{ precioLegible(servicio.precio) }} ({{ servicio.duracionMinutos }} min)
              </option>
            </select>
          </div>

          <!-- Seleccionar Estilista -->
          <div class="input-group">
            <label class="input-label">Seleccionar Estilista</label>
            <select v-model="form.estilistaId" class="luxury-input" required>
              <option disabled value="">Seleccione un estilista...</option>
              <option v-for="estilista in estilistas" :key="estilista._id" :value="estilista._id">
                {{ estilista.nombre }} - {{ (estilista.especialidades || [estilista.especialidad]).filter(Boolean).join(', ') }}
              </option>
            </select>
          </div>

          <!-- Fecha de la Cita -->
          <div class="input-group">
            <label class="input-label">Fecha de la Cita</label>
            <input type="date" v-model="form.fecha" :min="hoy" class="luxury-input" required />
          </div>

          <!-- Hora Inicio y Hora Fin -->
          <div class="row q-col-gutter-md">
            <div class="col-6 input-group">
              <label class="input-label">Hora Inicio</label>
              <input type="time" v-model="form.horaInicio" class="luxury-input" required />
            </div>

            <div class="col-6 input-group">
              <label class="input-label">Hora Fin</label>
              <input type="time" :value="horaFin" class="luxury-input" readonly />
            </div>
          </div>
          <p v-if="form.horaInicio && !horaFin" class="time-error">El horario no puede terminar después de la medianoche.</p>

          <!-- Botón -->
          <p v-if="error" class="time-error" role="alert">{{ error }}</p>
          <p v-if="exito" class="success-message" role="status">{{ exito }}</p>
          <div class="q-mt-xl">
            <button type="submit" class="btn-esther full-width" :disabled="!horaFin || !form.servicioId">Confirmar Reserva</button>
          </div>
        </form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const auth = useAuthStore();

const servicios = ref([]);
const estilistas = ref([]);
const error = ref('');
const exito = ref('');
const ahora = new Date();
const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
const form = ref({ servicioId: '', estilistaId: '', fecha: '', horaInicio: '' });

const servicioSeleccionado = computed(() => servicios.value.find((servicio) => servicio._id === form.value.servicioId));

function precioLegible(precio) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(precio));
}

async function cargarCatalogos() {
  try {
    const [serviciosResponse, estilistasResponse] = await Promise.all([
      fetch(`${API_URL}/servicios`),
      fetch(`${API_URL}/estilistas`)
    ]);
    if (!serviciosResponse.ok || !estilistasResponse.ok) throw new Error('No se pudieron cargar los servicios y estilistas.');
    servicios.value = await serviciosResponse.json();
    estilistas.value = await estilistasResponse.json();
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.';
  }
}

const horaFin = computed(() => {
  if (!servicioSeleccionado.value || !form.value.horaInicio) return '';
  const [hora, minuto] = form.value.horaInicio.split(':').map(Number);
  const minutosFin = hora * 60 + minuto + servicioSeleccionado.value.duracionMinutos;
  if (minutosFin >= 24 * 60) return '';
  return `${String(Math.floor(minutosFin / 60)).padStart(2, '0')}:${String(minutosFin % 60).padStart(2, '0')}`;
});

async function registrarCita() {
  error.value = '';
  exito.value = '';
  try {
    const response = await fetch(`${API_URL}/citas`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        ...auth.encabezadosAutenticados()
      },
      body: JSON.stringify({
        servicioId: form.value.servicioId,
        estilistaId: form.value.estilistaId,
        fecha: form.value.fecha,
        horaInicio: form.value.horaInicio
      })
    });
    const resultado = await response.json();
    if (!response.ok) throw new Error(resultado.error || 'No se pudo agendar la cita');

    exito.value = `Cita agendada. Finaliza a las ${resultado.cita?.horaFin || horaFin.value}. Puedes consultarla en “Mis citas”.`;
    form.value = { servicioId: '', estilistaId: '', fecha: '', horaInicio: '' };
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.';
  }
}

onMounted(cargarCatalogos);
</script>

<style scoped>
.esther-page { position: relative; min-height: 100vh; overflow: hidden; }
.salon-background {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-image: linear-gradient(rgba(252, 251, 249, 0.82), rgba(252, 251, 249, 0.88)), 
                    url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920');
  background-size: cover; background-position: center; z-index: 1;
}
.form-wrapper { position: relative; z-index: 2; width: 100%; max-width: 650px; padding: 20px 0; }
.sub-title-badge {
  display: inline-block; font-size: 0.85rem; letter-spacing: 2px; color: #b3637e; text-transform: uppercase; font-weight: 600;
  background: rgba(216, 131, 158, 0.1); padding: 4px 14px; border-radius: 20px; border: 1px solid rgba(216, 131, 158, 0.2);
}
.luxury-heading { font-family: 'Playfair Display', serif; letter-spacing: -0.5px; color: #232023; }
.luxury-subtitle { font-family: 'Playfair Display', serif; font-style: italic; color: #5c5559; }
.esther-card {
  background-color: rgba(255, 255, 255, 0.96); backdrop-filter: blur(12px);
  border: 1px solid rgba(216, 131, 158, 0.25); border-radius: 20px; padding: 40px; box-shadow: 0 15px 40px rgba(179, 99, 126, 0.08);
}
.esther-form { display: flex; flex-direction: column; gap: 20px; }
.profile-note { padding: 12px 16px; border-left: 3px solid #b3637e; background: #fff4f7; color: #5c5559; }
.time-error { margin: -12px 0 0; color: #a32d3d; font-size: 0.9rem; }
.success-message { margin: -12px 0 0; color: #287348; font-size: .9rem; }
.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-label { font-size: 0.9rem; color: #b3637e; font-weight: 600; letter-spacing: 0.5px; }
.luxury-input {
  background-color: #fff9fb; border: 1px solid rgba(216, 131, 158, 0.3); color: #232023;
  padding: 12px 16px; border-radius: 12px; outline: none; font-size: 0.95rem; transition: all 0.3s ease; width: 100%;
}
.luxury-input:focus { border-color: #b3637e; box-shadow: 0 0 0 4px rgba(216, 131, 158, 0.15); background-color: #ffffff; }
.btn-esther {
  background: linear-gradient(135deg, #d8839e 0%, #b3637e 100%); color: white; border: none; padding: 14px;
  border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(216, 131, 158, 0.3);
}
.btn-esther:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(216, 131, 158, 0.4); }
.btn-esther:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.full-width { width: 100%; }
</style>