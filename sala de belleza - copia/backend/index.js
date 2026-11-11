const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const Usuario = require('./models/usuario');
const Cliente = require('./models/cliente');
const Cita = require('./models/cita');
const Servicio = require('./models/servicio');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD_MIN_LENGTH = 8;

const serviciosIniciales = [
  { nombre: 'Corte y Estilizado de Cabello', precio: 45000, duracionMinutos: 45, descripcion: 'Corte personalizado y asesoramiento de imagen.' },
  { nombre: 'Tintura y Balayage', precio: 120000, duracionMinutos: 120, descripcion: 'Coloración e iluminación profesional.' },
  { nombre: 'Manicure y Pedicure Spa', precio: 50000, duracionMinutos: 60, descripcion: 'Cuidado completo de manos y pies.' },
  { nombre: 'Maquillaje Profesional', precio: 80000, duracionMinutos: 50, descripcion: 'Maquillaje para ocasiones especiales.' },
  { nombre: 'Tratamiento Capilar Keratina', precio: 150000, duracionMinutos: 90, descripcion: 'Tratamiento para nutrir y alisar el cabello.' }
];

function correoDe(usuario) {
  return String(usuario.email || usuario.correo || '').trim().toLowerCase();
}

function buscarPorCorreo(email) {
  return { $or: [{ email }, { correo: email }] };
}

function normalizarEspecialidades(value) {
  const items = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}

function usuarioPublico(usuario) {
  const especialidades = normalizarEspecialidades(usuario.especialidades?.length ? usuario.especialidades : usuario.especialidad);
  return {
    _id: usuario._id,
    nombre: usuario.nombre,
    email: correoDe(usuario),
    telefono: usuario.telefono || '',
    rol: usuario.rol,
    especialidades,
    especialidad: especialidades.join(', ')
  };
}

function estilistaPublico(usuario) {
  const perfil = usuarioPublico(usuario);
  return {
    _id: perfil._id,
    nombre: perfil.nombre,
    especialidades: perfil.especialidades,
    especialidad: perfil.especialidad
  };
}

async function guardarPerfilCliente(usuario, correoAnterior = correoDe(usuario)) {
  const email = correoDe(usuario);
  let perfil = await Cliente.findOne({
    $or: [{ usuarioId: usuario._id }, { email }, { email: correoAnterior }]
  });
  if (!perfil) perfil = new Cliente({ email });
  perfil.nombre = usuario.nombre;
  perfil.email = email;
  perfil.telefono = usuario.telefono;
  perfil.usuarioId = usuario._id;
  await perfil.save();
  return perfil;
}

function responderError(res, error, mensaje) {
  console.error(mensaje, error);
  if (error.code === 11000) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
  return res.status(500).json({ error: mensaje });
}

async function autenticar(req, res, next) {
  if (!JWT_SECRET) return res.status(503).json({ error: 'El servidor no tiene configurado JWT_SECRET.' });
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';
  if (!token) return res.status(401).json({ error: 'Inicia sesión para continuar.' });

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'La sesión venció o no es válida. Inicia sesión de nuevo.' });
  }

  try {
    req.usuario = await Usuario.findById(payload.sub);
    if (!req.usuario) return res.status(401).json({ error: 'La cuenta de esta sesión ya no existe.' });
    return next();
  } catch (error) {
    return responderError(res, error, 'No se pudo validar la sesión.');
  }
}

function soloEstilista(req, res, next) {
  if (req.usuario.rol !== 'estilista') return res.status(403).json({ error: 'Esta acción solo está disponible para estilistas.' });
  return next();
}

async function inicializarServicios() {
  if (await Servicio.countDocuments() === 0) await Servicio.insertMany(serviciosIniciales);
}

app.get('/api/servicios', async (req, res) => {
  try {
    const servicios = await Servicio.find({ activo: true }).sort({ nombre: 1 }).lean();
    return res.json(servicios);
  } catch (error) {
    return responderError(res, error, 'Error al obtener los servicios.');
  }
});

