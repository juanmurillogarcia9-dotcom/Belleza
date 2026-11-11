<template>
  <q-layout view="lHh Lpr lFf" class="esther-layout">
    <!-- Cabecera / Navbar -->
    <q-header v-if="auth.usuario" class="esther-header">
      <q-toolbar class="q-px-xl q-py-md">
        <!-- Logo / Nombre del Salón -->
        <q-toolbar-title class="brand-title">
          Salón de Belleza <span class="brand-span">Esther</span>
        </q-toolbar-title>
        
        <!-- Menú de Navegación -->
        <div class="nav-links">
          <router-link v-if="auth.usuario?.rol === 'estilista'" to="/" class="nav-item">Agenda</router-link>
          <router-link v-if="auth.usuario?.rol === 'cliente'" to="/agendar" class="nav-item">Agendar Cita</router-link>
          <router-link v-if="auth.usuario?.rol === 'cliente'" to="/mis-citas" class="nav-item">Mis citas</router-link>
          <router-link v-if="auth.usuario?.rol === 'estilista'" to="/clientes" class="nav-item">Clientes</router-link>
          <router-link to="/servicios" class="nav-item">Servicios</router-link>
          <router-link to="/galeria" class="nav-item">Galería</router-link>
          <router-link to="/nosotros" class="nav-item">Nosotros</router-link>
          <router-link to="/perfil" class="nav-item">Mi perfil</router-link>
          <button class="nav-action" type="button" @click="salir">Salir, {{ auth.usuario.nombre }}</button>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Contenedor principal de vistas -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'

const auth = useAuthStore()
const router = useRouter()

function salir() {
  auth.cerrarSesion()
  router.push('/login')
}
</script>

<style scoped>
.esther-layout {
  background-color: #fcfbf9;
  color: #2d2a2e;
}

.esther-header {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eae3e7;
}

.brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: #2d2a2e;
}

.brand-span {
  color: #d8839e;
}

.nav-links {
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav-item {
  color: #6b656a;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #d8839e;
}

.router-link-active {
  color: #d8839e;
  font-weight: 600;
}

.nav-action {
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: #8f455e;
  font: inherit;
  cursor: pointer;
}

@media (max-width: 800px) {
  .q-toolbar { flex-wrap: wrap; justify-content: center; }
  .nav-links { justify-content: center; gap: 12px 18px; }
}
</style>