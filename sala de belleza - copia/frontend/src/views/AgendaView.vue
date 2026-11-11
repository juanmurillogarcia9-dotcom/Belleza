<template>
  <q-page class="esther-page q-pa-xl flex flex-center">
    <!-- Capa de fondo con imagen de salón -->
    <div class="salon-background"></div>

    <div class="agenda-wrapper">
      <!-- Encabezado con tipografía de lujo -->
      <div class="q-mb-xl text-center header-container">
        <span class="sub-title-badge">✨ Panel Exclusivo ✨</span>
        <h1 class="luxury-heading text-h3 text-weight-bold text-dark q-mt-sm q-mb-xs">
          Bienvenido, {{ auth.usuario?.nombre || 'estilista' }}
        </h1>
        <p class="text-subtitle1 text-muted luxury-subtitle">Gestión y control de citas con elegancia y precisión</p>
      </div>

      <!-- Contenedor Principal -->
      <div class="agenda-container q-mx-auto">
        <!-- Selector de Fecha Estilizado -->
        <div class="esther-card q-mb-lg flex items-center justify-between date-card">
          <div class="flex items-center gap-2">
            <span class="date-icon">📅</span>
            <span class="text-pink text-weight-bold luxury-label">Fecha Seleccionada</span>
          </div>
          <input v-model="fechaSeleccionada" type="date" class="date-input-luxury" />
        </div>

        <!-- Tarjeta de Citas Programadas -->
        <div class="esther-card main-table-card">
          <div class="flex items-center justify-between q-mb-lg">
            <div class="text-h6 luxury-heading text-pink text-weight-bold">Citas Programadas</div>
            <span class="badge-count">{{ citas.length }} Citas</span>
          </div>

          <div class="table-container">
            <div class="table-header">
              <span>Horario</span>
              <span>Cliente</span>
              <span>Estilista Asignado</span>
            </div>

            <!-- Lista de Citas -->
            <div v-if="citas.length > 0">
              <div v-for="cita in citas" :key="cita._id || cita.id" class="table-row">
                <span class="text-pink text-weight-bold time-badge">{{ cita.horaInicio }} - {{ cita.horaFin }}</span>
                <span class="text-dark text-weight-medium">
                  {{ cita.clienteId?.nombre || cita.cliente || 'Cliente' }}
                  <small class="service-detail">{{ cita.servicio || 'Servicio general' }} · {{ cita.duracionMinutos || 30 }} min</small>
                </span>
                <span class="text-muted">{{ cita.estilistaUsuarioId?.nombre || cita.estilistaId?.nombre || cita.estilista || 'Estilista' }}</span>
              </div>
            </div>

            <!-- Estado Vacío Elegante (Sin errores molestos en pantalla) -->
            <div v-else class="empty-state">
              <span class="empty-icon">🌸</span>
              <p class="text-muted luxury-subtitle">No hay citas registradas para esta fecha.</p>
              <span class="empty-hint">Selecciona otra fecha en el calendario superior</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '../stores/authStore';

const hoy = new Date();
const fechaLocal = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
const fechaSeleccionada = ref(fechaLocal);
const citas = ref([]);
const auth = useAuthStore();

async function cargarCitas() {
  try {
    const response = await fetch(`http://localhost:4000/api/citas?fecha=${fechaSeleccionada.value}`, {
      headers: auth.encabezadosAutenticados ? auth.encabezadosAutenticados() : {}
    });
    
    if (response.ok) {
      const resultado = await response.json();
      // Verificamos que sea un arreglo antes de asignarlo
      citas.value = Array.isArray(resultado) ? resultado : [];
    } else {
      citas.value = [];
    }
  } catch (error) {
    // Silenciamos el error en la interfaz para que no muestre alertas feas
    console.warn("Aviso de red o servidor:", error);
    citas.value = [];
  }
}

onMounted(cargarCitas);
watch(fechaSeleccionada, cargarCitas);
</script>

<style scoped>
.esther-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* Fondo con imagen de peluquería y gradiente refinado */
.salon-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(252, 251, 249, 0.82), rgba(252, 251, 249, 0.88)), 
                    url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920');
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.agenda-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 950px;
}

.sub-title-badge {
  display: inline-block;
  font-size: 0.85rem;
  letter-spacing: 2px;
  color: #b3637e;
  text-transform: uppercase;
  font-weight: 600;
  background: rgba(216, 131, 158, 0.1);
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(216, 131, 158, 0.2);
}

.luxury-heading {
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.5px;
}

.luxury-subtitle {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.05rem;
}

.text-dark {
  color: #232023 !important;
}

.text-pink {
  color: #b3637e !important;
}

.text-muted {
  color: #5c5559 !important;
}

.service-detail { display: block; margin-top: 4px; color: #766a6d; font-size: .82rem; font-weight: 400; }

/* Tarjetas con efectos de cristal y bordes delicados */
.esther-card {
  background-color: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(216, 131, 158, 0.25);
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 15px 40px rgba(179, 99, 126, 0.08);
}

.date-card {
  padding: 20px 32px;
}

.luxury-label {
  letter-spacing: 0.5px;
  font-size: 0.95rem;
}

.date-input-luxury {
  max-width: 210px;
  background-color: #fff9fb;
  border: 1px solid rgba(216, 131, 158, 0.3);
  color: #232023;
  padding: 10px 16px;
  border-radius: 12px;
  outline: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.date-input-luxury:focus {
  border-color: #b3637e;
  box-shadow: 0 0 0 4px rgba(216, 131, 158, 0.15);
}

.badge-count {
  font-size: 0.8rem;
  background-color: #fff4f7;
  color: #b3637e;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(216, 131, 158, 0.2);
  font-weight: 600;
}

.table-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-header {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1.4fr;
  padding: 14px 20px;
  font-size: 0.8rem;
  color: #b3637e;
  font-weight: 700;
  border-bottom: 2px solid #f2e6ec;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 1.4fr;
  padding: 18px 20px;
  background-color: #fcf9fb;
  border: 1px solid #f0e1e7;
  border-radius: 14px;
  align-items: center;
  transition: all 0.3s ease;
}

.table-row:hover {
  background-color: #fff5f8;
  border-color: #d8839e;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(216, 131, 158, 0.1);
}

.time-badge {
  background: rgba(216, 131, 158, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
  width: fit-content;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-hint {
  display: block;
  font-size: 0.8rem;
  color: #9c9096;
  margin-top: 6px;
}
</style>