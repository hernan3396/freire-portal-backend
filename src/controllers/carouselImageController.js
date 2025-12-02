const CarouselImage = require("../models/CarouselImage");
const logger = require("../utils/logger");

// GET - Obtener todas las imágenes del carousel ordenadas
const getAllCarouselImages = async (req, res, next) => {
  try {
    const images = await CarouselImage.find().sort({ order: 1 });
    res.json({ success: true, data: images });
  } catch (error) {
    logger.error("Error al obtener imágenes del carousel:", error.message);
    next(error);
  }
};

// GET - Obtener una imagen del carousel por ID
const getCarouselImageById = async (req, res, next) => {
  try {
    const image = await CarouselImage.findById(req.params.id);

    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Imagen del carousel no encontrada" });
    }

    res.json({ success: true, data: image });
  } catch (error) {
    logger.error("Error al obtener la imagen del carousel:", error.message);
    next(error);
  }
};

// POST - Crear una nueva imagen del carousel (verificar duplicados)
const createCarouselImage = async (req, res, next) => {
  try {
    const { alt, link, title, description, cta } = req.body;

    // Verificar si ya existe una imagen con el mismo link
    const existingImage = await CarouselImage.findOne({ link });

    if (existingImage) {
      return res.status(400).json({
        success: false,
        error: "Ya existe una imagen con esta URL en el carousel",
      });
    }

    const newImage = new CarouselImage({
      alt,
      link,
      title,
      description,
      cta: cta || "Ver más",
    });

    const savedImage = await newImage.save();
    logger.info(`Imagen del carousel creada: ${savedImage._id}`);

    res.status(201).json({ success: true, data: savedImage });
  } catch (error) {
    logger.error("Error al crear imagen del carousel:", error.message);
    next(error);
  }
};

// POST - Guardar múltiples imágenes (con actualización inteligente)
const replaceAllCarouselImages = async (req, res, next) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de imágenes",
      });
    }

    // Validar que todas las imágenes tengan los campos requeridos
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.title || !img.description || !img.link || !img.alt) {
        return res.status(400).json({
          success: false,
          error: `La imagen ${
            i + 1
          } no tiene todos los campos requeridos (title, description, link, alt)`,
        });
      }
    }

    // Obtener las imágenes existentes
    const existingImages = await CarouselImage.find();
    const existingMap = new Map(
      existingImages.map((img) => [img._id.toString(), img])
    );

    const operations = [];
    const newImagesToCreate = [];
    let hasChanges = false;

    // Procesar cada imagen del array
    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (img._id) {
        // Si tiene _id, es una actualización potencial
        const existingImage = existingMap.get(img._id);

        if (existingImage) {
          // Verificar si cambió algo
          const hasChanged =
            existingImage.title !== img.title ||
            existingImage.description !== img.description ||
            existingImage.link !== img.link ||
            existingImage.alt !== img.alt ||
            existingImage.cta !== (img.cta || "Ver más") ||
            existingImage.order !== i;

          if (hasChanged) {
            hasChanges = true;
            operations.push({
              updateOne: {
                filter: { _id: img._id },
                update: {
                  title: img.title,
                  description: img.description,
                  link: img.link,
                  alt: img.alt,
                  cta: img.cta || "Ver más",
                  order: i,
                  updatedAt: new Date(),
                },
              },
            });
          }
          existingMap.delete(img._id); // Marcar como procesado
        }
      } else {
        // Sin _id, es nueva
        hasChanges = true;
        newImagesToCreate.push({
          title: img.title,
          description: img.description,
          link: img.link,
          alt: img.alt,
          cta: img.cta || "Ver más",
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
        data: await CarouselImage.find().sort({ order: 1 }),
        message: "No hay cambios para guardar",
      });
    }

    // Ejecutar todas las operaciones
    let updatedCount = 0;
    let createdCount = 0;
    let deletedCount = 0;

    if (operations.length > 0) {
      const result = await CarouselImage.bulkWrite(operations);
      updatedCount = result.modifiedCount;
      logger.info(`${updatedCount} imágenes del carousel actualizadas`);
    }

    if (newImagesToCreate.length > 0) {
      const created = await CarouselImage.insertMany(newImagesToCreate);
      createdCount = created.length;
      logger.info(`${createdCount} imágenes del carousel creadas`);
    }

    if (idsToDelete.length > 0) {
      const result = await CarouselImage.deleteMany({
        _id: { $in: idsToDelete },
      });
      deletedCount = result.deletedCount;
      logger.info(`${deletedCount} imágenes del carousel eliminadas`);
    }

    // Obtener y devolver todas las imágenes actualizadas
    const updatedImages = await CarouselImage.find().sort({ order: 1 });

    res.json({
      success: true,
      data: updatedImages,
      message: `Cambios guardados: ${createdCount} creadas, ${updatedCount} actualizadas, ${deletedCount} eliminadas`,
    });
  } catch (error) {
    logger.error("Error al guardar imágenes del carousel:", error.message);

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

// PUT - Actualizar una imagen del carousel
const updateCarouselImage = async (req, res, next) => {
  try {
    const { alt, link, title, description, cta } = req.body;

    const image = await CarouselImage.findById(req.params.id);

    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Imagen del carousel no encontrada" });
    }

    if (alt) image.alt = alt;
    if (link) image.link = link;
    if (title) image.title = title;
    if (description) image.description = description;
    if (cta) image.cta = cta;
    image.updatedAt = new Date();

    const updatedImage = await image.save();
    logger.info(`Imagen del carousel actualizada: ${updatedImage._id}`);

    res.json({ success: true, data: updatedImage });
  } catch (error) {
    logger.error("Error al actualizar imagen del carousel:", error.message);
    next(error);
  }
};

// DELETE - Eliminar una imagen del carousel
const deleteCarouselImage = async (req, res, next) => {
  try {
    const image = await CarouselImage.findByIdAndDelete(req.params.id);

    if (!image) {
      return res
        .status(404)
        .json({ success: false, error: "Imagen del carousel no encontrada" });
    }

    logger.info(`Imagen del carousel eliminada: ${image._id}`);
    res.json({
      success: true,
      message: "Imagen del carousel eliminada correctamente",
      data: image,
    });
  } catch (error) {
    logger.error("Error al eliminar imagen del carousel:", error.message);
    next(error);
  }
};

module.exports = {
  getAllCarouselImages,
  getCarouselImageById,
  createCarouselImage,
  replaceAllCarouselImages,
  updateCarouselImage,
  deleteCarouselImage,
};
