const router = require("express").Router()
const userController = require("./../controllers/userController")

router.post('/signup', userController.registerUser)
router.post('/login', userController.LoginUser)

module.exports = router