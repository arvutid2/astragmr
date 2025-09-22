import { getProfile } from '../../core/state.js';
import { me } from '../../core/auth.js';

export function renderProfile(){
  if(!me) return;
  const pr = getProfile(me.id);
  const set = (id,val)=>{ const el=document.getElementById(id); if(el) el.textContent=val; };
  set('duels-played', pr.duelsPlayed);
  set('duels-won', pr.duelsWon);
  set('me-balance', pr.balance);
  const mini = document.getElementById('duels-mini'); if(mini) mini.textContent = pr.duelsWon + '/' + pr.duelsPlayed;
}
