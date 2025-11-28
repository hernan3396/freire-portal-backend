const express = require("express");
const router = express.Router();
const navbarController = require("../controllers/navbarController");

router.get("/", navbarController.getAllNavbarLinks);
router.post("/replace-all", navbarController.replaceAllNavbarLinks);
router.delete("/:id", navbarController.deleteNavbarLink);

module.exports = router;
