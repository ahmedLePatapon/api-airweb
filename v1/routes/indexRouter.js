const { Router } = require('express');

const jwt = require('../../middleware/jwt');
const utils = require('../../utils');

const v1ProductRouter = require('./productRouter');
const v1LoginRouter = require('./loginRouter');

const router = Router();

router.use('/login', v1LoginRouter);
router.use('/catalogue', v1ProductRouter);


router.get('/panier', jwt.checkAuthentication, async (req, res) => {
    const { user } = req;
    if (user) {
        res.status(200).json({status: 'KO', panier: []});
        return;
    }
    const panier = await DB('basket').where('user_id', user.id);
    res.status(200).json({status: 'OK', panier});
});

router.put('/panier', jwt.checkAuthentication, async (req, res) => {
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
});

router.patch('/panier', jwt.checkAuthentication, async (req, res) => {
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
});

router.get('/', async (req, res) => {
    res.status(200).send('API AIRWEB');
});


module.exports = router;
