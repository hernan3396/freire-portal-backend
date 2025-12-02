const Animal = require("../models/Reposicion");
const logger = require("../utils/logger");

// GET - Obtener todos los animales ordenados
const getAllAnimals = async (req, res, next) => {
  try {
    const animals = await Animal.find().sort({ order: 1, createdAt: -1 });
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

// POST - Reemplazar todos los animales (con actualización inteligente)
const replaceAllAnimals = async (req, res, next) => {
  try {
    const { animals } = req.body;

    if (!animals || !Array.isArray(animals)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de animales",
      });
    }

    // Validar campos requeridos
    for (let i = 0; i < animals.length; i++) {
      const animal = animals[i];
      if (
        !animal.name ||
        !animal.cat ||
        !animal.raza ||
        !animal.clase ||
        !animal.peso ||
        !animal.edad ||
        !animal.ubicacion ||
        !animal.cabezas ||
        !animal.numCode ||
        !animal.contactNum
      ) {
        return res.status(400).json({
          success: false,
          error: `El animal ${i + 1} no tiene todos los campos requeridos`,
        });
      }
    }

    // Obtener animales existentes
    const existingAnimals = await Animal.find();
    const existingMap = new Map(
      existingAnimals.map((a) => [a._id.toString(), a])
    );

    const operations = [];
    const newAnimalsToCreate = [];
    let hasChanges = false;

    // Procesar cada animal
    for (let i = 0; i < animals.length; i++) {
      const animal = animals[i];

      if (animal._id) {
        const existingAnimal = existingMap.get(animal._id);

        if (existingAnimal) {
          // Verificar cambios
          const hasChanged =
            existingAnimal.name !== animal.name ||
            existingAnimal.cat !== animal.cat ||
            existingAnimal.raza !== animal.raza ||
            existingAnimal.clase !== animal.clase ||
            existingAnimal.peso !== animal.peso ||
            existingAnimal.edad !== animal.edad ||
            existingAnimal.ubicacion !== animal.ubicacion ||
            existingAnimal.cabezas !== animal.cabezas ||
            existingAnimal.status !== (animal.status || "Disponible") ||
            existingAnimal.video !== (animal.video || "") ||
            existingAnimal.numCode !== animal.numCode ||
            existingAnimal.contactNum !== animal.contactNum ||
            existingAnimal.order !== i;

          if (hasChanged) {
            hasChanges = true;
            operations.push({
              updateOne: {
                filter: { _id: animal._id },
                update: {
                  name: animal.name,
                  cat: animal.cat,
                  raza: animal.raza,
                  clase: animal.clase,
                  peso: animal.peso,
                  edad: animal.edad,
                  ubicacion: animal.ubicacion,
                  cabezas: animal.cabezas,
                  status: animal.status || "Disponible",
                  video: animal.video || "",
                  numCode: animal.numCode,
                  contactNum: animal.contactNum,
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(animal._id);
        }
      } else {
        // Nuevo animal
        hasChanges = true;
        newAnimalsToCreate.push({
          ...animal,
          status: animal.status || "Disponible",
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
        data: await Animal.find().sort({ order: 1, createdAt: -1 }),
        message: "No hay cambios para guardar",
      });
    }

    // Ejecutar operaciones
    let updatedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;

    if (operations.length > 0) {
      const result = await Animal.bulkWrite(operations);
      updatedCount = result.modifiedCount;
      logger.info(`${updatedCount} animales actualizados`);
    }

    if (newAnimalsToCreate.length > 0) {
      const created = await Animal.insertMany(newAnimalsToCreate);
      createdCount = created.length;
      logger.info(`${createdCount} animales creados`);
    }

    if (idsToDelete.length > 0) {
      const result = await Animal.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount = result.deletedCount;
      logger.info(`${deletedCount} animales eliminados`);
    }

    // Devolver animales actualizados
    const updatedAnimals = await Animal.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.json({
      success: true,
      data: updatedAnimals,
      message: `Cambios guardados: ${createdCount} creados, ${updatedCount} actualizados, ${deletedCount} eliminados`,
    });
  } catch (error) {
    logger.error("Error al guardar animales:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: Object.values(error.errors).map((e) => e.message),
      });
    }

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
  replaceAllAnimals,
  updateAnimal,
  deleteAnimal,
};
