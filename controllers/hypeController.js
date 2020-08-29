const hypeModel = require("./../models/hypeModel")

// HYPING
exports.hype = async (req, res) => {
    const {_id, hype, img_urls} // _id represents the hyper's id
    if ( !_id ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Something went wrong..",
                code: 403
            }
        })
    }

    if ( img_urls ) {
        if ( img_urls.constructor !== Array ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Something went wrong..",
                    code: 403
                }
            })
        }
    }

    if ( !hype.trim() ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Hype cannot be empty",
                code: 403
            }
        })
    }

    try {
        let hyper = new hypeModel({
            postedBy: _id, hype, img_urls
        })
        hyper.save()

        return res.status(200).json({
            status: true,
            data: {
                message: "Hype sent"
            }
        })
    } catch ( err ) {
        console.log(err)
        return res.status(400).json({
            status: false,
            error: {
                message: "An unknown error occured; retry later",
                code: 400
            }
        })
    }
}

// EDIT HYPE
exports.editHype = async (req, res) => {
    const _id = req.params._id //_id represents hype id
    const {hype, img_urls} = req.body
    if ( !_id ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Something went wrong..",
                code: 403
            }
        })
    }

    if ( img_urls ) {
        if ( img_urls.constructor !== Array ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Something went wrong..",
                    code: 403
                }
            })
        }
    }

    if ( !hype.trim() ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Hype cannot be empty",
                code: 403
            }
        })
    }

    try {
        await hypeModel.updateOne(
            {_id},
            {
                $set: {
                    hype, image_urls, edited: true
                }
            }
        )

        return res.status(200).json({
            status: true,
            data: {
                message: "Hype updated"
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            status: false,
            error: {
                message: "An unknown error occured; retry later",
                code: 400
            }
        })
    }
}

// GET ALL HYPES BY USER
exports.getAllHypesByUser = async (req, res) => {
    const _id = req.params._id //_id represents user id
    if ( !_id ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Something went wrong..",
                code: 403
            }
        })
    }

    try {
        let hypes = await hypeModel.find({_id, deleted: false, active: true})
        return res.status(200).json({
            status: true,
            data: {
                message: "Hypes retrieved",
                hypes
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            status: false,
            error: {
                message: "An unknown error occured; retry later",
                code: 400
            }
        })
    }
}