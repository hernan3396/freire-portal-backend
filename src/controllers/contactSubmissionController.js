const ContactSubmission = require("../models/ContactSubmission");
const logger = require("../utils/logger");

// GET - Obtener todos los envíos
const getAllSubmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const submissions = await ContactSubmission.find(filter).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: submissions });
  } catch (error) {
    logger.error("Error al obtener envíos:", error.message);
    next(error);
  }
};

// GET - Obtener un envío por ID
const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, error: "Envío no encontrado" });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    logger.error("Error al obtener envío:", error.message);
    next(error);
  }
};

// POST - Crear un nuevo envío
const createSubmission = async (req, res, next) => {
  try {
    const { name, email, tel, msg } = req.body;

    const newSubmission = new ContactSubmission({
      name,
      email,
      tel,
      msg: msg || "",
    });

    const savedSubmission = await newSubmission.save();
    logger.info(`Envío de contacto creado: ${savedSubmission._id}`);

    res.status(201).json({ success: true, data: savedSubmission });
  } catch (error) {
    logger.error("Error al crear envío:", error.message);
    next(error);
  }
};

// PUT - Actualizar status de un envío
const updateSubmission = async (req, res, next) => {
  try {
    const { status } = req.body;

    const submission = await ContactSubmission.findById(req.params.id);

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, error: "Envío no encontrado" });
    }

    if (status) submission.status = status;
    submission.updatedAt = new Date();

    const updatedSubmission = await submission.save();
    logger.info(`Envío actualizado: ${updatedSubmission._id}`);

    res.json({ success: true, data: updatedSubmission });
  } catch (error) {
    logger.error("Error al actualizar envío:", error.message);
    next(error);
  }
};

// DELETE - Eliminar un envío
const deleteSubmission = async (req, res, next) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, error: "Envío no encontrado" });
    }

    logger.info(`Envío eliminado: ${submission._id}`);
    res.json({
      success: true,
      message: "Envío eliminado correctamente",
      data: submission,
    });
  } catch (error) {
    logger.error("Error al eliminar envío:", error.message);
    next(error);
  }
};

// GET - Obtener estadísticas
const getSubmissionStats = async (req, res, next) => {
  try {
    const total = await ContactSubmission.countDocuments();
    const pendientes = await ContactSubmission.countDocuments({
      status: "pendiente",
    });
    const leidos = await ContactSubmission.countDocuments({ status: "leído" });
    const respondidos = await ContactSubmission.countDocuments({
      status: "respondido",
    });

    res.json({
      success: true,
      data: { total, pendientes, leidos, respondidos },
    });
  } catch (error) {
    logger.error("Error al obtener estadísticas:", error.message);
    next(error);
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionStats,
};
