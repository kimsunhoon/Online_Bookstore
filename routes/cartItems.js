const express = require('express');
const router = express.Router();
const {addCart, getCartItems, removeCartItems} = require('../controller/cartItemsController');

router.use(express.json());

router.post('/',addCart);
router.get('/',getCartItems);
router.delete('/:id',removeCartItems);

module.exports = router;