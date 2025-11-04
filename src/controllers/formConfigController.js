const FormConfig = require("../models/FormConfig");
const logger = require("../utils/logger");

// GET - Obtener la configuración del formulario
const getFormConfig = async (req, res, next) => {
  try {
    let config = await FormConfig.findOne({
      formName: "contactForm",
      active: true,
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        error: "No se encontró configuración del formulario",
      });
    }

    res.json({ success: true, data: config });
  } catch (error) {
    logger.error(
      "Error al obtener configuración del formulario:",
      error.message
    );
    next(error);
  }
};

// POST - Crear/actualizar configuración del formulario
const createOrUpdateFormConfig = async (req, res, next) => {
  try {
    const { fields } = req.body;

    let config = await FormConfig.findOne({ formName: "contactForm" });

    if (config) {
      config.fields = fields;
      config.updatedAt = new Date();
      await config.save();
      logger.info("Configuración del formulario actualizada");
    } else {
      config = new FormConfig({
        formName: "contactForm",
        fields,
      });
      await config.save();
      logger.info("Configuración del formulario creada");
    }

    res.json({ success: true, data: config });
  } catch (error) {
    logger.error("Error al crear/actualizar configuración:", error.message);
    next(error);
  }
};

module.exports = {
  getFormConfig,
  createOrUpdateFormConfig,
};
