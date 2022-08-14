require("dotenv").config();
const jwt = require("jsonwebtoken");

const getToken = function (data) {
    let jwtSecretKey = process.env.APP_SECRET;
    const token = jwt.sign(data, jwtSecretKey);
    return token;
};


module.exports = { getToken };
