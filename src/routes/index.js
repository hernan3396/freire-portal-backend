const express = require("express");
const router = express.Router();
const postsRoutes = require("./posts");
const reposicionRoutes = require("./reposicion");
const CarouselImages = require("./carouselImages");
const locationRouter = require("./locations");
const formConfigRoutes = require("./formConfig");
const contactSubmissionsRoutes = require("./contactSubmissions");
const aboutUsRoutes = require("./aboutUs");
const navbarRoutes = require("./navbar");

router.use("/api/posts", postsRoutes);
router.use("/api/reposicion", reposicionRoutes);
router.use("/api/carouselImages", CarouselImages);
router.use("/api/locations", locationRouter);
router.use("/api/form-config", formConfigRoutes);
router.use("/api/contact-submissions", contactSubmissionsRoutes);
router.use("/api/about-us", aboutUsRoutes);
router.use("/api/navbar", navbarRoutes);

router.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Servidor funcionando correctamente" });
});

module.exports = router;
