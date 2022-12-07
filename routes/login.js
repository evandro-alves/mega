const express = require('express');
const router = express.Router();
router.get('/',(req,res,next)=>{
    res.render('login');    
});
router.post('/',(req,res,next)=>{
    let message = '';
    try{
        res.redirect('/jogos');
    }
    catch(ex){
        message = ex;
    }
    res.render('login',{message:message});
});
module.exports = router;