app.post('/api/servicios', autenticar, soloEstilista, async (req, res) => {
  try {
    const { nombre, descripcion = '', precio, duracionMinutos } = req.body;
    const precioNumero = Number(precio);
    const duracionNumero = Number(duracionMinutos);
    if (!nombre?.trim() || !Number.isFinite(precioNumero) || precioNumero < 0 || !Number.isInteger(duracionNumero) || duracionNumero < 1) {
      return res.status(400).json({ error: 'Ingresa nombre, precio válido y duración en minutos.' });
    }
    const servicio = await Servicio.create({
      nombre: nombre.trim(),
      descripcion: String(descripcion).trim(),
      precio: precioNumero,
      duracionMinutos: duracionNumero
    });
    return res.status(201).json({ servicio });
  } catch (error) {
    return responderError(res, error, 'No se pudo crear el servicio.');
  }
});

app.put('/api/servicios/:id', autenticar, soloEstilista, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'El servicio indicado no es válido.' });
    const { nombre, descripcion = '', precio, duracionMinutos } = req.body;
    const precioNumero = Number(precio);
    const duracionNumero = Number(duracionMinutos);
    if (!nombre?.trim() || !Number.isFinite(precioNumero) || precioNumero < 0 || !Number.isInteger(duracionNumero) || duracionNumero < 1) {
      return res.status(400).json({ error: 'Ingresa nombre, precio válido y duración en minutos.' });
    }
    const servicio = await Servicio.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      { nombre: nombre.trim(), descripcion: String(descripcion).trim(), precio: precioNumero, duracionMinutos: duracionNumero },
      { new: true, runValidators: true }
    );
    if (!servicio) return res.status(404).json({ error: 'No se encontró el servicio.' });
    return res.json({ servicio });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el servicio.');
  }
});

app.delete('/api/servicios/:id', autenticar, soloEstilista, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'El servicio indicado no es válido.' });
    const servicio = await Servicio.findOneAndUpdate(
      { _id: req.params.id, activo: true },
      { activo: false },
      { new: true }
    );
    if (!servicio) return res.status(404).json({ error: 'No se encontró el servicio.' });
    return res.json({ mensaje: 'Servicio desactivado.' });
  } catch (error) {
    return responderError(res, error, 'No se pudo desactivar el servicio.');
  }
});

app.get('/api/estilistas', async (req, res) => {
  try {
    const estilistas = await Usuario.find({ rol: 'estilista' }).sort({ nombre: 1 });
    return res.json(estilistas.map(estilistaPublico));
  } catch (error) {
    return responderError(res, error, 'Error al obtener los estilistas.');
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    if (!JWT_SECRET) return res.status(503).json({ error: 'El servidor no tiene configurado JWT_SECRET.' });
    const nombre = String(req.body.nombre || '').trim();
    const email = String(req.body.email || req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || req.body.contraseña || '');
    const telefono = String(req.body.telefono || '').trim();
    const rol = req.body.rol;
    const especialidades = normalizarEspecialidades(req.body.especialidades || req.body.especialidad);

    if (!['cliente', 'estilista'].includes(rol)) {
      return res.status(400).json({ error: 'Selecciona si la cuenta es de cliente o estilista.' });
    }
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: 'Completa tu nombre, un correo válido y una contraseña de al menos 8 caracteres.' });
    }
    if (rol === 'cliente' && !telefono) return res.status(400).json({ error: 'El teléfono es obligatorio para la cuenta de cliente.' });
    if (rol === 'estilista' && especialidades.length === 0) return res.status(400).json({ error: 'Indica al menos una especialidad.' });
    if (rol === 'estilista') {
      const codigoEsperado = process.env.ESTILISTA_REGISTRATION_CODE || process.env.STYLIST_INVITATION_CODE;
      const codigoRecibido = String(req.body.codigoInvitacion || '');
      if (!codigoEsperado) return res.status(503).json({ error: 'El registro de estilistas no está habilitado: falta configurar el código de invitación.' });
      const esperado = Buffer.from(codigoEsperado);
      const recibido = Buffer.from(codigoRecibido);
      if (esperado.length !== recibido.length || !crypto.timingSafeEqual(esperado, recibido)) {
        return res.status(403).json({ error: 'El código de invitación de estilista no es válido.' });
      }
    }
    const cuentaExistente = await Usuario.findOne(buscarPorCorreo(email));
    if (cuentaExistente) {
      return res.status(409).json({
        error: `Ese correo ya tiene una cuenta de ${cuentaExistente.rol}. Inicia sesión con ese tipo de perfil o usa otro correo.`
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      telefono,
      rol,
      especialidades,
      especialidad: especialidades.join(', '),
      passwordHash: await bcrypt.hash(password, 12)
    });

    if (rol === 'cliente') {
      try {
        await guardarPerfilCliente(usuario);
      } catch (error) {
        await Usuario.deleteOne({ _id: usuario._id });
        throw error;
      }
    }

    const token = jwt.sign({ sub: usuario._id.toString() }, JWT_SECRET, { expiresIn: '8h' });
    return res.status(201).json({ mensaje: 'Cuenta creada con éxito.', usuario: usuarioPublico(usuario), token });
  } catch (error) {
    return responderError(res, error, 'Error al registrar la cuenta.');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!JWT_SECRET) return res.status(503).json({ error: 'El servidor no tiene configurado JWT_SECRET.' });
    const rolSolicitado = req.body.rol;
    if (!['cliente', 'estilista'].includes(rolSolicitado)) {
      return res.status(400).json({ error: 'Selecciona si vas a iniciar sesión como cliente o estilista.' });
    }
    const email = String(req.body.email || req.body.correo || '').trim().toLowerCase();
    const password = String(req.body.password || req.body.contraseña || '');
    if (!email || !password) return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });

    const usuario = await Usuario.findOne(buscarPorCorreo(email)).select('+passwordHash +contraseña +password');
    if (!usuario) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    const hashExistente = usuario.passwordHash;
    const passwordAnterior = usuario.contraseña || usuario.password;
    const coincide = hashExistente
      ? await bcrypt.compare(password, hashExistente)
      : passwordAnterior === password;
    if (!coincide) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

    if (usuario.rol !== rolSolicitado) {
      return res.status(403).json({
        error: `Esta cuenta está registrada como ${usuario.rol}. No puedes iniciar sesión como ${rolSolicitado}.`
      });
    }

    if (!hashExistente) {
      usuario.passwordHash = await bcrypt.hash(password, 12);
      usuario.contraseña = undefined;
      usuario.password = undefined;
      await usuario.save();
    }
    const token = jwt.sign({ sub: usuario._id.toString() }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ mensaje: 'Inicio de sesión exitoso.', usuario: usuarioPublico(usuario), token });
  } catch (error) {
    return responderError(res, error, 'Error al iniciar sesión.');
  }
});

