const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer((req, res) => {
  const safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.(?:[\\/]|$))+/, '');
  const file = path.join(__dirname, safePath === '/' ? 'index.html' : safePath);
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); return res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); }
    res.writeHead(200, {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(port, () => console.log(`Wedding invitation ready on ${port}`));
