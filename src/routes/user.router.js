const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const upload = require('../middleware/multer.middleware')
const rolesList = require("../config/rolesList")
const verifyRoles = require("../middleware/verifyRoles.middleware")
const verifyJWT = require("../middleware/verifyJWT.middleware")


// router for user registeration
router.route('/register').post(
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    userController.newUserRegistration
)

// route for user authentication 
router.route('/auth').post(userController.authUser)
router.route('/refresh').get(userController.handleRefreshToken)
router.route('/logout').get(userController.handleLogout)



router.use(verifyJWT)
// router for authorized user 
// router to show only public profiles
router.route('/profiles').get(userController.getPublicProfiles)

// route to fetch detailed user profile
router.route('/profiles/:id').get(userController.handleUserProfile)

// route to upadte user details
router.route('/profiles/:id').patch(
    upload.fields([
        {
            name: "photo",
            maxCount: 1
        }
    ]),
    userController.updateUserProfile
)

// route to set profile public or private
router.route('/profiles/:id/visibility').patch(userController.toggleProfile)

// routes to fetch public profile and profile based on roles
router.route('/profiles/public').get(userController.getPublicProfiles)
router.route('/profiles/admins').get(userController.getAdminProfiles)
router.route('/profiles/users').get(userController.getUserProfiles)

// temp route to set an admin
router.route('/superuser/:id').patch(userController.setAdmin)

// admin route
router.route('/admin').get(
    verifyRoles(rolesList.Admin),
    userController.getAllProfiles
)

module.exports = router