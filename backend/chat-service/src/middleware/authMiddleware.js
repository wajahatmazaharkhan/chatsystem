const axios = require('axios')

// NOTE: During development, JWT is verified locally.
// For integration with Module 1 (Auth), swap this out with the axios call to /auth/validate.
const validateAuth = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization

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
            user_id:user.user_id,
            name: user.name,
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
};

module.exports = validateAuth;