const mongoose = require("mongoose");

const carouselImageSchema = new mongoose.Schema({
  alt: {
    type: String,
    required: [true, "La descripcion es requerida"],
    trim: true,
  },
  link: {
    type: String,
    required: [true, "La imagen es requerida"],
    trim: true,
  },
  title: {
    type: String,
    required: [true, "El titulo es requerido"],
    trim: true,
    maxlength: [100, "El nombre no puede exceder 100 caracteres"],
  },
  description: {
    type: String,
    required: [true, "La descripción es requerida"],
    trim: true,
  },
  cta: {
    type: String,
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

module.exports = mongoose.model("CarouselImage", carouselImageSchema);
