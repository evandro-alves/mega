process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const login = require('./routes/login');
const jogos = require('./routes/jogos');
const { networkInterfaces } = require('os');

const app = express();
app.listen(3000);


app.set('view engine', 'pug');
app.set('views', './views');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.get('/', (req,res, next)=>{    
    let concurso = '';
    if(req.query && req.query.concurso)
        concurso = req.query.concurso;
    try{
        fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${concurso}`,{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then((d)=>{
            d.json().then(d=>{            
                if(d.listaDezenas==null)
                    res.redirect('/');
                else{
                    res.render('index',{
                        title:'Resultados',
                        concurso:`Concurso ${d.numero}`,
                        concursoAnterior:d.numeroConcursoAnterior,
                        concursoPosterior:d.numeroConcursoProximo,
                        dataApuracao:`Data Apuracao ${d.dataApuracao}`,
                        numeros:d.listaDezenas,
                        autenticado:req.session.autenticado,
                        usuario:req.session.usuario
                    });
                }
            });
        });
    }
    catch{
    }  
});
app.use('/login', login);
app.use('/jogos', jogos);

// app.use((req, res, next) => {
//     res.render('404', {pageTitle: "Page Not Found"});
// });


module.exports = app;