const router = require("express").Router()
const userController = require("./../controllers/userController")

router.post('/signup', userController.registerUser)
router.post('/login', userController.LoginUser)
router.post('/recoverpassword', userController.recoverPassword)
router.post('/resetpassword', userController.resetPassword)
router.patch('/updateprofile/:user_id', userController.updateProfile)
router.patch('/follow/:user_id', userController.follow)
router.get('/:user_id', userController.getUserById)

module.exports = router