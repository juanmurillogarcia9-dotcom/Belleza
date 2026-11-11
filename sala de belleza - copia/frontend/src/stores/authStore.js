import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const usuario = ref(null)

  async function enviarCredenciales(ruta, datos) {
    let response
    try {
      response = await fetch(`${API_URL}/auth/${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
    } catch (error) {
      console.error('No se pudo conectar con el backend:', error)
      throw new Error('No se pudo conectar con el servidor. Inicia el backend en el puerto 4000.')
    }

    let resultado
    try {
      resultado = await response.json()
    } catch (error) {
      console.error('El backend devolvió una respuesta no válida:', error)
      throw new Error('El servidor respondió de forma inesperada. Revisa la terminal del backend.')
    }

    if (!response.ok) throw new Error(resultado.error || 'No se pudo completar la solicitud.')
    if (!resultado.token || !resultado.usuario) {
      throw new Error('El servidor no devolvió los datos de sesión esperados.')
    }
    if (resultado.usuario.rol !== datos.rol) {
      throw new Error(`Esta cuenta está registrada como ${resultado.usuario.rol}. Inicia sesión con ese tipo de perfil.`)
    }

    token.value = resultado.token
    usuario.value = resultado.usuario
    return resultado.usuario
  }

  function iniciarSesion(datos) {
    return enviarCredenciales('login', datos)
  }

  function registrarse(datos) {
    return enviarCredenciales('register', datos)
  }

  function cerrarSesion() {
    token.value = ''
    usuario.value = null
  }

  function encabezadosAutenticados() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }

  return { token, usuario, iniciarSesion, registrarse, cerrarSesion, encabezadosAutenticados }
}, {
  persist: true
})
