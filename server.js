#!/bin/env node

var http = require('http');

var host = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

http.createServer(function (req, res) {
  console.log('%s: %s %s', Date(Date.now()), req.method, req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('consulate');
}).listen(port, host);

console.log('Server running at %s:%s', host, port);
