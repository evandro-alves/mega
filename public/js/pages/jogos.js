const jogos = (()=>{
    let ajax = {};
    ajax.AdicionarJogo =  (async (jogo)=>{
        return fetch('../jogos/novo',{
            method:'POST',
            body:JSON.stringify(jogo),
            headers:{                
                'Content-Type':'application/json'
            }
        });
    });
    ajax.AdicionarAposta =  (async (aposta)=>{
        return fetch(`../jogos/${aposta.JogoId}/apostas/salvar`,{
            method:'POST',
            body:JSON.stringify(aposta),
            headers:{                
                'Content-Type':'application/json'
            }
        });
    });
    ajax.getJogos= async ()=>{
        return await fetch('/jogos/listagem',{
            method:'GET',
            headers:{                
                'Content-Type':'application/json'
            }
        }).then((res)=>{
            if(res.status!=200) return null;
                return res.json().then((json)=>{
                    return json.data;
                });
        })
        .catch((rej)=>{
            return null;
        });
    };
    ajax.AdicionarJogador=(async jogador=>{
        return fetch(`../jogos/${jogador.jogoId}/jogador/salvar`,{
            method:'POST',
            body:JSON.stringify(jogador),
            headers:{                
                'Content-Type':'application/json'
            }
        });
    });
    ajax.getJogadores = (async jogoId=>{
        return fetch(`../jogos/${jogoId}/jogadores`,{
            method:'GET',
            headers:{                
                'Content-Type':'application/json'
            }
        }).then((res)=>{
            if(res.status!=200) return null;
                return res.json().then((json)=>{
                    return json.data;
                });
        })
        .catch((rej)=>{
            return [];
        });
    });
    ajax.getApostas = (async jogoId=>{
        return fetch(`../jogos/${jogoId}/apostas`,{
            method:'GET',
            headers:{                
                'Content-Type':'application/json'
            }
        }).then((res)=>{
            if(res.status!=200) return null;
                return res.json().then((json)=>{
                    return json.data;
                });
        })
        .catch((rej)=>{
            return [];
        });
    });
    let draw = {};
    draw.marcaAcertos = (elementsApostas=>{
        if(evt.resultados && evt.resultados.length>0 
            && elementsApostas && elementsApostas.length>0){
            for(let el of elementsApostas){
                if(evt.resultados.findIndex(r=>r == parseInt(el.textContent))>=0){
                    el.classList.add('bg-success','text-light');
                }
            }     
        }
    });
    draw.montarApostas = (apostas=>{
        let divApostas = document.createElement('div');
        divApostas.classList.add('row','apostas','mt-1','ms-1');
        let h5Apostas = document.createElement('h5');
        h5Apostas.textContent ='Apostas';
        divApostas.append(h5Apostas);
        if(apostas && apostas.length > 0){
            // for(let i = 1; i<=60; i++){
            //     let num = document.createElement('div');
            //     num.classList.add('ps-2','pe-2','pt-1','pb-1','border','rounded-circle')
            //     num.textContent = i;
            //     if(apostas.findIndex((ap)=>ap.Numeros.split(',').indexOf(i.toString())>=0)>=0){
            //         num.classList.add('selecionado');
            //     }
            //     div.append(num);
            // }
            for(var aposta of apostas){
                const col = document.createElement('div');
                col.classList.add('col-6','mb-3','pe-2');
                const div = document.createElement('div');
                div.classList.add('d-flex','justify-content-center');
                col.append(div);
                let numeros = aposta.Numeros.split(',');
                let apostasEls = [];
                for(var numero of numeros){
                    let num = document.createElement('div');
                    num.classList.add('ps-2','pe-2','pb-1','pt-1','me-1','border','rounded-circle')
                    num.textContent = parseInt(numero).toLocaleString('pt-BR',{minimumIntegerDigits:2});               
                    apostasEls.push(num);
                    div.append(num);
                }
                draw.marcaAcertos(apostasEls);
                divApostas.append(col);
            }
        }        
        return divApostas;
    });
    draw.montarJogadores = (async (jogoId,jogadores)=>{
        var jogadoresContainer = document.querySelector('#jogadores');
        jogadoresContainer.innerHTML='';
        if(!jogadores || jogadores.length == 0){
            let msg = document.createElement('div');
            msg.textContent='Não há jogadores neste jogo.';         
            msg.classList.add('p-4');   
            jogadoresContainer.append(msg);
        }else{
            const apostas =await evt.carregarApostas(jogoId);
            for(var jogador of jogadores){
                let divMain = document.createElement('div');
                divMain.classList.add('col-6','mb-2');
                let divRow = document.createElement('div');
                divRow.classList.add('row');
                
                let divCol = document.createElement('div');
                divCol.classList.add('col-12','input-group')
                let label = document.createElement('span');
                label.classList.add('input-group-text');
                label.textContent='Nome';
                divCol.append(label);
                let input =document.createElement('input');
                input.setAttribute('type','text');
                input.setAttribute('readonly',true);
                input.classList.add('form-control');
                input.value=jogador.Nome;
                divCol.append(input);
                divRow.append(divCol);            

                let btnEditar = document.createElement('button');
                btnEditar.classList.add('btn','btn-primary','align-self-baseline');
                btnEditar.setAttribute('type','button');
                btnEditar.setAttribute('data-bs-toggle','modal');
                btnEditar.setAttribute('data-bs-target','#modalJogador');
                btnEditar.setAttribute('data-bs-jogadorId',jogador.Id);
                btnEditar.setAttribute('data-bs-Nome',jogador.Nome);
                btnEditar.textContent = ' Editar';
                let icoEditar = document.createElement('i');
                icoEditar.classList.add('fas','fa-pencil');                
                btnEditar.prepend(icoEditar);
                divCol.append(btnEditar);

                let btnAddAposta = document.createElement('button');
                btnAddAposta.classList.add('btn','btn-primary','align-self-baseline');
                btnAddAposta.setAttribute('type','button');
                btnAddAposta.setAttribute('data-bs-toggle','modal');
                btnAddAposta.setAttribute('data-bs-target','#modalAposta');
                btnAddAposta.setAttribute('data-bs-jogadorId',jogador.Id);
                btnAddAposta.setAttribute('data-bs-jogoId',jogador.JogoId);
                btnAddAposta.setAttribute('data-bs-nome',jogador.Nome);
                btnAddAposta.setAttribute('data-bs-apostaId','0');
                btnAddAposta.textContent = ' Aposta';
                let icoAddAposta = document.createElement('i');
                icoAddAposta.classList.add('fas','fa-plus');                
                btnAddAposta.prepend(icoAddAposta);
                divCol.append(btnAddAposta);

                divRow.append(draw.montarApostas(apostas.filter(a=>a.JogadorId==jogador.Id)));
                divMain.append(divRow);
                jogadoresContainer.append(divMain);       
            }
        }
    });
    let evt = {};
    evt.resultados = [];
    evt.carregarApostas=(async(jogoId)=>{
        return await ajax.getApostas(jogoId)
            .then((apostas)=> {
                return apostas;
            });
    });
    evt.CarregarJogadores=(async (jogoId)=>{
        await ajax.getJogadores(jogoId)
        .then((jogadores)=>draw.montarJogadores(jogoId, jogadores));
    });
    evt.showLoading = ()=>{
        document.querySelector('.loading').classList.remove('d-none');
    };
    evt.hideLoading = ()=>{
        document.querySelector('.loading').classList.add('d-none');
    };
    evt.clearRows=()=>{
        var rows = document.querySelector('.tabela-jogos').tBodies[0].rows
        if(rows)
            document.querySelector('.table').tBodies[0].innerHTML = '';
    }
    evt.adicionaLinhaSemJogos = ()=>{
        let tabelaJogos = document.querySelector('.tabela-jogos');
        let row = tabelaJogos.tBodies[0].insertRow();
        let td = row.insertCell();
        td.setAttribute('colspan','5');
        td.classList.add('text-center','bold');
        td.textContent = 'Não há Jogos para exibir!';
    }
    evt.adicionaLinha=(tabelaJogos, jogo)=>{
        let row = tabelaJogos.tBodies[0].insertRow();        
        row.insertCell().textContent = jogo.Concurso;
        row.insertCell().textContent = new Date(jogo.DataCriacao).toLocaleDateString();
        row.insertCell().textContent = jogo.totalJogadores;
        row.insertCell().textContent = jogo.totalApostas;
        let buttonsCell = row.insertCell();
        let link = document.createElement('a');
        link.href=`/jogos/${jogo.Id}`;
        link.classList.add('btn','btn-primary');
        let i = document.createElement('i');
        i.classList.add('fas','fa-pencil','fa-fw')        
        link.textContent=' Detalhes';
        link.prepend(i);
        buttonsCell.append(link);
    };
    evt.carregaTabela =async ()=>{
        let tabela = document.querySelector('.tabela-jogos');
        evt.showLoading();
        evt.clearRows();
        let jogos = await ajax.getJogos();
        if(!jogos) {
            evt.adicionaLinhaSemJogos();
            evt.hideLoading();
            return;
        }
        for(var j of jogos){
            evt.adicionaLinha(tabela, j);
        }
        evt.hideLoading();
    };
    evt.frmApostaSubmit=(async (e)=>{
        e.preventDefault();
        let numeros = [];
        e.target.querySelectorAll('.numeros').forEach(el => {
            if(el && el.value && el.value!=''){
                numeros.push(el.value);
            }
        });
        if(numeros.length < 6){
            evt.addMensagem(document.getElementById('modalAposta'), 'danger','Todos os Números da aposta devem ser preenchidos');
            return false;
        }
        let aposta = {
            Id:e.target.apostaId.value,
            JogadorId:e.target.jogadorId.value,
            JogoId:e.target.jogoId.value,
            Numeros:numeros.join(',')
        };
        await ajax.AdicionarAposta(aposta)
            .then(async (res)=>{
                if(res.status!=200 && res.status!=201 && res.status!=202){                    
                    res.json().then((data)=>{
                        evt.addMensagem(document.getElementById('modalAposta'),'danger',data.err);
                    });
                    return;
                }
                await evt.CarregarJogadores(e.target.jogoId.value);
            })
            .catch((rej)=>{
                evt.addMensagem(document.getElementById('modalAposta'),'danger','Erro ao salvar o Jogo');
            });
        return false;
    });
    evt.frmNovoConcursoSubmit=(async (e)=>{
        e.preventDefault();
        let concurso = e.target.concurso.value;
        await ajax.AdicionarJogo({concurso: e.target.concurso.value})
            .then(async (res)=>{
                if(res.status!=200 && res.status!=201 && res.status!=202){                    
                    res.json().then((data)=>{
                        evt.addMensagem(document.getElementById('modalJogo'),'danger',data.err);
                    });
                    return;
                }
                evt.addMensagem(document.getElementById('modalJogo'),'success',` Jogo Concurso ${concurso} salvo com sucesso!`);
                // setTimeout(()=>{
                //     document.querySelector('.btn-fechar-modal').click();
                // },2000);
                e.target.concurso.value = '';
                await evt.carregaTabela();
            })
            .catch((rej)=>{
                evt.addMensagem(document.getElementById('modalJogo'),'danger','Erro ao salvar o Jogo');
            });
        return false;
    });
    evt.frmNovoJogadorSubmit = (async (e)=>{
        e.preventDefault();
        if(e.target.nomeJogador && (!e.target.nomeJogador.value || e.target.nomeJogador.value==' ')){
            evt.addMensagem(document.getElementById('modalJogador'),'danger','O Nome do Jogador deve ser preenchido.');
            return false;
        }
        const jogador = {
            Id:e.target.jogadorId.value,
            jogoId:e.target.jogoId.value,
            nome:e.target.nomeJogador.value
        };
        await ajax.AdicionarJogador(jogador)
            .then(async (res)=>{
                if(res.status!=200 && res.status!=201 && res.status!=202){                    
                    res.json().then((data)=>{
                        evt.addMensagem(document.getElementById('modalJogador'),'danger',data.err);
                    });
                    return;
                }
                evt.addMensagem(document.getElementById('modalJogador'),'success',` Jogador ${jogador.nome} salvo com sucesso!`);
                evt.CarregarJogadores(jogador.jogoId);
            })
            .catch((rej)=>{
                evt.addMensagem(document.getElementById('modalJogador'),'danger','Erro ao salvar o Jogador');
            });
        return false;
    });
    evt.addMensagem = (alvo, tipo, message)=>{
        // div.alert.alert-success.alert-dismissible.fade(role='alert')
        // i.fas.fa-triangle-exclamation.d-none &nbsp
        // span.alert-text &nbsp
        // button.btn-close(type='button' data-bs-dismiss='alert' aria-label='Fechar')
        if(!alvo)
            return;
        let alertContainer =alvo.querySelector('.alert-container');
        if(!alertContainer)
            return;
        let alert = alertContainer.querySelector('.alert');
        if(alert){
            alert.remove();
        }        
        alert = document.createElement('div');
        alert.classList.add('alert',`alert-${tipo}`,'alert-dismissible','fade', 'show');
        alert.setAttribute('role','alert');
        let i = document.createElement('i');
        i.classList.add('fas');
        i.textContent = ' ';
        if(tipo=='success') i.classList.add('fa-circle-check')
        else if(tipo=='danger')  i.classList.add('fa-triangle-exclamation')
        else i.classList.add('fa-circle-exclamation');
        let text = document.createElement('span');
        text.textContent=' '+message;
        let button = document.createElement('button')
        button.classList.add('btn-close');
        button.setAttribute('type','button');
        button.setAttribute('data-bs-dismiss','alert');
        button.setAttribute('ariaLabel','Fechar');
        alert.append(i);
        alert.append(text);
        alert.append(button);
        alertContainer.append(alert);
    };
    evt.jogarModalShow=((e)=>{;
        const button = e.relatedTarget;
        const jogadorId = button.getAttribute('data-bs-jogadorId');
        const nome = button.getAttribute('data-bs-nome');
        const modal =document.getElementById('modalJogador');
        const jogadorIdInput = modal.querySelector('#jogadorId');
        const nomeJogadorInput = modal.querySelector('#nomeJogador');
        jogadorIdInput.value = jogadorId;
        nomeJogadorInput.value = nome;
     });
    evt.inputNumerosChange = ((e)=>{
        e.preventDefault();
        const inputs = document.querySelectorAll('#modalAposta .numeros');
        for(let input of inputs){
            if(input != e.target && input.value==e.target.value){
                e.target.value='';
                e.target.focus();
                return false;
            }
        }
    });
    evt.modalApostaShow=((e)=>{;
        const button = e.relatedTarget;
        const jogadorId = button.getAttribute('data-bs-jogadorId');
        const nome = button.getAttribute('data-bs-nome');
        const jogoId = button.getAttribute('data-bs-jogoId');
        const apostaId = button.getAttribute('data-bs-apostaId');

        const modal =document.getElementById('modalAposta');
        const jogadorIdInput = modal.querySelector('#jogadorId');
        const jogoIdInput = modal.querySelector('#jogoId');
        const nomeJogadorInput = modal.querySelector('#nomeJogador');
        const apostaIdInput = modal.querySelector('#apostaId');

        jogadorIdInput.value = jogadorId;
        jogoIdInput.value = jogoId;
        apostaIdInput.value = apostaId;
        nomeJogadorInput.value = nome;
        let numeros = modal.querySelectorAll('.numeros');
        for(var input of numeros){        
            input.value='';
            input.removeEventListener('change', evt.inputNumerosChange);
            input.addEventListener('change', evt.inputNumerosChange);
        }
     });
    let _public = {};    
    _public.init=()=>{
        let form = document.querySelector('#frmNovoConcurso');
        if(form)
            form.addEventListener('submit',evt.frmNovoConcursoSubmit);
        if(document.querySelector('.tabela-jogos'))
            evt.carregaTabela();
        let resultados = document.querySelectorAll('.resultados .resultado');
        if(resultados && resultados.length > 0){
            for(let resultado of resultados){
                evt.resultados.push(parseInt(resultado.textContent));
            }
        }
        let frmNovoJogador = document.querySelector('#frmNovoJogador');
        if(frmNovoJogador){
            frmNovoJogador.addEventListener('submit',evt.frmNovoJogadorSubmit);
            evt.CarregarJogadores(frmNovoJogador.jogoId.value);
        }
        let jogadorModal = document.getElementById('modalJogador');
        if(jogadorModal){
            jogadorModal.addEventListener('show.bs.modal',evt.jogarModalShow);
        }
        let modalAposta = document.getElementById('modalAposta');
        if(modalAposta){            
            modalAposta.addEventListener('show.bs.modal',evt.modalApostaShow);
            modalAposta.querySelector('#frmAposta').addEventListener('submit',evt.frmApostaSubmit);
        }
    };
    return _public;
})();
window.addEventListener('DOMContentLoaded',jogos.init);