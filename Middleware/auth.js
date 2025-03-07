const basicAuth = require("basic-auth");
const config = require("../config");

module.exports = (req, res, next) => {
    const user = basicAuth(req);

    if (!user || user.name !== config.BASIC_AUTH_USER || user.pass !== config.BASIC_AUTH_PASS) {
        res.set("WWW-Authenticate", 'Basic realm="401"');
        return res.status(401).json({ message: "Nieautoryzowany" });
    }

    next();
};
