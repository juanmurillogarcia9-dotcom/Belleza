require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

async function probarSistema() {
  const email = process.env.PRUEBA_EMAIL;
  const password = process.env.PRUEBA_PASSWORD;
  if (!email || !password) throw new Error('Define PRUEBA_EMAIL y PRUEBA_PASSWORD en backend/.env');

  let respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rol: 'cliente' })
  });
  let sesion = await respuesta.json();

  if (!respuesta.ok) {
    respuesta = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Cliente de prueba',
        telefono: process.env.PRUEBA_TELEFONO || '3000000000',
        email,
        password,
        rol: 'cliente'
      })
    });
    sesion = await respuesta.json();
  }
  if (!respuesta.ok) throw new Error(sesion.error || 'No se pudo iniciar la sesión de prueba');

  const respuestaEstilistas = await fetch(`${API_URL}/estilistas`);
  const estilistas = await respuestaEstilistas.json();
  if (!respuestaEstilistas.ok || !estilistas.length) throw new Error('No hay estilistas disponibles');

  const respuestaServicios = await fetch(`${API_URL}/servicios`);
  const servicios = await respuestaServicios.json();
  if (!respuestaServicios.ok || !servicios.length) throw new Error('No hay servicios disponibles');

  const fechaCita = new Date();
  fechaCita.setDate(fechaCita.getDate() + 30);
  const fecha = `${fechaCita.getFullYear()}-${String(fechaCita.getMonth() + 1).padStart(2, '0')}-${String(fechaCita.getDate()).padStart(2, '0')}`;

  const respuestaCita = await fetch(`${API_URL}/citas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sesion.token}`
    },
    body: JSON.stringify({
      servicioId: servicios[0]._id,
      estilistaId: estilistas[0]._id,
      fecha,
      horaInicio: '11:00'
    })
  });
  const cita = await respuestaCita.json();
  if (!respuestaCita.ok) throw new Error(cita.error || 'No se pudo agendar la cita');
  console.log(`Cita de prueba agendada: ${cita.cita.horaInicio} - ${cita.cita.horaFin}`);
}

probarSistema().catch((error) => console.error('Ocurrió un error:', error.message));