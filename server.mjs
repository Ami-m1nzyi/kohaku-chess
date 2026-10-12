import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ordersHandler from './api/orders.js';
import adminHandler from './api/admin.js';

const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mp4':'video/mp4','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT)||4173;

async function api(req,res,url){
  const handler=url.pathname==='/api/orders'?ordersHandler:url.pathname==='/api/admin'?adminHandler:null;
  if(!handler)return false;
  let body={};
  if(!['GET','HEAD'].includes(req.method)){
    try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks).toString('utf8');body=raw?JSON.parse(raw):{};}
    catch{res.writeHead(400,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify({error:'Некорректный запрос.'}));return true;}
  }
  const query=Object.fromEntries(url.searchParams.entries());
  const adaptedReq={method:req.method,headers:req.headers,query,body};
  const adaptedRes={statusCode:200,headers:{},setHeader(name,value){this.headers[name]=value;},status(code){this.statusCode=code;return this;},json(value){res.writeHead(this.statusCode,this.headers).end(JSON.stringify(value));return this;}};
  try{await handler(adaptedReq,adaptedRes);if(!res.writableEnded)res.writeHead(adaptedRes.statusCode,adaptedRes.headers).end(JSON.stringify({error:'Сервис не вернул ответ.'}));}
  catch{if(!res.writableEnded)res.writeHead(500,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify({error:'Внутренняя ошибка сервиса.'}));}
  return true;
}

http.createServer(async(req,res)=>{
  let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400).end();return;}
  if(url.pathname.startsWith('/api/')){if(await api(req,res,url))return;res.writeHead(404,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify({error:'Такой API-маршрут не найден.'}));return;}
  let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404).end();return;}const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}else{res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);}});
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
