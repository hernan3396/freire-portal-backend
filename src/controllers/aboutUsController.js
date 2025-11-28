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

// POST - Reemplazar todas las secciones (con actualización inteligente)
const replaceAllAboutUs = async (req, res, next) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de secciones",
      });
    }

    // Validar que todas las secciones tengan los campos requeridos
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.title || !section.desc) {
        return res.status(400).json({
          success: false,
          error: `La sección ${
            i + 1
          } no tiene todos los campos requeridos (title, desc)`,
        });
      }
    }

    // Obtener las secciones existentes
    const existingSections = await AboutUs.find();
    const existingMap = new Map(
      existingSections.map((sec) => [sec._id.toString(), sec])
    );

    const operations = [];
    const newSectionsToCreate = [];
    let hasChanges = false;

    // Procesar cada sección del array
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (section._id) {
        // Si tiene _id, es una actualización potencial
        const existingSection = existingMap.get(section._id);

        if (existingSection) {
          // Verificar si cambió algo
          const hasChanged =
            existingSection.title !== section.title ||
            existingSection.desc !== section.desc ||
            existingSection.bgColor !== (section.bgColor || "#FFFFFF") ||
            existingSection.color !== (section.color || "#000000") ||
            existingSection.order !== i;

          if (hasChanged) {
            hasChanges = true;
            operations.push({
              updateOne: {
                filter: { _id: section._id },
                update: {
                  title: section.title,
                  desc: section.desc,
                  bgColor: section.bgColor || "#FFFFFF",
                  color: section.color || "#000000",
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(section._id); // Marcar como procesado
        }
      } else {
        // Sin _id, es nueva
        hasChanges = true;
        newSectionsToCreate.push({
          title: section.title,
          desc: section.desc,
          bgColor: section.bgColor || "#FFFFFF",
          color: section.color || "#000000",
          order: i,
        });
      }
    }

    // Los que quedaron en el map deben ser eliminados
    const idsToDelete = Array.from(existingMap.keys());
    if (idsToDelete.length > 0) {
      hasChanges = true;
    }

    // Si no hay cambios, retornar sin hacer nada
    if (!hasChanges) {
      return res.json({
        success: true,
        data: await AboutUs.find().sort({ order: 1 }),
        message: "No hay cambios para guardar",
      });
    }

    // Ejecutar todas las operaciones
    let updatedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;

    if (operations.length > 0) {
      const result = await AboutUs.bulkWrite(operations);
      updatedCount = result.modifiedCount;
      logger.info(`${updatedCount} secciones About Us actualizadas`);
    }

    if (newSectionsToCreate.length > 0) {
      const created = await AboutUs.insertMany(newSectionsToCreate);
      createdCount = created.length;
      logger.info(`${createdCount} secciones About Us creadas`);
    }

    if (idsToDelete.length > 0) {
      const result = await AboutUs.deleteMany({ _id: { $in: idsToDelete } });
      deletedCount = result.deletedCount;
      logger.info(`${deletedCount} secciones About Us eliminadas`);
    }

    // Obtener y devolver todas las secciones actualizadas
    const updatedSections = await AboutUs.find().sort({ order: 1 });

    res.json({
      success: true,
      data: updatedSections,
      message: `Cambios guardados: ${createdCount} creadas, ${updatedCount} actualizadas, ${deletedCount} eliminadas`,
    });
  } catch (error) {
    logger.error("Error al guardar secciones About Us:", error.message);

    // Si hay error de validación de Mongoose
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

// Obtener un registro por ID
const getAboutUsById = async (req, res, next) => {
  try {
    const aboutUs = await AboutUs.findById(req.params.id);
    if (!aboutUs) {
      return res.status(404).json({
        success: false,
        error: "Registro no encontrado",
      });
    }
    res.json({ success: true, data: aboutUs });
  } catch (error) {
    logger.error("Error al obtener el registro:", error.message);
    next(error);
  }
};

// Actualizar un registro
const updateAboutUs = async (req, res, next) => {
  try {
    const updatedAboutUs = await AboutUs.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedAboutUs) {
      return res.status(404).json({
        success: false,
        error: "Registro no encontrado",
      });
    }

    logger.info(`Sección About Us actualizada: ${updatedAboutUs._id}`);
    res.json({ success: true, data: updatedAboutUs });
  } catch (error) {
    logger.error("Error al actualizar el registro:", error.message);
    next(error);
  }
};

// Eliminar un registro
const deleteAboutUs = async (req, res, next) => {
  try {
    const deletedAboutUs = await AboutUs.findByIdAndDelete(req.params.id);

    if (!deletedAboutUs) {
      return res.status(404).json({
        success: false,
        error: "Registro no encontrado",
      });
    }

    logger.info(`Sección About Us eliminada: ${deletedAboutUs._id}`);
    res.json({
      success: true,
      message: "Registro eliminado correctamente",
      data: deletedAboutUs,
    });
  } catch (error) {
    logger.error("Error al eliminar el registro:", error.message);
    next(error);
  }
};

module.exports = {
  getAllAboutUs,
  replaceAllAboutUs,
  getAboutUsById,
  updateAboutUs,
  deleteAboutUs,
};
