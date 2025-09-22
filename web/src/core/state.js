export const LS = { user:'mvp.user', lobbies:'mvp.lobbies', profiles:'mvp.profiles' };
export const $ = s => document.querySelector(s);
export const uid = () => Math.random().toString(36).slice(2,10);
export const now = () => new Date().toISOString();
export const read = (k,f)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? f }catch{ return f } };
export const write = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
export const toast = (t)=>{ const el = document.querySelector('#toast'); if(!el) return;
  el.textContent=t; el.style.display='block'; setTimeout(()=> el.style.display='none', 2200);
};

export function ensureProfiles(){ const p=read(LS.profiles,{}); write(LS.profiles,p); return p; }
export function getProfile(id){ const p=ensureProfiles(); if(!p[id]){ p[id]={duelsPlayed:0,duelsWon:0,balance:0}; write(LS.profiles,p);} return read(LS.profiles,{})[id]; }
export function setProfile(id, patch){ const p=ensureProfiles(); p[id]={...getProfile(id),...patch}; write(LS.profiles,p); }

export const readLobbies = ()=> read(LS.lobbies, []);
export const writeLobbies = (list)=> write(LS.lobbies, list);
