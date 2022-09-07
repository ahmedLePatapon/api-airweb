const jwt = require('jsonwebtoken');
const { variables } = require('../config');

function generateAccessToken(payload) {
    return jwt.sign(payload, variables.ACCESS_TOKEN_SECRET, { expiresIn: variables.TTL_SESSION });
}

function checkAuthentication(req, res, next) {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];
    if (accessToken === null || accessToken === undefined) {
        // res.sendStatus(401);
        req.user = {
            authenticated: false
        };
        next();
        return;
    }
  
    jwt.verify(accessToken, variables.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        // res.sendStatus(401);
        req.user = {
            authenticated: false
        };
        next();
        return;
      }
      req.user = payload;
      next();
    });
}

module.exports = {
    generateAccessToken,
    checkAuthentication
};