app.put('/api/auth/perfil', autenticar, async (req, res) => {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const telefono = String(req.body.telefono || '').trim();
    const especialidades = normalizarEspecialidades(req.body.especialidades);
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Ingresa un nombre y un correo válido.' });
    }
    if (req.usuario.rol === 'cliente' && !telefono) return res.status(400).json({ error: 'El teléfono es obligatorio.' });
    if (req.usuario.rol === 'estilista' && especialidades.length === 0) return res.status(400).json({ error: 'Indica al menos una especialidad.' });
    const cuentaExistente = await Usuario.findOne(buscarPorCorreo(email));
    if (cuentaExistente && cuentaExistente._id.toString() !== req.usuario._id.toString()) {
      return res.status(409).json({ error: 'Ese correo ya está asociado a otra cuenta.' });
    }

    const correoAnterior = correoDe(req.usuario);
    req.usuario.nombre = nombre;
    req.usuario.email = email;
    req.usuario.correo = email;
    req.usuario.telefono = telefono;
    if (req.usuario.rol === 'estilista') {
      req.usuario.especialidades = especialidades;
      req.usuario.especialidad = especialidades.join(', ');
    }
    await req.usuario.save();
    if (req.usuario.rol === 'cliente') await guardarPerfilCliente(req.usuario, correoAnterior);
    return res.json({ usuario: usuarioPublico(req.usuario) });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el perfil.');
  }
});

app.put('/api/auth/password', autenticar, async (req, res) => {
  try {
    const actual = String(req.body.passwordActual || '');
    const nueva = String(req.body.passwordNueva || '');
    if (nueva.length < PASSWORD_MIN_LENGTH) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    const usuario = await Usuario.findById(req.usuario._id).select('+passwordHash +contraseña +password');
    const hashExistente = usuario.passwordHash;
    const passwordAnterior = usuario.contraseña || usuario.password;
    const coincide = hashExistente
      ? await bcrypt.compare(actual, hashExistente)
      : passwordAnterior === actual;
    if (!coincide) return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
    usuario.passwordHash = await bcrypt.hash(nueva, 12);
    usuario.contraseña = undefined;
    usuario.password = undefined;
    await usuario.save();
    return res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar la contraseña.');
  }
});

