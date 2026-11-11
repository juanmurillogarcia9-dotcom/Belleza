const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  correo: { type: String, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  contraseña: { type: String, select: false },
  password: { type: String, select: false },
  telefono: { type: String, trim: true },
  rol: { type: String, enum: ['cliente', 'estilista'], default: 'cliente' },
  especialidad: { type: String, trim: true },
  especialidades: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);