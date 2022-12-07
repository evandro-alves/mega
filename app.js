process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// const index = require('./routes/index');
// const login = require('./routes/login');
// const jogos = require('./routes/jogos');
// const { networkInterfaces } = require('os');

const app = express();

pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mega'
});

app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
// app.use('/login', login);
// app.use('/jogos', jogos);
// app.use('/home', index);


app.get('/', (req,res)=>{    
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
                        numeros:d.listaDezenas
                    });
                }
            });
        });
    }
    catch{
    }  
});
app.get('/jogos',(req,res,next)=>{
    res.render('jogos');
});
app.get('/login',(req,res,next)=>{
    res.render('login');    
});
app.post('/login',(req,res,next)=>{
    let message = '';
    try{
        res.redirect('/jogos');
    }
    catch(ex){
        message = ex;
    }
    res.render('login',{message:message});
});

app.listen(3000);