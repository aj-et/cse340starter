const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by Inventory id Assignment 3
 * ************************** */
invCont.buildByInventoryId = async function (req, res,next) {
  try {
      const inv_id = req.params.inv_id;
      const vehicleData = await invModel.getVehicleByInventoryId(inv_id);

      if(!vehicleData) {
          return res.status(404).send('Not found!');
      }

      const grid = await utilities.buildInventoryGrid(vehicleData);

      let nav = await utilities.getNav();
      const title = vehicleData.inv_year + ' ' + vehicleData.inv_make + ' ' + vehicleData.inv_model;
      res.render('./inventory/detail', {
          title: title,
          nav,
          grid,
      })

  } catch(err) {
      next(err);
  }
}

/* ***************************
 *  Build management view assignment 4
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
      title: "Management",
      nav,
      classificationSelect,
      errors: null,
  })
}

/* ***************************
*  Build addclassification view assignment 4
* ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
  })
}

/* *****
*   Process Add New Classification assignment 4
* *****/
invCont.addNewClassification = async function (req, res) {
  const { classification_name } = req.body
  
  const addNewClassificationResult = await invModel.addNewClassification(classification_name)
  
  if(addNewClassificationResult) {
      let nav = await utilities.getNav()
      req.flash("notice", `${classification_name} has been added.`)
      res.status(201).render("./inventory/management", {
          title: "Management",
          nav,
          errors: null,
      })
  } else {
      let nav = await utilities.getNav()
      req.flash("notice", "Sorry, adding new classification failed.")
      res.status(501).render("./inventory/add-classification", {
          title: "Add New Classification",
          nav,
          errors: null,
      })
  }
}

/* ***************************
*  Build addinventory view assignment 4
* ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
      let nav = await utilities.getNav()
  
      // fetch classification data from model
      const options = await utilities.buildClassificationList();
      res.render("./inventory/add-inventory", {
          title: "Add New Inventory",
          nav,
          options,
          errors: null,
      })
  } catch (error) {
      console.error("Error fetching classifications: ", error);
      next(error);
  }
}

/* *****
*   Process Add New Inventory assignment 4
* *****/
invCont.addNewInventory = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body

  const addNewInventoryResult = await invModel.addNewInventory(
      classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  )

  if(addNewInventoryResult) {
      let nav = await utilities.getNav()
      req.flash(
          "notice",
          `${inv_make} ${inv_model} has been added.`
      )
      res.status(201).render("./inventory/management", {
          title: "Management",
          nav,
          errors: null,
      })
  } else {
      let nav = await utilities.getNav()
      let options = await utilities.buildClassificationList()
      req.flash("notice", "Sorry, adding new inventory failed.")
      res.status(501).render("inventory/add-inventory", {
          title: "Add New Inventory",
          nav,
          options,
          errors: null,
          classification_id,
          inv_make,
          inv_model,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_year,
          inv_miles,
          inv_color
      })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleByInventoryId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/update-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = invCont