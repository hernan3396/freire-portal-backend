const express = require("express");
const router = express.Router();
const aboutUsController = require("../controllers/aboutUsController.js");

router.get("/", aboutUsController.getAllAboutUs);
router.post("/replace-all", aboutUsController.replaceAllAboutUs);
router.get("/:id", aboutUsController.getAboutUsById);
router.put("/:id", aboutUsController.updateAboutUs);
router.delete("/:id", aboutUsController.deleteAboutUs);

module.exports = router;