app.get('/api/clientes', autenticar, soloEstilista, async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 }).lean();
    const resultado = await Promise.all(clientes.map(async (cliente) => {
      let usuario = cliente.usuarioId
        ? await Usuario.findById(cliente.usuarioId)
        : await Usuario.findOne({ ...buscarPorCorreo(cliente.email), rol: 'cliente' });
      if (usuario && usuario.rol !== 'cliente') usuario = null;
      return {
        _id: cliente._id,
        usuarioId: usuario?._id || cliente.usuarioId,
        nombre: usuario?.nombre || cliente.nombre,
        email: usuario ? correoDe(usuario) : cliente.email,
        telefono: usuario?.telefono || cliente.telefono
      };
    }));
    return res.json(resultado);
  } catch (error) {
    return responderError(res, error, 'Error al obtener los clientes.');
  }
});

app.post('/api/clientes', autenticar, soloEstilista, async (req, res) => {
  try {
    const nombre = String(req.body.nombre || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const telefono = String(req.body.telefono || '').trim();
    const password = String(req.body.password || '');
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !telefono || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: 'Completa nombre, correo, teléfono y una contraseña de al menos 8 caracteres.' });
    }
    if (await Usuario.findOne(buscarPorCorreo(email))) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    const usuario = await Usuario.create({
      nombre,
      email,
      telefono,
      rol: 'cliente',
      passwordHash: await bcrypt.hash(password, 12)
    });
    try {
      const cliente = await guardarPerfilCliente(usuario);
      return res.status(201).json({
        cliente: { _id: cliente._id, usuarioId: usuario._id, nombre, email, telefono }
      });
    } catch (error) {
      await Usuario.deleteOne({ _id: usuario._id });
      throw error;
    }
  } catch (error) {
    return responderError(res, error, 'No se pudo registrar el cliente.');
  }
});

app.put('/api/clientes/:id', autenticar, soloEstilista, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'El cliente indicado no es válido.' });
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'No se encontró el cliente.' });
    const nombre = String(req.body.nombre || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const telefono = String(req.body.telefono || '').trim();
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !telefono) {
      return res.status(400).json({ error: 'Ingresa un nombre, correo válido y teléfono.' });
    }
    const usuario = cliente.usuarioId
      ? await Usuario.findById(cliente.usuarioId)
      : await Usuario.findOne({ ...buscarPorCorreo(cliente.email), rol: 'cliente' });
    if (usuario) {
      if (usuario.rol !== 'cliente') return res.status(409).json({ error: 'Esta ficha no corresponde a una cuenta de cliente.' });
      const duplicado = await Usuario.findOne(buscarPorCorreo(email));
      if (duplicado && duplicado._id.toString() !== usuario._id.toString()) {
        return res.status(409).json({ error: 'Ese correo ya está asociado a otra cuenta.' });
      }
      usuario.nombre = nombre;
      usuario.email = email;
      usuario.correo = email;
      usuario.telefono = telefono;
      await usuario.save();
      cliente.usuarioId = usuario._id;
    }
    cliente.nombre = nombre;
    cliente.email = email;
    cliente.telefono = telefono;
    await cliente.save();
    return res.json({ cliente: { _id: cliente._id, usuarioId: cliente.usuarioId, nombre, email, telefono } });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el cliente.');
  }
});

app.get('/api/citas', autenticar, soloEstilista, async (req, res) => {
  try {
    const filtro = { estado: { $ne: 'cancelada' } };
    if (req.query.fecha) filtro.fecha = String(req.query.fecha);
    const citas = await Cita.find(filtro)
      .populate('clienteId', 'nombre email telefono')
      .populate('estilistaUsuarioId', 'nombre especialidad especialidades')
      .sort({ horaInicio: 1 });
    return res.json(citas);
  } catch (error) {
    return responderError(res, error, 'Error al obtener las citas.');
  }
});

app.get('/api/citas/mis-citas', autenticar, async (req, res) => {
  try {
    if (req.usuario.rol !== 'cliente') return res.status(403).json({ error: 'Esta sección es para clientes.' });
    const perfil = await Cliente.findOne({
      $or: [{ usuarioId: req.usuario._id }, { email: correoDe(req.usuario) }]
    });
    const filtroCliente = [{ clienteUsuarioId: req.usuario._id }];
    if (perfil) filtroCliente.push({ clienteId: perfil._id });
    const citas = await Cita.find({ $or: filtroCliente })
      .populate('estilistaUsuarioId', 'nombre especialidad especialidades')
      .sort({ fecha: 1, horaInicio: 1 });
    return res.json(citas);
  } catch (error) {
    return responderError(res, error, 'No se pudieron obtener tus citas.');
  }
});

