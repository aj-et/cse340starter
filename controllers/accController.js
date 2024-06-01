// Needed Resources
const utilities = require('../utilities')
const accountModel = require("../models/account-model")
const reviewModel = require('../models/review-models')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
}

/* **********************
 *   Account Management View
 * ********************* */
async function buildAccountManagementView(req, res) {
  let nav = await utilities.getNav()
  const reviews = await reviewModel.getReviewsByAccountId(res.locals.accountData.account_id)
  const reviewList = utilities.buildAccountReviewList(reviews)
  let {accountData} = res.locals.accountData
  res.render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
      reviewList,
  })
}

/* **********************
 *   Account Logout
 * ********************* */
async function logoutAccount(req, res) {
  res.clearCookie('jwt');
  res.locals.accountData = null;
  return res.redirect("/");
}

/* **********************
 *   Account Update View
 * ********************* */
async function updateView (req, res) {
  let nav = await utilities.getNav()
  const accountId = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(accountId)
  res.render("account/account-update", {
      title: "Edit Account Info",
      nav,
      errors:null,
      account_id: accountId,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
  })
}

/* **********************
 *   Update Account Info
 * ********************* */
async function updateInfo(req, res, next) {
  let nav = await utilities.getNav()
  let {accountData} = res.locals
  let { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateInfo(
      account_firstname, account_lastname, account_email, accountData.account_id
  )
  if (updateResult) {
      res.locals.accountData = await accountModel.getAccountById(accountData.account_id)
      let accountData1 = res.locals.accountData
      req.flash("notice", "Account updated successfully.")
      res.status(201).render("account/account-management", {
          title: "Account Management",
          nav,
          errors: null,
          accountData1
      })
  } else {
      req.flash("notice", "Sorry, the update failed. Please try again.")
      res.status(501).render("account/account-update", {
          title: "Update Account",
          nav,
          errors: null,
          account_id, account_firstname, account_lastname, account_email
      })
  }
}

/* **********************
 *   Update Account Password
 * ********************* */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  let {accountData} = res.locals
  let { account_password } = req.body
  let hashedPassword
  try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
      req.flash("notice", 'Sorry, there was an error changing account info.')
      res.status(500).render("account/update-account", {
          title: "Update Account",
          nav,
          errors: null,
      })
  }
  const updateResult = await accountModel.updatePassword(
      hashedPassword, accountData.account_id
  )
  if (updateResult) {
      res.locals.accountData = await accountModel.getAccountById(accountData.account_id)
      let accountData1 = res.locals.accountData
      req.flash("notice", "Password updated successfully.")
      res.status(201).render("account/account-management", {
          title: "Account Management",
          nav,
          errors: null,
          accountData1
      })
  } else {
      req.flash("notice", "Sorry, the update failed. Please try again.")
      res.status(501).render("account/account-update", {
          title: "Update Account",
          nav,
          errors: null,
          account_id,
      })
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount,
  accountLogin,
  buildAccountManagementView,
  logoutAccount,
  updateView,
  updateInfo,
  updatePassword
}