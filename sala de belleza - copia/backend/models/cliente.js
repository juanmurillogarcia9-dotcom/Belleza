const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);