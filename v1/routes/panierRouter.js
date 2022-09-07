const { Router } = require('express');

const jwt = require('../../middleware/jwt');

const router = Router();

const panierController = require('../../controllers/panierController.js');

router.get('/', jwt.checkAuthentication, panierController.basketUser);

router.put('/', jwt.checkAuthentication, panierController.addProductInBasket);

router.patch('/', jwt.checkAuthentication, panierController.updateBasket);

module.exports = router;