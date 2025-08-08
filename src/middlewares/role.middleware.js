const helpers = require('../helpers/helpers')

const role = (roles) => {
    return async (req, res, next) => {
        try {
            for (const role of roles) {
                if(req.user.role === role) {
                    next();
                    return;
                }
            }
            
            return res.status(401).json(helpers.responseError("You can not access to this action"))
        } catch (error) {
            res.status(500).json(helpers.responseError(error.message))
        }
    }
}

module.exports = role