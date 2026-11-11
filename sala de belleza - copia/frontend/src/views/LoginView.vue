<template>
  <q-page class="auth-page flex flex-center q-pa-lg">
    <div class="auth-backdrop"></div>
    <section class="auth-panel">
      <p class="eyebrow">Salón Esther</p>
      <h1>{{ registrando ? 'Crear cuenta' : 'Iniciar sesión' }}</h1>
      <p class="auth-intro">{{ registrando ? 'Crea tu cuenta y registra tus datos.' : `Ingresa a tu espacio de ${rol === 'cliente' ? 'cliente' : 'estilista'}.` }}</p>

      <div class="role-switch" role="group" aria-label="Tipo de perfil">
        <button type="button" :aria-pressed="rol === 'cliente'" :class="{ selected: rol === 'cliente' }" @click="rol = 'cliente'">Cliente</button>
        <button type="button" :aria-pressed="rol === 'estilista'" :class="{ selected: rol === 'estilista' }" @click="rol = 'estilista'">Estilista</button>
      </div>

      <form class="auth-form" @submit.prevent="enviar">
        <label v-if="registrando">
          Nombre completo
          <input v-model.trim="form.nombre" autocomplete="name" required />
        </label>
        <label>
          Correo electrónico
          <input v-model.trim="form.email" type="email" autocomplete="email" required />
        </label>
        <label>
          Contraseña
          <input v-model="form.password" type="password" :autocomplete="registrando ? 'new-password' : 'current-password'" :minlength="registrando ? 8 : undefined" required />
        </label>
        <label v-if="registrando && rol === 'cliente'">
          Teléfono
          <input v-model.trim="form.telefono" type="tel" autocomplete="tel" required />
        </label>
        <template v-if="registrando && rol === 'estilista'">
          <label>
            Especialidades
            <input v-model.trim="form.especialidades" placeholder="Corte, coloración, peinados" required />
          </label>
          <label>
            Código de invitación
            <input v-model="form.codigoInvitacion" type="password" required />
          </label>
        </template>

        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <button class="submit-button" type="submit" :disabled="enviando">
          {{ enviando ? 'Procesando...' : registrando ? 'Crear cuenta' : 'Entrar' }}
        </button>
      </form>

      <button class="mode-button" type="button" @click="cambiarModo">
        {{ registrando ? 'Ya tengo cuenta' : 'Crear cuenta nueva' }}
      </button>
    </section>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const registrando = ref(false)
const enviando = ref(false)
const error = ref('')
const rol = ref('cliente')
const form = reactive({
  nombre: '',
  email: '',
  password: '',
  telefono: '',
  especialidades: '',
  codigoInvitacion: ''
})

function cambiarModo() {
  registrando.value = !registrando.value
  error.value = ''
}

async function enviar() {
  enviando.value = true
  error.value = ''
  try {
    const datos = { email: form.email, password: form.password, rol: rol.value }
    if (registrando.value) {
      Object.assign(datos, {
        nombre: form.nombre,
        telefono: form.telefono,
        especialidades: form.especialidades.split(',').map((item) => item.trim()).filter(Boolean),
        codigoInvitacion: form.codigoInvitacion
      })
      await auth.registrarse(datos)
    } else {
      await auth.iniciarSesion(datos)
    }
    await router.replace(auth.usuario.rol === 'estilista' ? '/' : '/mis-citas')
  } catch (err) {
    error.value = err.message
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.auth-page { position: relative; min-height: calc(100vh - 76px); overflow: hidden; background: #f5efec; }
.auth-backdrop { position: absolute; inset: 0; background: linear-gradient(125deg, rgba(35, 35, 31, .65), rgba(105, 75, 69, .18)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=85&w=1800') center/cover; }
.auth-panel { position: relative; width: min(100%, 440px); padding: 36px; background: rgba(255, 255, 255, .97); border-top: 4px solid #b3637e; box-shadow: 0 24px 70px rgba(20, 15, 15, .25); }
.eyebrow { margin: 0 0 8px; color: #a2546c; font-size: .78rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
h1 { margin: 0; color: #292525; font: 700 2rem/1.15 'Playfair Display', Georgia, serif; }
.auth-intro { margin: 10px 0 24px; color: #6e6463; }
.role-switch { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #ded4d1; }
.role-switch button { padding: 12px; border: 0; border-bottom: 3px solid transparent; background: transparent; color: #6e6463; font-weight: 600; cursor: pointer; }
.role-switch button.selected { border-color: #b3637e; color: #8e4059; }
.auth-form { display: grid; gap: 16px; margin-top: 22px; }
.auth-form label { display: grid; gap: 7px; color: #554b4a; font-size: .88rem; font-weight: 600; }
.auth-form input { width: 100%; min-height: 44px; padding: 10px 12px; border: 1px solid #d8cdca; border-radius: 4px; background: #fff; color: #292525; font: inherit; }
.auth-form input:focus { outline: 2px solid #b3637e; outline-offset: 1px; }
.form-error { margin: 0; color: #a32d3d; font-size: .9rem; }
.submit-button { min-height: 46px; border: 0; border-radius: 4px; background: #8f455e; color: #fff; font-weight: 700; cursor: pointer; }
.submit-button:disabled { opacity: .65; cursor: wait; }
.mode-button { display: block; margin: 18px auto 0; padding: 6px; border: 0; background: transparent; color: #8f455e; font-weight: 600; cursor: pointer; }
@media (max-width: 480px) { .auth-panel { padding: 26px 22px; } }
</style>