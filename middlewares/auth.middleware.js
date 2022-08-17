const jwt = require("jsonwebtoken");

// auth middleware
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];

    if (token) {
        try {
            const decoded = await jwt.verify(token, process.env.APP_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            console.log(err);
            return res.status(401).send({ message: "Invalid Token" });
        }
    } else {
        return res.status(401).send({ message: "Unauthorized" });
    }
};

module.exports = { authMiddleware };
