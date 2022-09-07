const { Router } = require('express');

const jwt = require('../../middleware/jwt');

const router = Router();

const productController = require('../../controllers/productController.js');

router.get('/', jwt.checkAuthentication, productController.getProduct);

module.exports = router;

