const model = require('../models/model.js');
const express = require('express');
const router = express.Router();
router.get('/',(req,res,next)=>{
    if(!req.session.autenticado)
        res.redirect('/login?return=/jogos');
    let usuarioId = req.session.idUsuario;    
    model.query(`select j.*, count(jo.id) as totalJogadores,count(a.id) as totalApostas
    from jogos j
    inner join jogadores jo on j.id=jo.jogoid
    inner join apostas a on j.id=a.jogoid
    where usuarioId=?
    group by j.id, j.concurso,j.usuarioid,j.datacriacao
    order by j.id desc;`
        ,[usuarioId])
    .then((rows)=>{
        res.render('jogos',{
            jogos:rows,
            autenticado:req.session.autenticado,
            usuario:req.session.usuario
        });
    })
});
router.get('/novo',(req,res)=>{
    if(!req.session.autenticado)
        res.redirect('/login?return=/jogos');
    res.render('novojogo',{
        jogo:{concurso:'', jogadores:[{nome:'',apostas:[{numeros:['','','','','','']}]}]},
        autenticado:req.session.autenticado,
        usuario:req.session.usuario});
});
router.post('/novo',async (req,res)=>{
    let message = '';
    if(!req.session.autenticado)
        res.redirect('/login?return=/jogos');
    try{
        let usuarioId = req.session.idUsuario;    
        let jogo = {UsuarioId:usuarioId, Concurso:req.body.concurso, DataCriacao:new Date()};
        await model.add('jogos',jogo)
        .then(async (jogo)=>{
                for(var jogador of req.body.jogadores){
                    await model.add('jogadores',{Nome:jogador.nome,JogoId:jogo.id})
                    .then(async (j)=>{                  
                        for(var aposta of jogador.apostas){
                            await model.add('apostas',{jogoId:jogo.id,jogadorId:j.id,numeros:aposta.numeros.join('-')})
                            .then((aposta)=>{
                            },(err)=>{
                                throw err;
                            });
                        }
                    },(err)=>{
                        throw err;
                    })                  
                }    
            res.redirect('/jogos');
        },(err)=>{throw err;});
    }catch(ex){
        message = ex;
        res.render('novojogo',{
            message:message, 
            autenticado:req.session.autenticado,
            usuario:req.session.usuario,
            jogo:req.body
        });
    }
});
module.exports = router;