const express = require("express");
const router = express.Router();
const formConfigController = require("../controllers/formConfigController");

router.get("/", formConfigController.getFormConfig);
router.post("/", formConfigController.createOrUpdateFormConfig);

module.exports = router;
