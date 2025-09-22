import { $, uid, now, getProfile, setProfile, readLobbies, writeLobbies, toast } from '../../core/state.js';
import { bcL } from '../../core/bus.js';
import { me } from '../../core/auth.js';
import { runGame } from '../games/registry.js';

export function renderLobbies(){
  const root = document.getElementById('lobbyList'); if(!root) return; root.innerHTML='';
  const list = readLobbies().filter(l => l.status==='waiting' || l.status==='matched');
  list.forEach(l=>{
    const row = document.createElement('div'); row.className='lobby';
    row.innerHTML = `<div><b class="gold">${l.gameId.toUpperCase()}</b> • Host: ${l.hostName} • Stake: ${l.stake} • Chain: ${l.chain} • <span class="small">${l.status}${l.ai?' • AI':''}</span></div>`;
    const btnJoin = mkBtn('Join'); const btnStart = mkBtn('Start'); const btnCancel = mkBtn('Cancel','ghost');

    const iAmHost = me && l.hostId===me.id;
    btnJoin.disabled = !me || l.status!=='waiting' || iAmHost || l.ai;
    btnStart.disabled = !(iAmHost && l.status==='matched');
    btnCancel.disabled = !(iAmHost && l.status==='waiting');

    btnJoin.onclick = ()=> joinLobby(l.id);
    btnStart.onclick = ()=> startMatch(l.id);
    btnCancel.onclick = ()=> cancelLobby(l.id);

    row.append(btnJoin, btnStart, btnCancel);
    root.append(row);
  });
}
const mkBtn = (t,cls='')=>{ const b=document.createElement('button'); b.className='btn'+(cls?` ${cls}`:''); b.textContent=t; return b; };

export function createLobby(chain){
  if(!me) return toast('Logi sisse');
  if(readLobbies().some(l=> l.hostId===me.id && (l.status==='waiting'||l.status==='matched'))) return toast('Sul on juba avatud lobby');

  const stake = parseInt(document.getElementById('stake').value||'1',10);
  if(!(stake>=1)) return toast('Stake ≥ 1');
  if(((stake-1)%5)!==0) return toast('Stake samm: 5, algus: 1');

  const gameId = document.getElementById('game')?.value || 'rps';
  const lob = { id:'l_'+uid(), gameId, stake, chain, status:'waiting', hostId: me.id, hostName: me.username, createdAt: now() };
  const arr = readLobbies(); arr.push(lob); writeLobbies(arr); bcL.postMessage({type:'lobbies:sync'}); renderLobbies(); toast('Lobby loodud');
}

export function joinLobby(id){
  const arr = readLobbies(); const i = arr.findIndex(x=>x.id===id); if(i<0) return;
  const l = arr[i]; if(l.status!=='waiting') return toast('Lobby mitte-ootel');
  if(me && me.id===l.hostId) return toast('Oled host');
  l.joinerId = me.id; l.joinerName = me.username; l.status='matched'; arr[i]=l; writeLobbies(arr); bcL.postMessage({type:'lobbies:sync'}); renderLobbies(); toast('Liitusid');
}

export function cancelLobby(id){
  const arr = readLobbies().filter(x=>x.id!==id);
  writeLobbies(arr); bcL.postMessage({type:'lobbies:sync'}); renderLobbies(); toast('Lobby tühistatud');
}

export async function startMatch(id){
  const arr = readLobbies(); const i = arr.findIndex(x=>x.id===id); if(i<0) return;
  const l = arr[i];
  if(!(me && l.hostId===me.id && l.status==='matched')) return;

  try{
    const outcome = await runGame(l.gameId, { lobby: l });
    if(!outcome || outcome.draw) return;
    finishMatch(arr, i, l, outcome.winnerId, outcome.loserId);
  }catch(e){
    console.error(e); toast('Mängu laadimine ebaõnnestus');
  }
}

export async function startPracticeAi(){
  if(!me) return toast('Logi sisse');

  const practiceLobby = { id:'practice', gameId:'rps', hostId:me.id, hostName:me.username, joinerId:'ai', joinerName:'AI', ai:true, stake:0 };
  try{
    const outcome = await runGame('rps', { lobby: practiceLobby });
    if(!outcome || outcome.draw) return;
    if(outcome.winnerId !== 'ai'){ const wp=getProfile(outcome.winnerId); setProfile(outcome.winnerId, { duelsPlayed: wp.duelsPlayed+1, duelsWon: wp.duelsWon+1, balance: wp.balance }); }
    if(outcome.loserId  !== 'ai'){ const lp=getProfile(outcome.loserId ); setProfile(outcome.loserId,  { duelsPlayed: lp.duelsPlayed+1, duelsWon: lp.duelsWon,   balance: lp.balance }); }
  }catch(e){ console.error(e); toast('Practice ei käivitunud'); }
}

function finishMatch(arr, i, l, winner, loser){
  const prize = Math.floor(l.stake*2*0.9);
  if(winner !== 'ai'){ const wp=getProfile(winner); setProfile(winner, { duelsPlayed: wp.duelsPlayed+1, duelsWon: wp.duelsWon+1, balance: wp.balance+prize }); }
  if(loser  !== 'ai'){ const lp=getProfile(loser ); setProfile(loser,  { duelsPlayed: lp.duelsPlayed+1, duelsWon: lp.duelsWon,   balance: lp.balance     }); }
  arr.splice(i,1); writeLobbies(arr); bcL.postMessage({type:'match:ended', id:l.id, winner}); renderLobbies();
}
