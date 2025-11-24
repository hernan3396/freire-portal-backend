const CarouselImage = require("../models/CarouselImage");
const logger = require("../utils/logger");

// GET - Obtener todas las imágenes del carousel
const getAllCarouselImages = async (req, res, next) => {
  try {
    const images = await CarouselImage.find().sort({ order: 1 }); // Ordenar por campo order
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

// POST - Guardar múltiples imágenes (reemplaza todas las existentes)
const replaceAllCarouselImages = async (req, res, next) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        error: "Se requiere un array de imágenes",
      });
    }

    // Eliminar todas las imágenes existentes
    await CarouselImage.deleteMany({});
    logger.info("Imágenes anteriores del carousel eliminadas");

    // Crear las nuevas imágenes con su orden
    const savedImages = await CarouselImage.insertMany(
      images.map((img, index) => ({
        ...img,
        cta: img.cta || "Ver más",
        order: index, // Asignar el orden según el índice
      }))
    );

    logger.info(`${savedImages.length} imágenes del carousel guardadas`);

    res.status(201).json({
      success: true,
      data: savedImages,
      message: `${savedImages.length} imágenes guardadas correctamente`,
    });
  } catch (error) {
    logger.error("Error al guardar imágenes del carousel:", error.message);
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
