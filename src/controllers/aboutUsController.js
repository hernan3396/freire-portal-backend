const AboutUs = require("../models/AboutUs.js");

// Obtener todos los registros
const getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.find();
    res.json(aboutUs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los datos de AboutUs", error });
  }
};

// Crear un nuevo registro
const createAboutUs = async (req, res) => {
  try {
    const newAboutUs = new AboutUs(req.body);
    const savedAboutUs = await newAboutUs.save();
    res.status(201).json(savedAboutUs);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al crear el registro de AboutUs", error });
  }
};

// Obtener un registro por ID
const getAboutUsById = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findById(req.params.id);
    if (!aboutUs)
      return res.status(404).json({ message: "Registro no encontrado" });
    res.json(aboutUs);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el registro", error });
  }
};

// Actualizar un registro
const updateAboutUs = async (req, res) => {
  try {
    const updatedAboutUs = await AboutUs.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedAboutUs)
      return res.status(404).json({ message: "Registro no encontrado" });
    res.json(updatedAboutUs);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el registro", error });
  }
};

// Eliminar un registro
const deleteAboutUs = async (req, res) => {
  try {
    const deletedAboutUs = await AboutUs.findByIdAndDelete(req.params.id);
    if (!deletedAboutUs)
      return res.status(404).json({ message: "Registro no encontrado" });
    res.json({ message: "Registro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el registro", error });
  }
};

module.exports = {
  getAboutUs,
  createAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs,
};
