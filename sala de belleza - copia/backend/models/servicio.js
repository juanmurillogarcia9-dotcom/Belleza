const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true, default: '' },
  precio: { type: Number, required: true, min: 0 },
  duracionMinutos: { type: Number, required: true, min: 1 },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Servicio', servicioSchema);
