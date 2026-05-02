const express = require("express");

const router = express.Router();

const controller =
  require("./writing.controller");


/* Activity 1 */

router.post(
  "/analyze-image",
  controller.analyzeImage
);


/* Activity 2 */

router.post(
  "/analyze-drawing",
  controller.analyzeDrawing
);


module.exports = router;