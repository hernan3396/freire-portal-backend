const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/posts-db";

    await mongoose
      .connect(mongoURI)
      .then(() => logger.info("Conectado a MongoDB"));
  } catch (error) {
    logger.error("Error de conexion", error);
    process.exit(1);
  }
};

module.exports = connectDB;
