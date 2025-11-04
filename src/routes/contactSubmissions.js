const express = require("express");
const router = express.Router();
const contactSubmissionController = require("../controllers/contactSubmissionController");

router.get("/", contactSubmissionController.getAllSubmissions);
router.get("/stats", contactSubmissionController.getSubmissionStats);
router.get("/:id", contactSubmissionController.getSubmissionById);
router.post("/", contactSubmissionController.createSubmission);
router.put("/:id", contactSubmissionController.updateSubmission);
router.delete("/:id", contactSubmissionController.deleteSubmission);

module.exports = router;
