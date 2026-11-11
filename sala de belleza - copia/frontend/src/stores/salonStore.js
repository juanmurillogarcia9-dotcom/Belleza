import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSalonStore = defineStore('salon', () => {
  // Estado básico
  const citas = ref([])
  const estilistas = ref([])
  const clientes = ref([])

  // Acciones simples para conectar con tu backend en el puerto 4000
  const obtenerDatos = async () => {
    try {
      const resEst = await fetch('http://localhost:4000/api/estilistas')
      estilistas.value = await resEst.json()

      const resCli = await fetch('http://localhost:4000/api/clientes')
      clientes.value = await resCli.json()
    } catch (error) {
      console.error("Error al conectar con el backend", error)
    }
  }

  return { citas, estilistas, clientes, obtenerDatos }
}, {
  persist: true // Activando el plugin básico de persistencia
})