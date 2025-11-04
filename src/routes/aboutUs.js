const express = require("express");
const router = express.Router();
const aboutUsController = require("../controllers/aboutUsController.js");

router.get("/", aboutUsController.getAboutUs);
router.post("/", aboutUsController.createAboutUs);
router.get("/:id", aboutUsController.getAboutUsById);
router.put("/:id", aboutUsController.updateAboutUs);
router.delete("/:id", aboutUsController.deleteAboutUs);

module.exports = router;
