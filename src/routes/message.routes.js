const express = require("express");
const Controller = require("../controllers/message.controller");
const router = express.Router();
const messageController = new Controller();

router.post("/", messageController.create);
router.post("/sendToMany", messageController.sendToMany);
router.post("/sendToOne", messageController.sendToOne);


module.exports = router;
