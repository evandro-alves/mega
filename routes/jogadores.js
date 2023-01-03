const model = require('../models/model.js');
const express = require('express');
const router = express.Router();
router.get('/:id(\\d+)',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    let usuarioId = req.session.idUsuario;    
    await model.query('select j.* from jogadores j inner join jogos jo on j.jogoId=jo.Id where j.Id=? and jo.UsuarioId=?'
        ,[req.params.id, usuarioId])
    .then((rows)=>{
        return res.send(200).json({data:[rows]});
    },(err)=>{
        return res.send(500).json({err:err});
    })
});
module.exports = router;