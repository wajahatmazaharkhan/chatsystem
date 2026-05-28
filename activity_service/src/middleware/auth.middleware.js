const jwt = require('jsonwebtoken')
const axios = require('axios')

const authenticate = async (
    req,
    res,
    next
) => {

    try {

        const authHeader =  req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {

            const error = new Error('Missing or invalid Authorization header')

            error.statusCode = 401

            return next(error)
        }

        const token = authHeader.split(' ')[1]

        // Validate token using Auth Service
        const response = await axios.get(process.env.AUTH_VALIDATE_URL, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

        const user = response.data

        req.user = {
            user_id: user.user_id,
            role: user.role
        }

        next()

    } catch (err) {

        const error = new Error(
            'Invalid or expired token'
        )

        error.statusCode = 401

        next(error)
    }
}

const requireRole = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
           const error = new Error('Access denied: insufficient permissions')
           error.statusCode = 403

           return next(error)
        }
        next()
    }
}

module.exports = {
    authenticate,
    requireRole
}