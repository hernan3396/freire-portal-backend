const express = require("express");
const router = express.Router();
const navbarController = require("../controllers/navbarController.js");

router.get("/", navbarController.getNavbars);
router.post("/", navbarController.createNavbar);
router.get("/:id", navbarController.getNavbarById);
router.put("/:id", navbarController.updateNavbar);
router.delete("/:id", navbarController.deleteNavbar);

module.exports = router;
