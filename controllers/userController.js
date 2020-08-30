const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const bCrypt = require('bcryptjs')

const userModel = require("./../models/userModel")
const recoverModel = require("./../models/recoverModel")

const JWT_KEY = process.env.JWT_KEY

// FOR SIGNUP
module.exports.registerUser = async (req, res) => {
    let { email, username, password } = req.body
    email = email ? email.trim() : null
    username = username ? username.trim() : null
    if ( !username || !email || !password ) {
        return res.status(400).json({
            status: false,
            error: {
                message: "All fields are required",
                code: 400
            }
        })
    } else if ( username.length < 3 ) {
        return res.status(400).json({
            status: false,
            error: {
                message: "Username must be a minimum of three (3) characters",
                code: 400
            }
        })
    } else if ( password.length < 6 ) {
        return res.status(400).json({
            status: false,
            error: {
                message: "Password must be a minimum of six (6) characters",
                code: 400
            }
        })
    } else if ( !validateEmail(email) ) {
        return res.status(400).json({
            status: false,
            error: {
                message: "Invalid email address",
                code: 400
            }
        })
    }

    try {
        const token = jwt.sign({
            username,
            email
        }, JWT_KEY, {
            expiresIn: "1d"
        })
    
        const hashpassword = await bCrypt.hash(password, 12)
        const checkEmail = await userModel.findOne({email}, {email: 1})
        const checkUsername = await userModel.findOne({username}, {username: 1})

        if ( checkEmail ) {
            return res.status(409).json({
                status: false,
                error: {
                    message: "Email address already registered",
                    code: 409
                }
            })
        } else if ( checkUsername ) {
            return res.status(409).json({
                status: false,
                error: {
                    message: "Username already taken",
                    code: 409
                }
            })
        }

        const user = new userModel({
            username,
            email,
            password: hashpassword
        })

        user.save()
        res.status(200).json({
            status: true,
            data: {
                message: "User registered successfully",
                user,
                token
            }
        })
    } catch ( err ) {
        console.log(err)
    }    
}

// LOGIN
module.exports.LoginUser = async (req, res) => {
    let { email, password } = req.body
    email = email ? email.trim() : null
    if ( !email || !password ) {
        return res.status(400).json({
            status: false,
            error: {
                message: "All fields are required",
                code: 400
            }
        })
    }

    try {
        let findEmail = await userModel.findOne({email}, {email: 1, password: 1})
        let checkpassword = findEmail ? await bCrypt.compare(password, findEmail.password) : false
        if ( !checkpassword ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Invalid login",
                    code: 401                }
            })
        }

        const token = jwt.sign({
            email,
            id: findEmail._id
        }, JWT_KEY, {expiresIn: "1d"})

        res.status(200).json({
            status: true,
            data: {
                message: "Login successful",
                user: findEmail,
                token
            }
        })
    } catch ( err ) {
        console.log(err)
    }
}

// FORGOT PASSWORD
exports.recoverPassword = async (req, res) => {
    const email = req.body.email.trim()
    if ( !email ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Email address is required for password recovery",
                code: 403
            }
        })
    }

    try {
        const user = await userModel.findOne({email}, {email: 1})
        if ( !user ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Email address is not registered",
                    code: 403
                }
            })
        }

        const code = new Date().getTime().toString().slice(-4) + new Date().getTime().toString().slice(0, 4)
        const checkEmail = await recoverModel.findOne({email})
        if ( checkEmail ) {
            checkEmail.code = code
            checkEmail.recoveryCount += 1
            checkEmail.save()
        } else {
            const saveCode = recoverModel({
                email, code, recoveryCount: 1
            })
            saveCode.save()
        }        

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: process.env.MAIL_FROM, // sender address
            to: email, // list of receivers
            subject: "PASSWORD RESET", // Subject line
            html: `
                    <b>You requested to reset your password for your registered account with <a href="${process.env.APP_URL}">${process.env.APP_NAME}</a></b>
                    <p>Use this code to reset your password - <strong>${code}</strong></p>
                `, // html body
        });

        return res.status(200).json({
            status: 200,
            data: {
                message: "Recovery code sent; check your mailbox..",
                data: info.messageId
            }
        })
    } catch ( err ) {
        console.log(err)
    }
}

