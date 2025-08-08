const jwt = require("jsonwebtoken")
const User = require("../models/User")
const helpers = require('../helpers/helpers')

const auth = async (req, res, next) => {
    const { authorization } = req.headers

    if(!authorization) {
        return res.status(401).json(helpers.responseError("Authorization must be required"))
    }

    try {
        const token = authorization.split(" ")[1]

        const { id, email, role } = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const name = await User.findById(id).select("name")
        const isExist = await User.findById(id)

        if(!isExist) {
            return res.status(401).json(helpers.responseError("Invalid Authorization"))
        }

        req.user = {
            id,
            name: name.name,
            email,
            role
        }

        // console.log(req.user)

        next()
    } catch (error) {
        return res.status(500).json(helpers.responseError(error.message))
    }
}

module.exports = auth