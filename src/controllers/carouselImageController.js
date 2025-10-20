const CarouselImage = require("../models/CarouselImage");
const logger = require("../utils/logger");

// GET - Obtener todas las imágenes del carousel
const getAllCarouselImages = async (req, res, next) => {
  try {
    const images = await CarouselImage.find().sort({ createdAt: -1 });
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

// POST - Crear una nueva imagen del carousel
const createCarouselImage = async (req, res, next) => {
  try {
    const { alt, link, title, description, cta } = req.body;

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
  updateCarouselImage,
  deleteCarouselImage,
};
