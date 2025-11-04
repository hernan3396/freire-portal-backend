const Location = require("../models/Location");
const logger = require("../utils/logger");

// GET - Obtener todas las ubicaciones
const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json({ success: true, data: locations });
  } catch (error) {
    logger.error("Error al obtener ubicaciones:", error.message);
    next(error);
  }
};

// GET - Obtener una ubicación por ID
const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Ubicación no encontrada" });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    logger.error("Error al obtener la ubicación:", error.message);
    next(error);
  }
};

// GET - Obtener una ubicación por nombre
const getLocationByName = async (req, res, next) => {
  try {
    const location = await Location.findOne({
      name: req.params.name.toLowerCase(),
    });

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Ubicación no encontrada" });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    logger.error("Error al obtener la ubicación:", error.message);
    next(error);
  }
};

// POST - Crear una nueva ubicación
const createLocation = async (req, res, next) => {
  try {
    const { name, lat, lng } = req.body;

    const newLocation = new Location({
      name: name.toLowerCase(),
      lat,
      lng,
    });

    const savedLocation = await newLocation.save();
    logger.info(`Ubicación creada: ${savedLocation._id}`);

    res.status(201).json({ success: true, data: savedLocation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Ya existe una ubicación con ese nombre",
      });
    }
    logger.error("Error al crear ubicación:", error.message);
    next(error);
  }
};

// PUT - Actualizar una ubicación
const updateLocation = async (req, res, next) => {
  try {
    const { name, lat, lng } = req.body;

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Ubicación no encontrada" });
    }

    if (name) location.name = name.toLowerCase();
    if (lat !== undefined) location.lat = lat;
    if (lng !== undefined) location.lng = lng;
    location.updatedAt = new Date();

    const updatedLocation = await location.save();
    logger.info(`Ubicación actualizada: ${updatedLocation._id}`);

    res.json({ success: true, data: updatedLocation });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Ya existe una ubicación con ese nombre",
      });
    }
    logger.error("Error al actualizar ubicación:", error.message);
    next(error);
  }
};

// DELETE - Eliminar una ubicación
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Ubicación no encontrada" });
    }

    logger.info(`Ubicación eliminada: ${location._id}`);
    res.json({
      success: true,
      message: "Ubicación eliminada correctamente",
      data: location,
    });
  } catch (error) {
    logger.error("Error al eliminar ubicación:", error.message);
    next(error);
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  getLocationByName,
  createLocation,
  updateLocation,
  deleteLocation,
};
