const model = require('../models/model');
const express = require('express');
const path = require('path');
const router = express.Router();
router.get('/',(req,res,next)=>{
    res.render('login');    
});
router.post('/',async (req,res,next)=>{
    let message = '';    
	let email = req.body.email;
	let senha = req.body.senha;
    try{        
        if(!email || !senha)
            throw 'O E-mail e a senha não podem estar vazios.';    
        await model.query('select * from usuarios where email=? and senha=?',[email,senha])
        .then((rows)=>{
            if(!rows || rows.length == 0){
                throw 'E-mail ou senha inválidos';
            }
            req.session.autenticado = true;
            req.session.usuario = rows[0].nome;
            req.session.idUsuario = rows[0].id;
            if(req.query.return)
                res.redirect(path.join(__dirname,req.query.return));
            else
                res.redirect('/');              
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
            model.add('usuarios',{email:email,nome:nome,senha:senha})
            .then((usuario)=>{
                req.session.autenticado = true;
                req.session.usuario = usuario.nome;
                req.session.idUsuario = usuario.id;
                res.redirect('/');
            },(rej)=>{ throw rej;});
        },(err)=>{
            throw err;
        });
    }
    catch(ex){
        res.render('cadastrar',{email:email,nome:nome,senha:senha,message:ex});
    }
});
module.exports = router;