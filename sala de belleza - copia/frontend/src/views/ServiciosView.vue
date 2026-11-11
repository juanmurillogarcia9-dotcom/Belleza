<template>
  <q-page class="esther-page q-pa-xl flex flex-center">
    <div class="salon-background"></div>

    <div class="content-wrapper">
      <div class="text-center q-mb-xl">
        <span class="sub-title-badge">✨ Tratamientos Exclusivos ✨</span>
        <h1 class="luxury-heading text-h3 text-weight-bold text-dark q-mt-sm q-mb-xs">Nuestros Servicios</h1>
        <p class="text-subtitle1 text-muted luxury-subtitle">Tratamientos diseñados para realzar tu belleza natural</p>
      </div>

      <section v-if="auth.usuario?.rol === 'estilista'" class="service-admin">
        <h2 class="luxury-heading">Administrar servicios</h2>
        <form class="service-form" @submit.prevent="crearServicio">
          <label>Nombre<input v-model.trim="nuevo.nombre" required /></label>
          <label>Descripción<input v-model.trim="nuevo.descripcion" /></label>
          <div class="form-pair">
            <label>Precio (COP)<input v-model.number="nuevo.precio" type="number" min="0" step="1000" required /></label>
            <label>Duración (minutos)<input v-model.number="nuevo.duracionMinutos" type="number" min="1" step="1" required /></label>
          </div>
          <p v-if="error" class="form-error" role="alert">{{ error }}</p>
          <p v-if="exito" class="form-success" role="status">{{ exito }}</p>
          <button type="submit" :disabled="guardando">{{ guardando ? 'Guardando...' : 'Agregar servicio' }}</button>
        </form>
      </section>
      
      <div class="row q-col-gutter-lg justify-center">
        <div class="col-12 col-md-4" v-for="servicio in servicios" :key="servicio._id || servicio.id">
          <div class="esther-card">
            <!-- Imagen superior ajustada a la tarjeta -->
            <div class="card-image-container">
              <img :src="imagenServicio(servicio)" :alt="servicio.nombre" class="service-img" />
            </div>

            <!-- Contenido de la tarjeta -->
            <div class="card-content flex column justify-between">
              <div>
                <div class="text-h6 text-pink luxury-heading text-weight-bold q-mb-sm">{{ servicio.nombre }}</div>
                <p class="text-muted text-body2 q-mb-lg" style="line-height: 1.6;">{{ servicio.descripcion || 'Servicio personalizado para resaltar tu belleza.' }}</p>
                <p class="duration-line">{{ servicio.duracionMinutos }} minutos</p>
              </div>
              <div class="text-center">
                <span class="price-tag">{{ precioLegible(servicio.precio) }}</span>
                <button v-if="auth.usuario?.rol === 'estilista'" class="remove-service" type="button" @click="desactivarServicio(servicio)">Desactivar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const auth = useAuthStore();
const servicios = ref([]);
const nuevo = ref({ nombre: '', descripcion: '', precio: null, duracionMinutos: 30 });
const guardando = ref(false);
const error = ref('');
const exito = ref('');
const presentacion = {
  'corte-signature': {
    descripcion: 'Corte personalizado acorde a la forma de tu rostro y asesoramiento de imagen profesional.',
    imagen: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'
  },
  'coloracion-balayage': {
    descripcion: 'Técnicas avanzadas de iluminación con productos de alta gama que nutren tu cabello.',
    imagen: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800'
  },
  'manicure-pedicure-spa': {
    descripcion: 'Cuidado completo de manos y pies con esmaltado semipermanente de larga duración.',
    imagen: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'
  }
};

function imagenServicio(servicio) {
  return presentacion[servicio.id]?.imagen || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800';
}

