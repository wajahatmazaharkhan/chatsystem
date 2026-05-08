const express = require("express");
const axios = require("axios");

const router = express.Router();

router.use(async (req, res) => {

    try {

        const response = await axios({
            method: req.method,
            url: `${process.env.ACTIVITY_SERVICE}${req.originalUrl}`,
            data: req.body,
            headers: req.headers
        });

        res.status(response.status).json(response.data);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Activity service unavailable"
        });

    }

});

module.exports = router;