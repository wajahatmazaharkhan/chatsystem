const users = [
    {
        user_id: "1",
        email: "admin@cohort.com",
        password: "admin123",
        role: "ADMIN"
    },
    {
        user_id: "2", 
        email: "manager@cohort.com",
        password: "manager123",
        role: "MANAGER"
    },
    {
        user_id: "3",
        email: "student@cohort.com",
        password: "student123",
        role: "STUDENT"
    }
];

function findUserByEmail(email) {
    return users.find(user => user.email === email);
}

module.exports = { findUserByEmail };