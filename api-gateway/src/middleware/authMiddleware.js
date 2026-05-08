const axios = require("axios");

const authMiddleware = async (req, res, next) => {

    try {

        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const response = await axios.post(
            `${process.env.AUTH_SERVICE}/auth/validate`,
            {},
            {
                headers: {
                    Authorization: token
                }
            }
        );

        req.user = response.data;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });

    }

};

module.exports = authMiddleware;