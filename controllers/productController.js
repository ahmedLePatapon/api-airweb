const { DB } = require('../database');

const getProduct = async (req, res) => {
    let query = {
        visible_public: 1,
        visible_authenticated: 0
    };
    if (req.user.authenticated) {
        query = {
            visible_public: 0,
            visible_authenticated: 1
        };
    }
    const products = await DB('products').where(query);
    res.status(200).json({status: 'OK', products});
};

module.exports = {
    getProduct
};