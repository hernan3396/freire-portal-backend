const Navbar = require("../models/Navbar");

// Obtener todos los registros (por si hay más de uno)
const getNavbars = async (req, res) => {
  try {
    const navbars = await Navbar.find();
    res.json(navbars);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los datos de Navbar", error });
  }
};

// Obtener un registro específico
const getNavbarById = async (req, res) => {
  try {
    const navbar = await Navbar.findById(req.params.id);
    if (!navbar)
      return res.status(404).json({ message: "Navbar no encontrado" });
    res.json(navbar);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el Navbar", error });
  }
};

// Crear un nuevo Navbar
const createNavbar = async (req, res) => {
  try {
    const newNavbar = new Navbar(req.body);
    const savedNavbar = await newNavbar.save();
    res.status(201).json(savedNavbar);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el Navbar", error });
  }
};

// Actualizar un Navbar existente
const updateNavbar = async (req, res) => {
  try {
    const updatedNavbar = await Navbar.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedNavbar)
      return res.status(404).json({ message: "Navbar no encontrado" });
    res.json(updatedNavbar);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el Navbar", error });
  }
};

// Eliminar un Navbar
const deleteNavbar = async (req, res) => {
  try {
    const deletedNavbar = await Navbar.findByIdAndDelete(req.params.id);
    if (!deletedNavbar)
      return res.status(404).json({ message: "Navbar no encontrado" });
    res.json({ message: "Navbar eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el Navbar", error });
  }
};

module.exports = {
  getNavbars,
  getNavbarById,
  createNavbar,
  updateNavbar,
  deleteNavbar,
};
