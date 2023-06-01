const express = require('express');

const urlCtrl=require('../controllers/urlController');


const router = express.Router();


router.post('/createURL',urlCtrl.createURL)

 
 
module.exports = router; 