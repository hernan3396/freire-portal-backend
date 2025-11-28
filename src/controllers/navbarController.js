const Navbar = require("../models/Navbar");
const logger = require("../utils/logger");

// GET - Obtener todos los enlaces ordenados
const getAllNavbarLinks = async (req, res, next) => {
  try {
    const links = await Navbar.find().sort({ order: 1 });
    res.json({ success: true, data: links });
  } catch (error) {
    logger.error("Error al obtener enlaces del navbar:", error.message);
    next(error);
  }
};

// POST - Reemplazar todos los enlaces (con actualización inteligente)
const replaceAllNavbarLinks = async (req, res, next) => {
  try {
    const { links } = req.body;

    if (!links || !Array.isArray(links)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de enlaces",
      });
    }

    // Obtener los enlaces existentes
    const existingLinks = await Navbar.find();
    const existingMap = new Map(
      existingLinks.map((link) => [link._id.toString(), link])
    );

    const operations = [];
    const newLinksToCreate = [];

    // Procesar cada enlace del array
    for (let i = 0; i < links.length; i++) {
      const link = links[i];

      if (link._id) {
        // Si tiene _id, es una actualización
        const existingLink = existingMap.get(link._id);

        if (existingLink) {
          // Actualizar solo si cambió algo
          if (
            existingLink.text !== link.text ||
            existingLink.link !== link.link ||
            existingLink.order !== i
          ) {
            operations.push({
              updateOne: {
                filter: { _id: link._id },
                update: {
                  text: link.text,
                  link: link.link,
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(link._id); // Marcar como procesado
        }
      } else {
        // Sin _id, es nuevo
        newLinksToCreate.push({
          text: link.text,
          link: link.link,
          order: i,
        });
      }
    }

    // Los que quedaron en el map deben ser eliminados
    const idsToDelete = Array.from(existingMap.keys());

    // Ejecutar todas las operaciones
    if (operations.length > 0) {
      await Navbar.bulkWrite(operations);
      logger.info(`${operations.length} enlaces actualizados`);
    }

    if (newLinksToCreate.length > 0) {
      await Navbar.insertMany(newLinksToCreate);
      logger.info(`${newLinksToCreate.length} enlaces creados`);
    }

    if (idsToDelete.length > 0) {
      await Navbar.deleteMany({ _id: { $in: idsToDelete } });
      logger.info(`${idsToDelete.length} enlaces eliminados`);
    }

    // Obtener y devolver todos los enlaces actualizados
    const updatedLinks = await Navbar.find().sort({ order: 1 });

    res.json({
      success: true,
      data: updatedLinks,
      message: `Navbar actualizado correctamente`,
    });
  } catch (error) {
    logger.error("Error al actualizar enlaces del navbar:", error.message);
    next(error);
  }
};

// DELETE - Eliminar un enlace específico
const deleteNavbarLink = async (req, res, next) => {
  try {
    const link = await Navbar.findByIdAndDelete(req.params.id);

    if (!link) {
      return res.status(404).json({
        success: false,
        error: "Enlace no encontrado",
      });
    }

    logger.info(`Enlace del navbar eliminado: ${link._id}`);
    res.json({
      success: true,
      message: "Enlace eliminado correctamente",
      data: link,
    });
  } catch (error) {
    logger.error("Error al eliminar enlace:", error.message);
    next(error);
  }
};

module.exports = {
  getAllNavbarLinks,
  replaceAllNavbarLinks,
  deleteNavbarLink,
};
