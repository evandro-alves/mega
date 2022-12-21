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
    let evt = {};
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
    evt.frmNovoConcursoSubmit=(async (e)=>{
        e.preventDefault();
        let concurso = e.target.concurso.value;
        await ajax.AdicionarJogo({concurso: e.target.concurso.value})
            .then(async (res)=>{
                if(res.status!=200 && res.status!=201){                    
                    res.json().then((data)=>{
                        evt.addMensagem('danger',data.err);
                    });
                    return;
                }
                evt.addMensagem('success',` Jogo Concurso ${concurso} salvo com sucesso!`);
                // setTimeout(()=>{
                //     document.querySelector('.btn-fechar-modal').click();
                // },2000);
                e.target.concurso.value = '';
                await evt.carregaTabela();
            })
            .catch((rej)=>{
                evt.addMensagem('danger','Erro ao salvar o Jogo');
            });
        return false;
    });
    evt.addMensagem = (tipo, message)=>{
        // div.alert.alert-success.alert-dismissible.fade(role='alert')
        // i.fas.fa-triangle-exclamation.d-none &nbsp
        // span.alert-text &nbsp
        // button.btn-close(type='button' data-bs-dismiss='alert' aria-label='Fechar')
        let alertContainer =document.querySelector('.alert-container');
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
        text.textContent=message;
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
    let _public = {};    
    _public.init=()=>{
        let form = document.querySelector('#frmNovoConcurso').addEventListener('submit',evt.frmNovoConcursoSubmit);
        evt.carregaTabela();
    };
    return _public;
})();
window.addEventListener('DOMContentLoaded',jogos.init);