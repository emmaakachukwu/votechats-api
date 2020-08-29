const hypeModel = require("./../models/hypeModel")

// HYPING
exports.hype = async (req, res) => {
    const {_id, hype, img_urls}
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

    let hyper = new hypeModel({
        postedBy: _id, hype, img_urls
    })
    hyper.save()
}