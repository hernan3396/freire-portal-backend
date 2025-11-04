const mongoose = require("mongoose");

const contactSubmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un email válido"],
  },
  tel: {
    type: String,
    required: [true, "El teléfono es requerido"],
    trim: true,
    validate: {
      validator: function (v) {
        // Acepta formatos: +598 99 123 456, +59899123456, 099123456, etc.
        return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(
          v
        );
      },
      message: "Por favor ingrese un número de teléfono válido",
    },
  },
  msg: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["pendiente", "leído", "respondido"],
    default: "pendiente",
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

module.exports = mongoose.model("ContactSubmission", contactSubmissionSchema);
