import { $ } from './core/state.js';
import { bcL } from './core/bus.js';
import { bindAuth, loadUser } from './core/auth.js';
import { bindChat } from './features/chat/index.js';
import { renderLobbies, createLobby, startPracticeAi } from './features/lobby/index.js';
import { renderProfile } from './features/profile/index.js';

function setView(name){
  ['profile','lobby','chat','friends','leaderboard'].forEach(id=>{
    const sec = document.getElementById('view-'+id);
    if(sec) sec.style.display = (id===name)?'block':'none';
    const nav = document.getElementById('nav-'+id);
    if(nav){ if(id===name) nav.classList.add('active'); else nav.classList.remove('active'); }
  });
}

window.addEventListener('load', ()=>{
  bindAuth(); loadUser(); bindChat();
  renderLobbies(); renderProfile(); setView('lobby');

  document.getElementById('create')?.addEventListener('click', ()=> createLobby(document.querySelector('#chain').value));
  document.getElementById('practiceStart')?.addEventListener('click', startPracticeAi);

  document.getElementById('nav-profile')?.addEventListener('click', ()=> setView('profile'));
  document.getElementById('nav-lobby')  ?.addEventListener('click', ()=> setView('lobby'));
  document.getElementById('nav-chat')   ?.addEventListener('click', ()=> setView('chat'));
  document.getElementById('nav-friends')?.addEventListener('click', ()=> setView('friends'));
  document.getElementById('nav-leaderboard')?.addEventListener('click', ()=> setView('leaderboard'));

  bcL.onmessage = (ev)=>{
    const { type } = ev.data||{};
    if(type==='lobbies:sync') renderLobbies();
    if(type==='profiles:update') renderProfile();
    if(type==='match:ended') renderLobbies();
  };
});
