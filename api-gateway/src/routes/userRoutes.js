const express = require("express");
const axios = require("axios");

const router = express.Router();

router.use(async (req, res) => {

    try {

        const response = await axios({
            method: req.method,
            url: `${process.env.USER_SERVICE}${req.originalUrl}`,
            data: req.body,
            headers: {
                Authorization: req.headers.authorization
            },
            timeout: 5000
        });

        res.status(response.status).json(response.data);

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "User service unavailable"
        });

    }

});

module.exports = router;