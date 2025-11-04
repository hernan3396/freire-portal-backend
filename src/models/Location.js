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
