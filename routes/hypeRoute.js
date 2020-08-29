const router = require("express").Router()

const hypeController = require("./../controllers/hypeController")

router.post('/', hypeController.hype)
router.patch('/edit/:hype_id', hypeController.editHype)
router.get('/user/:user_id', hypeController.getAllHypesByUser)