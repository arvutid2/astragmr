const css = `
.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:50}
.modal-content{background:linear-gradient(180deg,#12121a,#0f0f16);border:1px solid #1f1f2a;border-radius:16px;padding:16px;min-width:280px}
.rps-row{display:flex;gap:10px;justify-content:center;margin-top:10px}
.btn{cursor:pointer;border:1px solid #222232;background:#1a1a22;padding:10px 12px;border-radius:10px}
.btn.ghost{background:transparent}
.small{font-size:12px;color:#a4a4b5;text-align:center;margin-top:8px}
`;
const beats = { rock:'scissors', paper:'rock', scissors:'paper' };
const moves = ['rock','paper','scissors'];

function injectOnce(id='rps-style'){
  if(document.getElementById(id)) return;
  const s=document.createElement('style'); s.id=id; s.textContent=css; document.head.appendChild(s);
}
function modalEl(){
  const wrap=document.createElement('div'); wrap.className='modal';
  wrap.innerHTML=`
  <div class="modal-content">
    <h3>Choose your move</h3>
    <div class="rps-row">
      <button class="btn" data-move="rock">Rock</button>
      <button class="btn" data-move="paper">Paper</button>
      <button class="btn" data-move="scissors">Scissors</button>
    </div>
    <div class="small" id="rpsResult"></div>
    <div class="rps-row"><button class="btn ghost" data-close>Close</button></div>
  </div>`;
  return wrap;
}

export function playRps({ lobby }){
  injectOnce();
  return new Promise((resolve)=>{
    const modal = modalEl(); document.body.appendChild(modal);
    const resultEl = modal.querySelector('#rpsResult');

    const onClick = (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      if(btn.hasAttribute('data-close')){ cleanup(); resolve({ draw:true }); return; }
      const userMove = btn.dataset.move; if(!userMove) return;

      const aiMove = lobby.ai ? moves[Math.floor(Math.random()*moves.length)] : null;
      if(lobby.ai){
        if(userMove === aiMove){ resultEl.textContent=`Draw. You: ${userMove} • AI: ${aiMove}`; return; }
        const userWins = ( {rock:'scissors', paper:'rock', scissors:'paper'} )[userMove] === aiMove;
        const winnerId = userWins ? lobby.hostId : lobby.joinerId;
        const loserId  = userWins ? lobby.joinerId : lobby.hostId;
        resultEl.textContent = userWins ? `You win! You: ${userMove} • AI: ${aiMove}` : `You lose. You: ${userMove} • AI: ${aiMove}`;
        setTimeout(()=>{ cleanup(); resolve({ winnerId, loserId, draw:false }); }, 600);
        return;
      }
      // PvP tulevikus
      resultEl.textContent = 'Waiting for opponent…';
    };

    function cleanup(){ modal.removeEventListener('click', onClick); modal.remove(); }
    modal.addEventListener('click', onClick);
  });
}
