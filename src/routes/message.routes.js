const express = require("express");
const Controller = require("../controllers/message.controller");
const router = express.Router();
const messageController = new Controller();

router.get("/", messageController.getNumbers);
router.post("/", messageController.addNumber);
router.post("/send", messageController.sendMessage);
router.post("/sendToMany", messageController.sendToMany);
router.post("/dailyReport", messageController.dailyReport);

module.exports = router;
