export async function runGame(gameId, ctx){
  if(gameId==='rps'){ const { playRps } = await import('./rps/index.js'); return playRps(ctx); }
  throw new Error('Unknown game: '+gameId);
}
