const mongoose = require("mongoose");

const formFieldSchema = new mongoose.Schema(
  {
    displayText: {
      type: String,
      required: [true, "El texto a mostrar es requerido"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "El tipo de campo es requerido"],
      enum: ["text", "email", "tel", "number", "date"],
      default: "text",
    },
    multiline: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const formConfigSchema = new mongoose.Schema({
  formName: {
    type: String,
    required: [true, "El nombre del formulario es requerido"],
    unique: true,
    default: "contactForm",
  },
  fields: {
    name: formFieldSchema,
    email: formFieldSchema,
    tel: formFieldSchema,
    msg: formFieldSchema,
  },
  active: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("FormConfig", formConfigSchema);
