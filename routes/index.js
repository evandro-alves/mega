
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.get('/', (req,res, next)=>{    
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
module.exports = router;