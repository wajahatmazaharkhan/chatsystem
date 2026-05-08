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
            }
        });

        res.status(response.status).json(response.data);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "User service unavailable"
        });

    }

});

module.exports = router;