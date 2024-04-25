//김선훈
const express = require('express');
const router = express.Router();
const {addLike,removeLike} = require('../controller/likesController');

router.use(express.json());

router.post('/:id',addLike);
router.delete('/:id',removeLike);

module.exports = router; 