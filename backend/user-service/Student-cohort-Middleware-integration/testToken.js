// const { generateToken } = require("./backend/utils/jwt");

// const token = generateToken({
//     id: 1,
//     role: "admin"
// });

// console.log(token);



const { generateToken } = require("./backend/utils/jwt");

const token = generateToken({
    user_id: 1,
    email: "admin@test.com",
    role: "admin",
    is_active: true
});

console.log(token);