// const jwt = require("jsonwebtoken");

// const SECRET = "mysecretkey";

// const generateToken = (user) => {
//     return jwt.sign(
//         {
//             id: user.id,
//             role: user.role
//         },
//         SECRET,
//         {
//             expiresIn: "1h"
//         }
//     );
// };

// module.exports = {
//     generateToken,
//     SECRET
// };





const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

const generateToken = (user) => {

    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            is_active: user.is_active
        },
        SECRET,
        {
            expiresIn: "1h"
        }
    );
};

module.exports = {
    generateToken,
    SECRET
};