const Location = require("../models/Location");
const logger = require("../utils/logger");

// GET - Obtener todas las ubicaciones
const getAllLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ order: 1, name: 1 });
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
    const { name, branchName, address, phone, lat, lng } = req.body;

    const newLocation = new Location({
      name: name.toLowerCase(),
      branchName,
      address,
      phone,
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

// POST - Reemplazar todas las ubicaciones (con actualización inteligente)
const replaceAllLocations = async (req, res, next) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de ubicaciones",
      });
    }

    // Validar campos requeridos
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      if (
        !loc.name ||
        !loc.branchName ||
        !loc.address ||
        !loc.phone ||
        loc.lat === undefined ||
        loc.lng === undefined
      ) {
        return res.status(400).json({
          success: false,
          error: `La ubicación ${
            i + 1
          } no tiene todos los campos requeridos (name, branchName, address, phone, lat, lng)`,
        });
      }

      // Validar rangos
      if (loc.lat < -90 || loc.lat > 90) {
        return res.status(400).json({
          success: false,
          error: `La latitud de la ubicación ${
            i + 1
          } debe estar entre -90 y 90`,
        });
      }
      if (loc.lng < -180 || loc.lng > 180) {
        return res.status(400).json({
          success: false,
          error: `La longitud de la ubicación ${
            i + 1
          } debe estar entre -180 y 180`,
        });
      }

      // Validar formato de teléfono
      if (!/^\+\d{1,3}\d{6,14}$/.test(loc.phone)) {
        return res.status(400).json({
          success: false,
          error: `El teléfono de la ubicación ${
            i + 1
          } debe tener formato internacional (+código país + número)`,
        });
      }
    }

    // Obtener ubicaciones existentes
    const existingLocations = await Location.find();
    const existingMap = new Map(
      existingLocations.map((loc) => [loc._id.toString(), loc])
    );

    const operations = [];
    const newLocationsToCreate = [];
    let hasChanges = false;

    // Verificar duplicados de nombres en el array
    const nameSet = new Set();
    for (const loc of locations) {
      const normalizedName = loc.name.toLowerCase().trim();
      if (nameSet.has(normalizedName)) {
        return res.status(400).json({
          success: false,
          error: `El nombre "${loc.name}" está duplicado en la lista`,
        });
      }
      nameSet.add(normalizedName);
    }

    // Procesar cada ubicación
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const normalizedName = loc.name.toLowerCase().trim();

      if (loc._id) {
        const existingLocation = existingMap.get(loc._id);

        if (existingLocation) {
          // Verificar cambios
          const hasChanged =
            existingLocation.name !== normalizedName ||
            existingLocation.branchName !== loc.branchName ||
            existingLocation.address !== loc.address ||
            existingLocation.phone !== loc.phone ||
            existingLocation.lat !== loc.lat ||
            existingLocation.lng !== loc.lng ||
            existingLocation.order !== i;

          if (hasChanged) {
            hasChanges = true;
            operations.push({
              updateOne: {
                filter: { _id: loc._id },
                update: {
                  name: normalizedName,
                  branchName: loc.branchName,
                  address: loc.address,
                  phone: loc.phone,
                  lat: loc.lat,
                  lng: loc.lng,
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(loc._id);
        }
      } else {
        // Nueva ubicación
        hasChanges = true;
        newLocationsToCreate.push({
          name: normalizedName,
          branchName: loc.branchName,
          address: loc.address,
          phone: loc.phone,
          lat: loc.lat,
          lng: loc.lng,
          order: i,
        });
      }
    }

    // IDs a eliminar
    const idsToDelete = Array.from(existingMap.keys());
    if (idsToDelete.length > 0) {
      hasChanges = true;
    }

    // Si no hay cambios
    if (!hasChanges) {
      return res.json({
        success: true,
        data: await Location.find().sort({ order: 1, name: 1 }),
        message: "No hay cambios para guardar",
      });
    }

    // Ejecutar operaciones
    let updatedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;

    if (operations.length > 0) {
      const result = await Location.bulkWrite(operations);
      updatedCount = result.modifiedCount;
      logger.info(`${updatedCount} ubicaciones actualizadas`);
    }

    if (newLocationsToCreate.length > 0) {
      const created = await Location.insertMany(newLocationsToCreate);
      createdCount = created.length;
      logger.info(`${createdCount} ubicaciones creadas`);
    }

    if (idsToDelete.length > 0) {
      const result = await Location.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount = result.deletedCount;
      logger.info(`${deletedCount} ubicaciones eliminadas`);
    }

    // Devolver ubicaciones actualizadas
    const updatedLocations = await Location.find().sort({ order: 1, name: 1 });

    res.json({
      success: true,
      data: updatedLocations,
      message: `Cambios guardados: ${createdCount} creadas, ${updatedCount} actualizadas, ${deletedCount} eliminadas`,
    });
  } catch (error) {
    logger.error("Error al guardar ubicaciones:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Error: nombre de ubicación duplicado",
      });
    }

    next(error);
  }
};

// PUT - Actualizar una ubicación
const updateLocation = async (req, res, next) => {
  try {
    const { name, branchName, address, phone, lat, lng } = req.body;

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res
        .status(404)
        .json({ success: false, error: "Ubicación no encontrada" });
    }

    if (name) location.name = name.toLowerCase();
    if (branchName) location.branchName = branchName;
    if (address) location.address = address;
    if (phone) location.phone = phone;
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
  replaceAllLocations,
  updateLocation,
  deleteLocation,
};
