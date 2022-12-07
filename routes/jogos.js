const express = require('express');
const router = express.Router();
router.get('/',(req,res,next)=>{
    res.render('jogos');
});
module.exports = router;