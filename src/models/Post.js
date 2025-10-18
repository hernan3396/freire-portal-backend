const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  alt: {
    type: String,
    required: [true, "La descripcion de la imagen es requerida"],
    trim: true,
    maxlength: [
      100,
      "La descripcion de la imagen no puede exceder 100 caracteres",
    ],
  },
  image: {
    type: String,
    required: [true, "La imagen es requerida"],
    trim: true,
  },
  link: {
    type: String,
    required: [true, "El link es requerido"],
    trim: true,
    validate: {
      validator: function (v) {
        return /^(https?:\/\/)/.test(v);
      },
      message: "El link debe ser una URL válida (http o https)",
    },
  },
  title: {
    type: String,
    required: [true, "El título es requerido"],
    trim: true,
    maxlength: [150, "El título no puede exceder 150 caracteres"],
  },
  description: {
    type: String,
    required: [true, "La descripción es requerida"],
    trim: true,
  },
  cta: {
    type: String,
    default: "Click",
    trim: true,
  },
  date: {
    type: Date,
    required: [true, "La fecha es requerida"],
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

module.exports = mongoose.model("Post", postSchema);
