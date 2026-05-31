// const jwt = require("jsonwebtoken");
// const { SECRET } = require("../utils/jwt");

// const validateUser = (req, res) => {

//     const token = req.headers.authorization;

//     if (!token) {
//         return res.status(401).json({
//             message: "Token missing"
//         });
//     }

//     try {

//         const decoded = jwt.verify(token, SECRET);

//         return res.status(200).json({
//             message: "Token valid",
//             user: decoded
//         });

//     } catch (error) {

//         return res.status(401).json({
//             message: "Invalid token"
//         });
//     }
// };

// module.exports = {
//     validateUser
// };










const jwt = require("jsonwebtoken");

const { SECRET } = require("../utils/jwt");

const validateUser = (req, res) => {

    let token = req.headers.authorization;
    if (token && token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7).trim();
    }

    if (!token) {

        return res.status(401).json({
            valid: false,
            error: "Token missing"
        });

    }

    try {

        const decoded = jwt.verify(token, SECRET);

        return res.status(200).json({
            valid: true,
            user_id: decoded.user_id,
            email: decoded.email,
            role: decoded.role,
            is_active: decoded.is_active
        });

    } catch (error) {

        return res.status(401).json({
            valid: false,
            error: "Invalid token"
        });

    }

};

module.exports = {
    validateUser
};