const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
  },
});

const navbarSchema = new mongoose.Schema(
  {
    links: {
      type: [linkSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Debe tener al menos un enlace"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Navbar", linkSchema);
