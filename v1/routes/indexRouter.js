const { Router } = require('express');

const jwt = require('../../middleware/jwt');
const utils = require('../../utils');

const v1ProductRouter = require('./productRouter');
const v1LoginRouter = require('./loginRouter');
const v1PanierRouter = require('./panierRouter.js');

const router = Router();

router.use('/login', v1LoginRouter);
router.use('/catalogue', v1ProductRouter);
router.use('/panier', v1PanierRouter);

router.get('/', async (req, res) => {
    res.status(200).send('API AIRWEB');
});


module.exports = router;
