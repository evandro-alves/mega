const model = require('../models/model');
const hasher = require('../models/hasher');
const express = require('express');
const path = require('path');
const router = express.Router();
router.get('/',(req,res,)=>{
    return res.render('login',{page:((req.query && req.query.return)?req.query.return:'')});    
});
router.post('/',async (req,res)=>{
    let message = '';    
	let email = req.body.email;
	let senha = req.body.senha;
    try{        
        if(!email || !senha)
            throw 'O E-mail e a senha não podem estar vazios.';    
        await model.query('select * from usuarios where email=?',[email])
        .then((rows)=>{
            if(!rows || rows.length == 0){
                throw 'E-mail ou senha inválidos';
            }
            let hash = hasher.generate(senha, rows[0].salt);
            if(hash.hashedpassword!=rows[0].senha){
                throw 'E-mail ou senha inválidos';
            }
            req.session.autenticado = true;
            req.session.usuario = rows[0].nome;
            req.session.idUsuario = rows[0].id;
            if(req.query.return && req.query.return.indexOf('/')==0)
                return res.redirect(req.query.return);
            else
                return res.redirect('/');              
        },(err)=>{
            throw err;
        });
    }
    catch(ex){
        res.render('login',{email:email,senha:senha, message:ex});
    }
});
router.get('/sair',(req,res,next)=>{
    req.session.destroy(()=>{
        res.redirect('/');
    });
});
router.get('/cadastrar',(req,res,next)=>{
    res.render('cadastrar');    
});
router.post('/cadastrar',(req,res,next)=>{
    let message = '';    
	let email = req.body.email;
	let nome = req.body.nome;
	let senha = req.body.senha;
    try{        
        if(!email || !senha || !nome)
            throw 'O E-mail, o nome e a senha devem ser preenchidos.';    
        model.query('select * from usuarios where email=?',[email])
        .then((rows)=>{
            if(rows && rows.length > 0){
                throw 'E-mail já cadastrado.';
            }
            let hash = hasher.generate(senha,hasher.generateSalt(12));
            let senhaHash= hash.hashedpassword;
            let salt = hash.salt;
            let novoUsuario ={email:email,nome:nome,senha:senhaHash,salt:salt,dataCriacao:new Date()};
            model.add('usuarios', novoUsuario)
            .then((usuario)=>{
                req.session.autenticado = true;
                req.session.usuario = usuario.nome;
                req.session.idUsuario = usuario.id;
                return res.redirect('/');
            },(rej)=>{ throw rej;});
        },(err)=>{
            throw err;
        });
    }
    catch(ex){
        res.render('cadastrar',{email:email,nome:nome,senha:senha,message:ex});
    }
});
router.get('/perfil',async (req,res)=>{
    if(!req.session.autenticado)
        return res.redirect('/login?return=/jogos');
    try{
        let usuario = await model.query('select * from usuarios where id=? limit 1',[req.session.idUsuario])
            .then((rows)=> rows && rows.length>0? rows[0]:null, (ex)=>{throw ex;});
        if(!usuario) return res.statusCode(404);
        return res.render('perfil',{usuario:usuario});
    }catch(ex){
        return res.redirect('/');
    }
});
module.exports = router;