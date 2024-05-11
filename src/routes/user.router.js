const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const upload = require('../middleware/multer.middleware')
const rolesList = require("../config/rolesList")
const verifyRoles = require("../middleware/verifyRoles.middleware")
const verifyJWT = require("../middleware/verifyJWT.middleware")



router.route('/register').post(
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    userController.newUserRegistration
)

router.route('/auth').post(userController.authUser)
router.route('/refresh').get(userController.handleRefreshToken)
router.route('/logout').get(userController.handleLogout)

router.use(verifyJWT)

router.route('/profiles').get(userController.getPublicProfiles)
router.route('/profiles/:id').get(userController.handleUserProfile)

router.route('/profiles/:id').patch(
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    userController.updateUserProfile
)

router.route('/profiles/:id/visibility').patch(userController.toggleProfile)

router.route('/profiles/public').get(userController.getPublicProfiles)
router.route('/profiles/admins').get(userController.getAdminProfiles)
router.route('/profiles/users').get(userController.getUserProfiles)

router.route('/admin').get(
    verifyRoles(rolesList.Admin),
    userController.getAllProfiles
)

module.exports = router