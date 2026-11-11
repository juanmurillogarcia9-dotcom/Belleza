const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  clienteUsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  estilistaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estilista' },
  estilistaUsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  servicioId: { type: String, required: true },
  servicio: { type: String, required: true },
  duracionMinutos: { type: Number, required: true },
  fecha: { type: String, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  estado: { type: String, enum: ['agendada', 'cancelada'], default: 'agendada' }
}, { timestamps: true });

module.exports = mongoose.model('Cita', citaSchema);