const AboutUs = require("../models/AboutUs.js");
const logger = require("../utils/logger.js");

// GET - Obtener todas las secciones ordenadas
const getAllAboutUs = async (req, res, next) => {
  try {
    const sections = await AboutUs.find().sort({ order: 1 });
    res.json({ success: true, data: sections });
  } catch (error) {
    logger.error("Error al obtener secciones About Us:", error.message);
    next(error);
  }
};

// POST - Reemplazar todas las secciones
const replaceAllAboutUs = async (req, res, next) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de secciones",
      });
    }

    // Eliminar todas las secciones existentes
    await AboutUs.deleteMany({});
    logger.info("Secciones anteriores de About Us eliminadas");

    // Crear las nuevas secciones con su orden
    const savedSections = await AboutUs.insertMany(
      sections.map((section, index) => ({
        ...section,
        order: index,
      }))
    );

    logger.info(`${savedSections.length} secciones de About Us guardadas`);

    res.status(201).json({
      success: true,
      data: savedSections,
      message: `${savedSections.length} secciones guardadas correctamente`,
    });
  } catch (error) {
    logger.error("Error al guardar secciones About Us:", error.message);
    next(error);
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
  getAllAboutUs,
  replaceAllAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs,
};