function precioLegible(precio) {
  const valor = Number(precio);
  return Number.isFinite(valor) ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor) : precio;
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_URL}/servicios`);
    if (!response.ok) throw new Error('No se pudo cargar el catálogo');
    servicios.value = await response.json();
  } catch (err) {
    console.error('Error al cargar servicios:', err);
    error.value = err.message || 'No se pudo cargar el catálogo de servicios.';
  }
}

async function crearServicio() {
  guardando.value = true;
  error.value = '';
  exito.value = '';
  try {
    const response = await fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.encabezadosAutenticados() },
      body: JSON.stringify(nuevo.value)
    });
    const resultado = await response.json();
    if (!response.ok) throw new Error(resultado.error || 'No se pudo crear el servicio.');
    nuevo.value = { nombre: '', descripcion: '', precio: null, duracionMinutos: 30 };
    exito.value = 'Servicio agregado al catálogo.';
    await cargarServicios();
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.';
  } finally {
    guardando.value = false;
  }
}

async function desactivarServicio(servicio) {
  if (!window.confirm(`¿Deseas desactivar "${servicio.nombre}"?`)) return;
  error.value = '';
  exito.value = '';
  try {
    const response = await fetch(`${API_URL}/servicios/${servicio._id}`, {
      method: 'DELETE',
      headers: auth.encabezadosAutenticados()
    });
    const resultado = await response.json();
    if (!response.ok) throw new Error(resultado.error || 'No se pudo desactivar el servicio.');
    exito.value = 'Servicio desactivado.';
    await cargarServicios();
  } catch (err) {
    error.value = err.message || 'No se pudo conectar con el servidor.';
  }
}

onMounted(cargarServicios);
</script>

<style scoped>
.esther-page { 
  position: relative; 
  min-height: 100vh; 
  overflow: hidden; 
}

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

.content-wrapper { 
  position: relative; 
  z-index: 2; 
  width: 100%; 
  max-width: 1100px; 
  padding: 20px 0; 
}
.service-admin { max-width: 760px; margin: 0 auto 30px; padding: 24px; border: 1px solid rgba(216, 131, 158, 0.3); border-radius: 16px; background: rgba(255, 255, 255, .96); }
.service-admin h2 { margin: 0 0 16px; color: #8f455e; font-size: 1.35rem; }
.service-form { display: grid; gap: 12px; }
.service-form label { display: grid; gap: 6px; color: #554b4a; font-weight: 600; }
.service-form input { width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid #d8cdca; border-radius: 6px; font: inherit; }
.form-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.service-form button { min-height: 42px; border: 0; border-radius: 6px; background: #8f455e; color: #fff; font-weight: 700; cursor: pointer; }
.service-form button:disabled { opacity: .65; cursor: wait; }
.form-error { margin: 0; color: #a32d3d; }
.form-success { margin: 0; color: #287348; }
.remove-service { display: block; margin: 12px auto 0; padding: 6px 12px; border: 1px solid #a32d3d; border-radius: 5px; background: #fff; color: #a32d3d; cursor: pointer; }

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
  color: #232023; 
}

.luxury-subtitle { 
  font-family: 'Playfair Display', serif; 
  font-style: italic; 
  color: #5c5559; 
}

.text-pink { 
  color: #b3637e !important; 
}

.text-muted { 
  color: #5c5559 !important; 
}
.duration-line { color: #8f455e; font-size: 0.85rem; font-weight: 700; }

/* Tarjeta principal */
.esther-card {
  background-color: rgba(255, 255, 255, 0.96); 
  backdrop-filter: blur(12px);
  border: 1px solid rgba(216, 131, 158, 0.25); 
  border-radius: 20px; 
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 15px 40px rgba(179, 99, 126, 0.08); 
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.esther-card:hover { 
  transform: translateY(-4px); 
  border-color: #d8839e; 
}

/* Contenedor de la imagen arriba para que cubra perfectamente sin deformarse */
.card-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f7f0f3;
}

.service-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.esther-card:hover .service-img {
  transform: scale(1.05);
}

/* Contenido interno de la tarjeta */
.card-content {
  padding: 28px;
  flex-grow: 1;
}

.price-tag {
  display: inline-block; 
  background: rgba(216, 131, 158, 0.1); 
  color: #b3637e; 
  font-weight: 700;
  padding: 8px 24px; 
  border-radius: 20px; 
  border: 1px solid rgba(216, 131, 158, 0.25); 
  font-size: 1.05rem;
}
</style>