const express = require("express");
const router = express.Router();
const postsRoutes = require("./posts");
const reposicionRoutes = require("./reposicion");

router.use("/api/posts", postsRoutes);
router.use("/api/reposicion", reposicionRoutes);

router.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Servidor funcionando correctamente" });
});

module.exports = router;
