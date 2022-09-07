const { DB } = require('../database');

const basketUser = async (req, res) => {
    const { user } = req;
    if (!user) {
        res.status(200).json({status: 'KO', panier: []});
        return;
    }
    const panier = await DB('basket').where('user_id', user.id);
    res.status(200).json({status: 'OK', panier});
};

const addProductInBasket = async (req, res) => {
    const { body, user } = req;
    if (user && user.authenticated) {
        let [inTable] = await DB('basket').where({
            user_id: user.id,
            product_id: body.productId,
        });
        if (inTable) {
            await DB('basket').update({
                user_id: user.id,
                product_id: body.productId,
                quantity: body.quantity
            });
        } else {
            await DB('basket').insert({
                user_id: user.id,
                product_id: body.productId,
                quantity: body.quantity || 1
            });
        }
    }
    const panier = await DB('basket').select();
    res.status(200).json({status: 'OK', panier});
};

const updateBasket = async (req, res) => {
    const { body, user } = req;

    if (user && user.authenticated) {
        await DB('basket').insert({
            user_id: user.id,
            product_id: body.productId,
            quantity: body.quantity || 1
        });
    }
    const panier = await DB('basket').select();
    res.status(200).json({status: 'OK', panier});
};

module.exports = {
    basketUser,
    addProductInBasket,
    updateBasket
};