const { Router } = require('express');
const knex = require('knex');

const jwt = require('../../middleware/jwt');
const utils = require('../../utils');

const DB = knex({
    client: 'sqlite3',
    connection: {
      filename: "./DATABASE.sqlite"
    },
    useNullAsDefault: true
});

DB.schema.hasTable('basket').then(function(exists) {
    if (!exists) {
        return DB.schema.createTable('basket', function(table) {
            table.increments('id').primary();
            table.string('user_id', 100);
            table.integer('product_id', 10);
            table.integer('quantity', 100);
            table.timestamps();
        });
    }
});

const v1ProductRouter = require('./productRouter');
const v1LoginRouter = require('./loginRouter');

const router = Router();

// router.use('/catalogue', v1ProductRouter);
// router.use('/login', v1LoginRouter);

router.post('/login', async (req, res) => {
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
});

router.get('/catalogue', jwt.checkAuthentication, async (req, res) => {
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
});

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
