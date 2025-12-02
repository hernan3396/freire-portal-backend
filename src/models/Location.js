const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la ubicación es requerido"],
    trim: true,
    unique: true,
    lowercase: true,
    maxlength: [50, "El nombre no puede exceder 50 caracteres"],
  },
  branchName: {
    type: String,
    required: [true, "El nombre de la sucursal es requerido"],
    trim: true,
    maxlength: [
      100,
      "El nombre de la sucursal no puede exceder 100 caracteres",
    ],
  },
  address: {
    type: String,
    required: [true, "La dirección es requerida"],
    trim: true,
    maxlength: [200, "La dirección no puede exceder 200 caracteres"],
  },
  phone: {
    type: String,
    required: [true, "El teléfono es requerido"],
    trim: true,
    validate: {
      validator: function (v) {
        // Valida formato internacional: +código país seguido de números
        return /^\+\d{1,3}\d{6,14}$/.test(v);
      },
      message: (props) =>
        `${props.value} no es un formato válido. Use formato internacional: +598xxxxxxxxx`,
    },
  },
  lat: {
    type: Number,
    required: [true, "La latitud es requerida"],
    min: [-90, "La latitud debe estar entre -90 y 90"],
    max: [90, "La latitud debe estar entre -90 y 90"],
  },
  lng: {
    type: Number,
    required: [true, "La longitud es requerida"],
    min: [-180, "La longitud debe estar entre -180 y 180"],
    max: [180, "La longitud debe estar entre -180 y 180"],
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

module.exports = mongoose.model("Location", locationSchema);
