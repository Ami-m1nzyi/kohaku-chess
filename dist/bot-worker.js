import {chooseMove} from './engine.js';
self.onmessage=({data})=>{try{self.postMessage({id:data.id,move:chooseMove(data.fen,data.level),fen:data.fen});}catch(error){self.postMessage({id:data.id,error:error.message});}};
