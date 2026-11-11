const mongoose = require('mongoose');

const estilistaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    especialidad: { type: String, required: true },
    edad: { type: Number },
    foto: { type: String }
}); 

module.exports = mongoose.model('Estilista', estilistaSchema);