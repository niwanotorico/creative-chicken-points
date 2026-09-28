const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root=__dirname;
http.createServer((req,res)=>{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); pathname=pathname.replace(/^\/creative-chicken-points/,''); const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname)); if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();} fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':file.endsWith('.webmanifest')?'application/manifest+json':'text/javascript');res.end(data);});}).listen(4178,'127.0.0.1');
