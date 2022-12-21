const model = require('../models/model.js');
const express = require('express');
const router = express.Router();
const sqlListagemJogos = `select j.*, count(jo.id) as totalJogadores,count(a.id) as totalApostas
from jogos j
left join jogadores jo on j.id=jo.jogoid
left join apostas a on j.id=a.jogoid
where usuarioId=?
group by j.id, j.concurso,j.usuarioid,j.datacriacao
order by j.concurso desc;`;
router.get('/',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    let usuarioId = req.session.idUsuario;    
    await model.query(sqlListagemJogos
        ,[usuarioId])
    .then((rows)=>{
        return res.render('jogos',{
            jogos:[],
            autenticado:req.session.autenticado,
            usuario:req.session.usuario
        });
    })
});
router.get('/listagem',async (req,res)=>{
    if(!req.session.autenticado){
        return res.redirect('/login?return=/jogos'); 
    }
    try{
        let usuarioId = req.session.idUsuario;
        await model.query(sqlListagemJogos,[usuarioId])
        .then((rows)=>{
            return  res.status(200).json({data:rows});
        },(err)=>{throw 'Não foi possível recuperar os jogos'; });
    }catch(ex){
        return res.status(500).json({err:ex});
    }
});
router.get('/:jogoId(\\d+)',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect(`/login?return=/jogos/${((req.params && req.params.jogoId)?req.params.jogoId:'')}`);
    try{
        await model.get('jogos',req.params.jogoId)
            .then(async (jogo)=>{
                if(!jogo || jogo.length == 0 || jogo.UsuarioId!=req.session.idUsuario){
                    return res.sendStatus(404);
                }
                await model.query('select * from jogadores where jogoId=?',[jogo.Id])
                    .then( async (jogadores)=>{
                        if(!jogadores) jogadores=[];
                        for(var jogador of jogadores){
                            await model.query('select * from apostas where jogoid=? and jogadorid=?',[jogo.Id, jogador])
                                .then((apostas)=>{
                                    if(!apostas) apostas = [{numeros:[],jogoId:jogo.Id,jogadorId:jogador.Id}];                                
                                    jogador.apostas = apostas.map((a)=>{return {jogoId:a.jogoId,jogadorId:a.jogadorId,numeros:a.numeros.split(',')}});
                                },(err)=>{
                                    return res.sendStatus(500);
                                });
                        }
                        if(jogadores.length==0) jogadores.push({nome:'',jogoId:jogo.Id,apostas:[]});
                        let message=null;
                        if(req.query.a){
                            if(req.query.a=='e' && req.query.r=='0'){
                                message='Não foi possível excluir o Jogo';
                            }
                        }
                        return res.render('editarJogo',{
                            jogo:jogo,
                            jogadores:jogadores,
                            autenticado:req.session.autenticado,
                            usuario:req.session.usuario,
                            message:message
                        });
                    },(err)=>{
                        return res.sendStatus(500);
                    });                    
            },(err)=>{
                return res.sendStatus(500);
            });
    }catch(ex){
        return res.redirect('/jogos');
    }
});
router.post('/:jogoId(\\d+)/excluir',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect(`/login?return=/jogos/${((req.params && req.params.jogoId)?req.params.jogoId:'')}`);    
    try{
        await model.get('jogos',req.params.jogoId)
        .then(async (jogo)=>{          
            if(!jogo || jogo.length == 0 || jogo.UsuarioId!=req.session.idUsuario){
                return res.sendStatus(404);
            };
            await model.remove('jogos',req.params.jogoId)
            .then((affectedRows)=>{
                if(affectedRows > 0){
                    return res.redirect('/jogos');
                }else{
                    return res.redirect(`/jogos/${req.params.jogoId}?a=e&r=0`);
                }
            },(rej)=> {
                throw rej;
            })
        });
    }catch(ex)
    {
        return res.redirect('/jogos');
    }
    
        
});
// router.get('/novo',(req,res)=>{
//     if(!req.session.autenticado)
//         return res.redirect('/login?return=/jogos');
//     return res.render('novojogo',{
//         jogo:{concurso:'', jogadores:[{nome:'',apostas:[{numeros:['','','','','','']}]}]},
//         autenticado:req.session.autenticado,
//         usuario:req.session.usuario});
// });
router.post('/novo',async (req,res)=>{
    let message = '';
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    try{
        let usuarioId = req.session.idUsuario;
        let jogo = {UsuarioId:usuarioId, Concurso:req.body.concurso, DataCriacao:new Date()};
        await model.add('jogos',jogo)
        .then((jogo)=>{
            return res.status(201).json({data:[jogo]});
        },(err)=>{throw 'Não foi possível adicionar o concurso'; });
    }catch(ex){
        return res.status(500).json({err:ex});
    }
    // try{
    //     let usuarioId = req.session.idUsuario;    
    //     let jogo = {UsuarioId:usuarioId, Concurso:req.body.concurso, DataCriacao:new Date()};
    //     await model.add('jogos',jogo)
    //     .then(async (jogo)=>{
    //             for(var jogador of req.body.jogadores){
    //                 await model.add('jogadores',{Nome:jogador.nome,JogoId:jogo.id})
    //                 .then(async (j)=>{                  
    //                     for(var aposta of jogador.apostas){
    //                         await model.add('apostas',{jogoId:jogo.id,jogadorId:j.id,numeros:aposta.numeros.join('-')})
    //                         .then((aposta)=>{
    //                         },(err)=>{
    //                             throw err;
    //                         });
    //                     }
    //                 },(err)=>{
    //                     throw err;
    //                 })                  
    //             }    
    //         res.redirect('/jogos');
    //     },(err)=>{throw err;});
    // }catch(ex){
    //     message = ex;
    //     res.render('novojogo',{
    //         message:message, 
    //         autenticado:req.session.autenticado,
    //         usuario:req.session.usuario,
    //         jogo:req.body
    //     });
    // }
});
module.exports = router;