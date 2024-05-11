const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

/* ***************************
 *  Build error handler Assignment 3 Task 3
 * ************************** */
baseController.errorHandler = async function (req, res, next) {
  let nav = await utilities.getNav()
  let title = 'Server Error'
  let errImg = '/images/site/rick-roll.gif'
  let message = 'Oh no! There was a crash. Maybe try a different route?';
  res.render("errors/error", {
      nav,
      title,
      message,
      errImg
  })
}

module.exports = baseController