const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Inventory View Build HTML Assignment 03
* ************************************ */
Util.buildInventoryGrid = async function(vehicleData) {
  if (!vehicleData || typeof vehicleData !== 'object') {
      return '<p>No vehicle found!</p>'
  }
  const formattedMiles = vehicleData.inv_miles.toLocaleString();
  const html = `
      <div class="vehicle">
          <div class='vehicle-image'>
              <img src=${vehicleData.inv_image} alt=${vehicleData.inv_make}>
          </div>
          <div class='vehicle-details'>
              <h3>${vehicleData.inv_make} ${vehicleData.inv_model} Details</h3>
              <div class='details'>
                  <h3 class='bg-gray'>Price: $${Intl.NumberFormat('en-US').format(vehicleData.inv_price)}</h3>
                  <p class='bg-non-gray'><span class='highlight'>Description:</span> ${vehicleData.inv_description}</p>
                  <p class='bg-gray'><span class='highlight'>Color:</span> ${vehicleData.inv_color}</p>
                  <p class='bg-non-gray'><span class='highlight'>Miles:</span> ${formattedMiles}</p>
              </div>
          </div>
      </div>
  `

  return html;
}

Util.buildClassificationList = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let classificationSelect = data.rows.map(row => ({
      value: row.classification_id,
      label: row.classification_name,
  }))
  return classificationSelect;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Authorization
 * ************************************ */
Util.isAuthorized = (req, res, next) => {
  const account_type = res.locals.accountData.account_type
  if (account_type == "Employee" || account_type == "Admin") {
    next()
  } else {
    req.flash("notice", "Employee or Admin access only")
    return res.redirect("/account/")
  }
}


module.exports = Util