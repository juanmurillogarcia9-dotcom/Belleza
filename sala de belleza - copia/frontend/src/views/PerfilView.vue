<template>
  <q-page class="profile-page q-pa-xl">
    <div class="profile-wrapper">
      <header class="page-heading">
        <span class="eyebrow">Tu cuenta</span>
        <h1>Mi perfil</h1>
        <p>Actualiza tus datos y mantén tu cuenta segura.</p>
      </header>

      <section class="profile-card">
        <h2>Datos básicos</h2>
        <form class="profile-form" @submit.prevent="guardarPerfil">
          <label>
            Nombre completo
            <input v-model.trim="perfil.nombre" autocomplete="name" required />
          </label>
          <label>
            Correo electrónico
            <input v-model.trim="perfil.email" type="email" autocomplete="email" required />
          </label>
          <label>
            Teléfono
            <input v-model.trim="perfil.telefono" type="tel" autocomplete="tel" :required="auth.usuario?.rol === 'cliente'" />
          </label>
          <label v-if="auth.usuario?.rol === 'estilista'">
            Especialidades (separadas por coma)
            <input v-model.trim="perfil.especialidades" placeholder="Corte, coloración, peinados" required />
          </label>
          <p v-if="errorPerfil" class="feedback error" role="alert">{{ errorPerfil }}</p>
          <p v-if="exitoPerfil" class="feedback success" role="status">{{ exitoPerfil }}</p>
          <button type="submit" :disabled="guardandoPerfil">{{ guardandoPerfil ? 'Guardando...' : 'Guardar cambios' }}</button>
        </form>
      </section>

      <section class="profile-card">
        <h2>Cambiar contraseña</h2>
        <form class="profile-form" @submit.prevent="cambiarPassword">
          <label>
            Contraseña actual
            <input v-model="passwordActual" type="password" autocomplete="current-password" required />
          </label>
          <label>
            Nueva contraseña
            <input v-model="passwordNueva" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <label>
            Confirmar nueva contraseña
            <input v-model="confirmacion" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <p v-if="errorPassword" class="feedback error" role="alert">{{ errorPassword }}</p>
          <p v-if="exitoPassword" class="feedback success" role="status">{{ exitoPassword }}</p>
          <button type="submit" :disabled="guardandoPassword">{{ guardandoPassword ? 'Actualizando...' : 'Cambiar contraseña' }}</button>
        </form>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const auth = useAuthStore()
const perfil = reactive({ nombre: '', email: '', telefono: '', especialidades: '' })
const passwordActual = ref('')
const passwordNueva = ref('')
const confirmacion = ref('')
const guardandoPerfil = ref(false)
const guardandoPassword = ref(false)
const errorPerfil = ref('')
const exitoPerfil = ref('')
const errorPassword = ref('')
const exitoPassword = ref('')

function cargarPerfil(usuario) {
  perfil.nombre = usuario?.nombre || ''
  perfil.email = usuario?.email || usuario?.correo || ''
  perfil.telefono = usuario?.telefono || ''
  perfil.especialidades = (usuario?.especialidades || []).join(', ')
}

watch(() => auth.usuario, cargarPerfil, { immediate: true })

async function guardarPerfil() {
  guardandoPerfil.value = true
  errorPerfil.value = ''
  exitoPerfil.value = ''
  try {
    const response = await fetch(`${API_URL}/auth/perfil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.encabezadosAutenticados() },
      body: JSON.stringify({
        nombre: perfil.nombre,
        email: perfil.email,
        telefono: perfil.telefono,
        especialidades: perfil.especialidades.split(',').map((item) => item.trim()).filter(Boolean)
      })
    })
    const resultado = await response.json()
    if (!response.ok) throw new Error(resultado.error || 'No se pudo actualizar el perfil.')
    auth.usuario = resultado.usuario
    exitoPerfil.value = 'Tus datos se actualizaron correctamente.'
  } catch (error) {
    errorPerfil.value = error.message || 'No se pudo conectar con el servidor.'
  } finally {
    guardandoPerfil.value = false
  }
}

async function cambiarPassword() {
  errorPassword.value = ''
  exitoPassword.value = ''
  if (passwordNueva.value !== confirmacion.value) {
    errorPassword.value = 'La confirmación no coincide con la nueva contraseña.'
    return
  }
  guardandoPassword.value = true
  try {
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...auth.encabezadosAutenticados() },
      body: JSON.stringify({ passwordActual: passwordActual.value, passwordNueva: passwordNueva.value })
    })
    const resultado = await response.json()
    if (!response.ok) throw new Error(resultado.error || 'No se pudo cambiar la contraseña.')
    passwordActual.value = ''
    passwordNueva.value = ''
    confirmacion.value = ''
    exitoPassword.value = resultado.mensaje
  } catch (error) {
    errorPassword.value = error.message || 'No se pudo conectar con el servidor.'
  } finally {
    guardandoPassword.value = false
  }
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #f8f3f1; }
.profile-wrapper { width: min(100%, 760px); margin: 0 auto; display: grid; gap: 24px; }
.page-heading { text-align: center; margin-bottom: 4px; }
.eyebrow { color: #a2546c; font-size: .8rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
h1, h2 { color: #292525; font-family: 'Playfair Display', Georgia, serif; }
h1 { margin: 8px 0; font-size: 2.2rem; }
.page-heading p { color: #6e6463; }
.profile-card { padding: 28px; border: 1px solid #eadce1; border-radius: 14px; background: #fff; box-shadow: 0 12px 34px rgba(80, 48, 58, .06); }
.profile-card h2 { margin: 0 0 20px; font-size: 1.35rem; }
.profile-form { display: grid; gap: 16px; }
.profile-form label { display: grid; gap: 7px; color: #554b4a; font-size: .9rem; font-weight: 600; }
.profile-form input { min-height: 44px; padding: 10px 12px; border: 1px solid #d8cdca; border-radius: 5px; font: inherit; }
.profile-form input:focus { outline: 2px solid #b3637e; outline-offset: 1px; }
.profile-form button { min-height: 44px; border: 0; border-radius: 5px; background: #8f455e; color: #fff; font-weight: 700; cursor: pointer; }
.profile-form button:disabled { opacity: .65; cursor: wait; }
.feedback { margin: 0; font-size: .9rem; }
.error { color: #a32d3d; }
.success { color: #287348; }
@media (max-width: 600px) { .profile-card { padding: 22px 18px; } }
</style>
