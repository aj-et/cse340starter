// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require('../utilities')
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/", utilities.handleErrors(invController.buildManagementView));
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Assignment 3
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));

router.post(
    "/add-classification",
    invValidate.addNewClassificationRules(),
    invValidate.checkNewClassificationData,
    utilities.handleErrors(invController.addNewClassification)
);

router.post(
    "/add-inventory",
    invValidate.addNewInventoryRules(),
    invValidate.checkNewInventoryData,
    utilities.handleErrors(invController.addNewInventory)
);

router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON)
)

module.exports = router;