app.post('/api/citas', autenticar, async (req, res) => {
  try {
    if (req.usuario.rol !== 'cliente') return res.status(403).json({ error: 'Solo los clientes pueden reservar citas.' });
    if (!mongoose.isValidObjectId(req.body.servicioId)) return res.status(400).json({ error: 'Selecciona un servicio válido.' });
    const servicio = await Servicio.findOne({ _id: req.body.servicioId, activo: true });
    if (!servicio) return res.status(400).json({ error: 'Selecciona un servicio disponible.' });
    if (!mongoose.isValidObjectId(req.body.estilistaId)) return res.status(400).json({ error: 'Selecciona un estilista válido.' });
    const estilista = await Usuario.findOne({ _id: req.body.estilistaId, rol: 'estilista' });
    if (!estilista) return res.status(400).json({ error: 'El estilista seleccionado ya no está disponible.' });

    const fecha = String(req.body.fecha || '');
    const horaInicio = String(req.body.horaInicio || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(horaInicio)) {
      return res.status(400).json({ error: 'Selecciona una fecha y hora válidas.' });
    }
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const inicioMinutos = hora * 60 + minuto;
    const finMinutos = inicioMinutos + servicio.duracionMinutos;
    if (hora > 23 || minuto > 59 || finMinutos >= 24 * 60) {
      return res.status(400).json({ error: 'El horario seleccionado no es válido.' });
    }
    const horaFin = `${String(Math.floor(finMinutos / 60)).padStart(2, '0')}:${String(finMinutos % 60).padStart(2, '0')}`;
    const hoy = new Date();
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    if (fecha < fechaHoy) return res.status(400).json({ error: 'No se pueden reservar citas en fechas pasadas.' });
    const cliente = await Cliente.findOne({
      $or: [{ usuarioId: req.usuario._id }, { email: correoDe(req.usuario) }]
    });
    if (!cliente) return res.status(409).json({ error: 'Completa tu perfil de cliente antes de reservar.' });
    const cruce = await Cita.exists({
      estilistaUsuarioId: estilista._id,
      fecha,
      estado: { $ne: 'cancelada' },
      horaInicio: { $lt: horaFin },
      horaFin: { $gt: horaInicio }
    });
    if (cruce) return res.status(409).json({ error: 'Ese horario ya está ocupado. Elige otra hora.' });

    const cita = await Cita.create({
      clienteId: cliente._id,
      clienteUsuarioId: req.usuario._id,
      estilistaUsuarioId: estilista._id,
      servicioId: servicio._id.toString(),
      servicio: servicio.nombre,
      duracionMinutos: servicio.duracionMinutos,
      fecha,
      horaInicio,
      horaFin
    });
    return res.status(201).json({ mensaje: 'Cita agendada con éxito.', cita });
  } catch (error) {
    return responderError(res, error, 'No se pudo registrar la cita.');
  }
});

app.patch('/api/citas/:id/cancelar', autenticar, async (req, res) => {
  try {
    if (req.usuario.rol !== 'cliente') return res.status(403).json({ error: 'Solo los clientes pueden cancelar desde esta sección.' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'La cita indicada no es válida.' });
    const perfil = await Cliente.findOne({
      $or: [{ usuarioId: req.usuario._id }, { email: correoDe(req.usuario) }]
    });
    const filtrosPropietario = [{ clienteUsuarioId: req.usuario._id }];
    if (perfil) filtrosPropietario.push({ clienteId: perfil._id });
    const cita = await Cita.findOneAndUpdate(
      { _id: req.params.id, estado: { $ne: 'cancelada' }, $or: filtrosPropietario },
      { estado: 'cancelada' },
      { new: true }
    );
    if (!cita) return res.status(404).json({ error: 'No se encontró una cita activa de tu cuenta.' });
    return res.json({ mensaje: 'La cita fue cancelada.', cita });
  } catch (error) {
    return responderError(res, error, 'No se pudo cancelar la cita.');
  }
});

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Conectado exitosamente a MongoDB.');
    await inicializarServicios();
    app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exitCode = 1;
  });
