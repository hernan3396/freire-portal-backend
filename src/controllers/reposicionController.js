const Animal = require("../models/Reposicion");
const logger = require("../utils/logger");

// GET - Obtener todos los animales
const getAllAnimals = async (req, res, next) => {
  try {
    const animals = await Animal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: animals });
  } catch (error) {
    logger.error("Error al obtener animales:", error.message);
    next(error);
  }
};

// GET - Obtener un animal por ID
const getAnimalById = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res
        .status(404)
        .json({ success: false, error: "Animal no encontrado" });
    }

    res.json({ success: true, data: animal });
  } catch (error) {
    logger.error("Error al obtener el animal:", error.message);
    next(error);
  }
};

// GET - Obtener animales por categoría
const getAnimalsByCategory = async (req, res, next) => {
  try {
    const { cat } = req.params;
    const animals = await Animal.find({ cat }).sort({ createdAt: -1 });

    if (animals.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No hay animales en esta categoría" });
    }

    res.json({ success: true, data: animals });
  } catch (error) {
    logger.error("Error al obtener animales por categoría:", error.message);
    next(error);
  }
};

// GET - Obtener animales por status
const getAnimalsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const animals = await Animal.find({ status }).sort({ createdAt: -1 });

    if (animals.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No hay animales con este status" });
    }

    res.json({ success: true, data: animals });
  } catch (error) {
    logger.error("Error al obtener animales por status:", error.message);
    next(error);
  }
};

// POST - Crear un nuevo animal
const createAnimal = async (req, res, next) => {
  try {
    const newAnimal = new Animal(req.body);
    const savedAnimal = await newAnimal.save();

    logger.info(`Animal creado: ${savedAnimal._id}`);
    res.status(201).json({ success: true, data: savedAnimal });
  } catch (error) {
    logger.error("Error al crear el animal:", error.message);
    next(error);
  }
};

// PUT - Actualizar un animal
const updateAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!animal) {
      return res
        .status(404)
        .json({ success: false, error: "Animal no encontrado" });
    }

    logger.info(`Animal actualizado: ${animal._id}`);
    res.json({ success: true, data: animal });
  } catch (error) {
    logger.error("Error al actualizar el animal:", error.message);
    next(error);
  }
};

// DELETE - Eliminar un animal
const deleteAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);

    if (!animal) {
      return res
        .status(404)
        .json({ success: false, error: "Animal no encontrado" });
    }

    logger.info(`Animal eliminado: ${animal._id}`);
    res.json({
      success: true,
      message: "Animal eliminado correctamente",
      data: animal,
    });
  } catch (error) {
    logger.error("Error al eliminar el animal:", error.message);
    next(error);
  }
};

module.exports = {
  getAllAnimals,
  getAnimalById,
  getAnimalsByCategory,
  getAnimalsByStatus,
  createAnimal,
  updateAnimal,
  deleteAnimal,
};