// RESET PASSWORD WITH OTP
exports.resetPassword = async (req, res) => {
    let {email, code, new_password} = req.body
    email = email ? email.trim() : null
    code = code ? code.trim() : null
    new_password = new_password ? new_password.trim() : null
    if ( !email ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "No email recieved; something went wrong..",
                code: 403
            }
        })
    }

    if ( !code || !password ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Please fill in the required fields",
                code: 403
            }
        })
    }

    try {
        let userCode = await recoverModel.findOne({email})
        if ( !userCode ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Email not found for reseting",
                    code: 403
                }
            })
        }

        if ( userCode.code !== code ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Invalid code",
                    code: 403
                }
            })
        }

        if ( password.length < 6 ) {
            return res.status(403).json({
                status: false,
                error: {
                    message: "Password length must be at least 6 characters",
                    code: 403
                }
            })
        }

        const user = await userModel.findOne({email}, {email: 1, password: 1})
        user.password = await bCrypt.hash(new_password, 12)
        user.save()

        await recoverModel.deleteMany({email}) // delete the user's reset request from db

        const token = jwt.sign({
            username: user.username,
            email
        }, JWT_KEY, {
            expiresIn: "1d"
        })

        return res.status(200).json({
            status: true,
            data: {
                message: "Password reset successfull",
                user,
                token
            }
        })
    } catch ( err ) {
        console.log(err)
    }
}

// EDIT PROFILE
exports.updateProfile = async (req, res) => {
    const _id = req.params.user_id
    let {full_name, birthday, city, sex, bio, image_url} = req.body
    fullname = full_name ? full_name.trim() : null
    birthday = birthday ? birthday.trim() : null
    city = city ? city.trim() : null
    sex = sex ? sex.trim() : null
    bio = bio ? bio.trim() : null
    image_url = image_url ? image_url.trim() : null
    if ( !_id ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "_id not recieved; something went wrong..",
                code: 403
            }
        })
    }

    if ( !full_name || !birthday || !city || !sex ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Please fill in the required fields",
                code: 403
            }
        })
    } else if ( full_name.length < 5 ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "Enter a valid name",
                code: 403
            }
        })
    }
    
    try {
        await userModel.updateOne({_id}, {$set: {
            full_name, birthday, city, sex, bio, image_url, updatedProfile: true
        }})

        return res.status(200).json({
            status: true,
            data: {
                message: "Profile updated successfully"
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

// FOLLOW OTHER USERS
exports.follow = async (req, res) => {
    const _id = req.params.user_id
    const {follow_list} = req.body

    if ( !_id ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "_id not recieved; something went wrong..",
                code: 403
            }
        })
    }

    if ( !follow_list || follow_list.constructor !== Array || !follow_list.length ) {
        return res.status(403).json({
            status: false,
            error: {
                message: "You have not selected any friend",
                code: 403
            }
        })
    }

    try {
        let user = await userModel.findOne({_id}, {followings: 1})
        let followings = []
        user.followings.map(val => {
            followings.push(val.user)
        })

        follow_list.map(async value => {
            if ( !followings.includes(value) ) { 
                await userModel.updateOne(
                    {_id},
                    {
                        $push: {
                            followings: {
                                user: value,
                                timeFollowed: Date.now()
                            }
                        }
                    }
                ) // update user's followings list

                await userModel.updateOne(
                    {_id: value},
                    {
                        $push: {
                            followers: {
                                user: _id,
                                timeFollowed: Date.now()
                            }
                        }
                    }
                ) // update followers list for the followed user
            }

        })

        return res.status(200).json({
            status: true,
            data: {
                message: "Following list updated"
            }
        })
    } catch (err){
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

exports.getUserById = async (req, res) => {
    const _id = req.params.user_id
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
        let user = await userModel.findOne({_id}, {password: 0})

        res.status(200).json({
            status: true,
            data: {
                message: "User Profile",
                user
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

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}