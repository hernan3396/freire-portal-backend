const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a BD
connectDB();

// Rutas
app.use("/", routes);

// Manejo de errores
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en http://localhost:${PORT}`);
});
