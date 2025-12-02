const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      trim: true,
      maxlength: [150, "El título no puede exceder 150 caracteres"],
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
    image: {
      type: String,
      required: [true, "La imagen es requerida"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Debe ser una URL válida",
      },
    },
    link: {
      type: String,
      required: [true, "El link es requerido"],
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Debe ser una URL válida",
      },
    },
    date: {
      type: Date,
      required: [true, "La fecha es requerida"],
      default: Date.now,
    },
    alt: {
      type: String,
      required: [true, "El texto alternativo es requerido"],
      maxlength: [200, "El alt no puede exceder 200 caracteres"],
    },
    cta: {
      type: String,
      default: "Click",
      maxlength: [50, "El CTA no puede exceder 50 caracteres"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
