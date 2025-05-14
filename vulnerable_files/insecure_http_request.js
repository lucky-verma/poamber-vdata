const http = require('http');
http.get('http://example.com', res => {
  res.on('data', chunk => console.log(chunk.toString()));
});
