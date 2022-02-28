const express = require('express');
const productsController = require('../controllers/productsController');

const router = express.Router();


router.get('/productCart', productsController.productCart);

router.get('/productDetail', productsController.productDetail);


module.exports = router;