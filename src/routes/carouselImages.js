const express = require("express");
const router = express.Router();
const carouselImageController = require("../controllers/carouselImageController");

router.get("/", carouselImageController.getAllCarouselImages);
router.get("/:id", carouselImageController.getCarouselImageById);
router.post("/", carouselImageController.createCarouselImage);
router.post("/replace-all", carouselImageController.replaceAllCarouselImages); // Nueva ruta
router.put("/:id", carouselImageController.updateCarouselImage);
router.delete("/:id", carouselImageController.deleteCarouselImage);

module.exports = router;
