const { DB } = require('../database');
const jwt = require('../middleware/jwt');
const utils = require('../utils');

const login = async (req, res) => {
    const { body } = req;
    if (!body.email) {
        res.status(200).send({status: 'Merci de renseigner le login'});
        return;
    }

    let [user] = await DB('users').where("email", body.email);
    if (!user) {
        res.status(200).send({status: 'login ou mot de passe incorrect'});
        return;
    }

    let veryfiedPwd = utils.verifyPwd(body.password, user.password_hash);
    if (!veryfiedPwd) {
        // isNotAuth
        res.status(200).send({status: 'login ou mot de passe incorrect'});
        return;
    }
    // implementation du JWT
    delete user.password_hash;
    let payload = {
        ...user,
        authenticated: true
    };
    let accessToken = jwt.generateAccessToken(payload);
    res.status(200).send({status: 'OK', accessToken: `Bearer ${accessToken}`});
};

module.exports = {
    login,
};