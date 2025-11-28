const mongoose = require("mongoose");

const navbarSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "El texto es requerido"],
      trim: true,
    },
    link: {
      type: String,
      required: [true, "El link es requerido"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/|\/|#)/.test(v);
        },
        message: "El link debe ser una URL válida o ruta interna",
      },
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

module.exports = mongoose.model("Navbar", navbarSchema);
