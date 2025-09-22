import { bcC } from '../../core/bus.js';
import { $ } from '../../core/state.js';
import { me } from '../../core/auth.js';

export function bindChat(){
  document.getElementById('chatSend')?.addEventListener('click', send);
  bcC.onmessage = (ev)=>{ const d=ev.data||{}; if(d.type==='chat:message') add(d); };
}

function add(msg){
  const box = document.getElementById('chatLog'); if(!box) return;
  const div = document.createElement('div');
  const meLine = me && msg.fromId===me.id;
  div.className = 'chatline ' + (meLine?'chatme':'');
  const name = msg.fromName || msg.fromId.slice(-4);
  div.textContent = `[${new Date(msg.ts).toLocaleTimeString()}] ${name}: ${msg.text}`;
  box.append(div); box.scrollTop = box.scrollHeight;
}
function send(){
  if(!me) return;
  const input = document.getElementById('chatInput'); if(!input) return;
  const t = input.value.trim(); if(!t) return;
  const payload = { type:'chat:message', text:t, ts:Date.now(), fromId:me.id, fromName:me.username };
  add(payload); bcC.postMessage(payload); input.value='';
}
