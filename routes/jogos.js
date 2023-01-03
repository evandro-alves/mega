const fetch = require('node-fetch');
const model = require('../models/model.js');
const express = require('express');
const router = express.Router();
const sqlListagemJogos = `select j.*,count(joa.id) as totalJogadores, sum(joa.totalApostas) as totalApostas
from jogos j
left join 
	(select jo.jogoid, jo.id, count(a.id) as totalApostas
		from jogadores jo
		left join apostas a on jo.id=a.JogadorId
		group by jo.jogoid,jo.id) joa on j.id=joa.jogoid
where j.usuarioId=?
group by j.id, j.concurso, j.usuarioid, j.datacriacao
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
                let response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${jogo.Concurso}`,{
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                await response.json().then(d=>{       
                    jogo.temResultado = (d.listaDezenas!=null); 
                    jogo.resultado =  d.listaDezenas;
                    jogo.dataApuracao = d.dataApuracao;                    
                });
                let message = null;
                if(req.query.a){
                    if(req.query.a=='e' && req.query.r=='0'){
                        message='Não foi possível excluir o Jogo';
                    }
                }
                return res.render('editarJogo',{
                    jogo:jogo,
                    autenticado:req.session.autenticado,
                    usuario:req.session.usuario,
                    message:message
                });
                // await model.query('select * from jogadores where jogoId=?',[jogo.Id])
                //     .then( async (jogadores)=>{
                //         if(!jogadores) jogadores=[];
                //         for(var jogador of jogadores){
                //             await model.query('select * from apostas where jogoid=? and jogadorid=?',[jogo.Id, jogador.Id])
                //                 .then((apostas)=>{
                //                     if(!apostas || apostas.length == 0) apostas = [{numeros:'',jogoId:jogo.Id,jogadorId:jogador.Id}];                                
                //                     jogador.apostas = apostas.map((a)=>{return {jogoId:a.jogoId,jogadorId:a.jogadorId,numeros:a.numeros.split(',')}});
                //                 },(err)=>{
                //                     return res.sendStatus(500);
                //                 });
                //         }
                //         if(jogadores.length==0) jogadores.push({nome:'',jogoId:jogo.Id,apostas:[]});
                //         let message=null;
                //         if(req.query.a){
                //             if(req.query.a=='e' && req.query.r=='0'){
                //                 message='Não foi possível excluir o Jogo';
                //             }
                //         }
                //         return res.render('editarJogo',{
                //             jogo:jogo,
                //             jogadores:jogadores,
                //             autenticado:req.session.autenticado,
                //             usuario:req.session.usuario,
                //             message:message
                //         });
                //     },(err)=>{
                //         return res.sendStatus(500);
                //     });                    
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
router.post('/:jogoId(\\d+)/jogador/salvar',async (req,res)=>{
    if(!req.session.autenticado)
        return res.sendStatus(403);

   try{
        let usuarioId = req.session.idUsuario;
        let jogo = await model.get('jogos', req.params.jogoId)
            .then((jogo)=>{
                return jogo;
            });
        if(!jogo || jogo.UsuarioId != usuarioId)
            throw 'Não foi possível adicionar o Jogador';
        
        const jogador = {Nome:req.body.nome, JogoId:jogo.Id};
        if(req.body.Id){
            await model.update('jogadores',req.body.Id,jogador)
            .then((jogador)=>{
                return res.status(202).json({data:[jogador]});
            },(err)=>{throw err; });            
        }else{
            await model.add('jogadores',jogador)
            .then((jogador)=>{
                return res.status(201).json({data:[jogador]});
            },(err)=>{throw 'Não foi possível adicionar o Jogador'; });            
        }
   }catch(ex)
   {
        return res.status(500).json({err:ex});
   }
});
router.get('/:jogoId(\\d+)/jogadores',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    try{
        let usuarioId = req.session.idUsuario;
        await model.query(`select j.* from jogadores j 
        inner join jogos jo on j.jogoId=jo.Id 
        where j.jogoId=? and jo.UsuarioId=?`
            ,[req.params.jogoId, usuarioId])
            .then((rows)=>{
                return res.status(200).json({data:rows});
            },(err)=>{
               throw err;
            });
    }catch(ex){
        return res.status(500).json({err:ex});
    }   
});
router.get('/:jogoId(\\d+)/apostas',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    try{
        let usuarioId = req.session.idUsuario;
        await model.query(`SELECT a.* FROM mega.apostas a
            inner join mega.jogos j on a.jogoId = j.id
            where a.JogoId=? and j.UsuarioId=?`
            ,[req.params.jogoId, usuarioId])
            .then((rows)=>{
                return res.status(200).json({data:rows});
            },(err)=>{
               throw err;
            });
    }catch(ex){
        return res.status(500).json({err:ex});
    }   
});

router.post('/:jogoId(\\d+)/apostas/salvar',async (req,res)=>{
    if(!req.session.autenticado)
        return res.sendStatus(403);
   try{
        let usuarioId = req.session.idUsuario;
        let jogo = await model.get('jogos', req.params.jogoId)
            .then((jogo)=>{
                return jogo;
            });
        if(!jogo || jogo.UsuarioId != usuarioId)
            throw 'Não foi possível adicionar a aposta';
        
        const aposta = 
        {
            JogadorId:req.body.JogadorId,
            JogoId:jogo.Id,
            Numeros:req.body.Numeros
        }
        if(req.body.Id && req.body.Id > 0){
            await model.update('apostas',req.body.Id,aposta)
            .then((aposta)=>{
                return res.status(202).json({data:[aposta]});
            },(err)=>{throw 'Não foi possível adicionar a aposta'; });            
        }else{
            await model.add('apostas',aposta)
            .then((aposta)=>{
                return res.status(201).json({data:[aposta]});
            },(err)=>{
                throw 'Não foi possível adicionar a aposta'; 
            });            
        }
   }catch(ex)
   {
        return res.status(500).json({err:ex});
   }
});
router.post('/novo',async (req,res)=>{
    let message = '';
    if(!req.session.autenticado)
        return res.statusCode(401);
    try{
        let usuarioId = req.session.idUsuario;
        let jogo = {UsuarioId:usuarioId, Concurso:req.body.concurso, DataCriacao:new Date()};
        let jogoConcursoExiste = await model.query('select * from jogos where usuarioid=? and concurso=?',[jogo.UsuarioId,jogo.Concurso])
            .then((rows)=>rows && rows.length > 0,(err)=>{ throw err;});
        if(jogoConcursoExiste)
            throw `O Concurso ${jogo.Concurso} já existe.`;
        await model.add('jogos',jogo)
        .then((jogo)=>{
            return res.status(201).json({data:[jogo]});
        },(err)=>{throw 'Não foi possível adicionar o concurso'; });
    }catch(ex){
        return res.status(500).json({err: ex.message? 'Erro ao salvar concurso':ex});
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