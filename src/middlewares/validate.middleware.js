const { validationResult } = require("express-validator")
const helpers = require('../helpers/helpers')

const validate = (req, res, next) => {
    try {
        const result = validationResult(req);

        if(!result.isEmpty()) {
            const errors = result.array().map(e => e.msg)
            return res.status(400).json(helpers.responseError("Validation failed", errors))
        }

        next()
    } catch(error) {
        throw res.status(500).json(helpers.responseError(error.message))
    }
}

module.exports = validate