// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require('../utilities')
const accController = require('../controllers/accController')
const regValidate = require('../utilities/account-validation')

// Get Route when 'My account' link is clicked
router.get("/", utilities.checkLogin, utilities.handleErrors(accController.buildAccountManagementView));
router.get("/login", utilities.handleErrors(accController.buildLogin));
router.get("/register", utilities.handleErrors(accController.buildRegister));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLogData,
    utilities.handleErrors(accController.accountLogin)
)

router.get(
    '/logout',
    utilities.checkLogin,
    utilities.handleErrors(accController.logoutAccount)
)

router.get(
    '/update/:account_id',
    utilities.checkLogin,
    utilities.handleErrors(accController.updateView)
)

router.post(
    '/updateInfo',
    regValidate.updateInfoRules(),
    regValidate.checkUpdateInfo,
    utilities.handleErrors(accController.updateInfo)
)

router.post(
    '/updatePassword',
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePassword,
    utilities.handleErrors(accController.updatePassword)
)

module.exports = router