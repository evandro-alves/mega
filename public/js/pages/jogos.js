const jogos = (()=>{
    let ajax = {};
    ajax.AdicionarJogo = ((jogo)=>{
        return fetch('../jogo/novo',{
            method:'post',
            contentType:'application/json',
            body:JSON.stringify(jogo)
        });
    });
    let evt = {};
    evt.frmNovoConcursoSubmit=((e)=>{
        e.preventDefault();
        ajax.AdicionarJogo({Concurso: e.target.frmNovoConcurso.value})
            .then()
    });

    let _public = {};    
    _public.init=()=>{
        let form = document.querySelector('#frmNovoConcurso').addEventListener('submit',evt.frmNovoConcursoSubmit);
    };
    return _public;
})();
window.addEventListener('DOMContentLoaded',jogos.init);