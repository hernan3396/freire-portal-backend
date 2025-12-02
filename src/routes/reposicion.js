const express = require("express");
const router = express.Router();
const reposicionController = require("../controllers/reposicionController");

router.get("/", reposicionController.getAllAnimals);
router.get("/:id", reposicionController.getAnimalById);
router.post("/", reposicionController.createAnimal);
router.put("/:id", reposicionController.updateAnimal);
router.delete("/:id", reposicionController.deleteAnimal);

router.get("/categoria/:cat", reposicionController.getAnimalsByCategory);
router.get("/status/:status", reposicionController.getAnimalsByStatus);
router.post("/replace-all", reposicionController.replaceAllAnimals);

module.exports = router;
