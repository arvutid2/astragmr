import { LS, $, write, read } from './state.js';

export let me = null;

export function loadUser(){
  me = read(LS.user, null);
  if(me){
    const cover = document.getElementById('authCover'); if(cover) cover.style.display='none';
    const wn = document.getElementById('wallet-name'); if(wn) wn.textContent = me.username;
    const mn = document.getElementById('me-name'); if(mn) mn.textContent = me.username;
    const mb = document.getElementById('me-badge'); if(mb) mb.textContent = me.username;
  } else {
    const cover = document.getElementById('authCover'); if(cover) cover.style.display='flex';
  }
}

export function bindAuth(){
  document.getElementById('login')?.addEventListener('click', ()=>{
    const field = document.getElementById('uname');
    const name = field && field.value ? field.value.trim() : '';
    if(!name) return;
    me = { id: 'u_'+Math.random().toString(36).slice(2,10), username: name };
    write(LS.user, me); loadUser();
  });
  document.getElementById('logout')?.addEventListener('click', ()=>{ localStorage.removeItem(LS.user); location.reload(); });
}
