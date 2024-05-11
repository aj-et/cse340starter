// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const baseController = require("../controllers/baseController")
const utilities = require('../utilities')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// router.get("/type/:classificationId", invController.errorHandler(invController.buildByClassificationId));

// Assignment 3
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));
// router.get("/detail/:inv_id", invController.errorHandler(invController.buildByInventoryId));

module.exports = router;