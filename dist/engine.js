import {Chess} from './chess.js';
const values={p:100,n:320,b:335,r:500,q:900,k:0};
function evaluate(game){let value=0;for(const row of game.board())for(const p of row){if(!p)continue;const file=p.square.charCodeAt(0)-97,rank=Number(p.square[1])-1;const advance=p.color==='w'?rank:7-rank;const center=7-(Math.abs(file-3.5)+Math.abs(rank-3.5));let positional=0;if(p.type==='p')positional=advance*7+center*3;if(p.type==='n'||p.type==='b')positional=center*11;if(p.type==='r')positional=advance*2;if(p.type==='k')positional=advance<2?(file===6||file===2?30:0):-advance*8;value+=(values[p.type]+positional)*(p.color==='w'?1:-1);}return value*(game.turn()==='w'?1:-1);}
function order(moves){return moves.sort((a,b)=>priority(b)-priority(a));}
function priority(m){return (m.captured?10*values[m.captured]-values[m.piece]:0)+(m.promotion?values[m.promotion]:0)+(m.san.includes('+')?35:0)+(m.san.includes('#')?100000:0);}
export function chooseMove(fen,level=2,{budget=level===3?1300:level===2?600:200,random=Math.random}={}){
 const game=new Chess(fen),moves=order(game.moves({verbose:true}));if(!moves.length)return null;const deadline=Date.now()+budget;let nodes=0;
 function search(depth,alpha,beta,ply){if(++nodes%64===0&&Date.now()>deadline)throw new Error('time');if(game.isCheckmate())return -100000+ply;if(game.isDraw())return 0;if(depth===0)return evaluate(game);let best=-Infinity;for(const move of order(game.moves({verbose:true}))){game.move(move);let score;try{score=-search(depth-1,-beta,-alpha,ply+1);}finally{game.undo();}best=Math.max(best,score);alpha=Math.max(alpha,score);if(alpha>=beta)break;}return best;}
 let best=moves[0];const maxDepth=Number(level);for(let depth=1;depth<=maxDepth;depth++){let current=best,bestScore=-Infinity;try{for(const move of moves){game.move(move);let score;try{score=-search(depth-1,-Infinity,Infinity,1);}finally{game.undo();}if(level===1)score+=(random()-.5)*130;if(score>bestScore){bestScore=score;current=move;}}best=current;}catch{break;}if(Date.now()>deadline)break;}
 return {from:best.from,to:best.to,promotion:best.promotion};
}
