const mongoose = require("mongoose");

const reposicion = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder 100 caracteres"],
  },
  cat: {
    type: String,
    required: [true, "La categoría es requerida"],
    trim: true,
    enum: ["Bovino", "Equino", "Ovino", "Porcino", "Caprino", "Otro"],
  },
  raza: {
    type: String,
    required: [true, "La raza es requerida"],
    trim: true,
  },
  clase: {
    type: String,
    required: [true, "La clase es requerida"],
    trim: true,
  },
  peso: {
    type: String,
    required: [true, "El peso es requerido"],
    trim: true,
  },
  edad: {
    type: String,
    required: [true, "La edad es requerida"],
    trim: true,
  },
  ubicacion: {
    type: String,
    required: [true, "La ubicación es requerida"],
    trim: true,
  },
  cabezas: {
    type: Number,
    required: [true, "La cantidad de cabezas es requerida"],
    min: [1, "Debe haber al menos 1 cabeza"],
  },
  status: {
    type: String,
    enum: ["Disponible", "No disponible", "Vendido"],
    default: "Disponible",
  },
  video: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^(https?:\/\/)/.test(v);
      },
      message: "El video debe ser una URL válida (http o https)",
    },
  },
  numCode: {
    type: String,
    required: [true, "El código de país es requerido"],
    trim: true,
  },
  contactNum: {
    type: String,
    required: [true, "El número de contacto es requerido"],
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Animal", reposicion);
