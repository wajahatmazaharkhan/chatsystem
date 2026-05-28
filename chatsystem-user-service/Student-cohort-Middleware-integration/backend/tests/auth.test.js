// const request = require("supertest");

// const app = require("../server");

// const { generateToken } = require("../utils/jwt");

// describe("Auth API End-to-End Test", () => {

//     test("Should validate JWT token", async () => {

//         // Generate token
//         const token = generateToken({
//             id: 1,
//             role: "admin"
//         });

//         // Send request
//         const response = await request(app)
//             .get("/auth/validate")
//             .set("Authorization", token);

//         // Assertions
//         expect(response.statusCode).toBe(200);

//         expect(response.body.message)
//             .toBe("Token valid");

//         expect(response.body.user.role)
//             .toBe("admin");

//     });

// });







const request = require("supertest");

const app = require("../server");

const { generateToken } = require("../utils/jwt");

describe("Auth API End-to-End Test", () => {

    test("Should validate JWT token", async () => {

        const token = generateToken({
            user_id: 1,
            email: "admin@test.com",
            role: "admin",
            is_active: true
        });

        const response = await request(app)
            .get("/auth/validate")
            .set("Authorization", token);

        expect(response.statusCode).toBe(200);

        expect(response.body.valid).toBe(true);

        expect(response.body.role).toBe("admin");

        expect(response.body.is_active).toBe(true);

    });

});