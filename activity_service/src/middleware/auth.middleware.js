const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {

    // TEMP DEV MODE
    if (
        process.env.NODE_ENV === 'development'
    ) {

        req.user = {
            user_id: '6819d1a2b3c4d5e6f7a8b9c1',
            role: 'ADMIN'
        }

        return next()
    }

    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Missing or invalid Authorization header')
        error.statusCode = 401
        
        return next(error)
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
            user_id: decoded.id,
            role: decoded.role
        }

        next()

    } catch (err) {
        const error = new Error('Invalid or expired token')
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