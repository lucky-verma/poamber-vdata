const http = require('http');
http.createServer((req, res) => {
    const query = new URL(req.url, `http://${req.headers.host}`).searchParams;
    res.end(`<h1>${query.get('name')}</h1>`);
}).listen(8080);
