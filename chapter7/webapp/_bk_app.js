/*
 * app.js -Hello World
*/

/*jslint browser:true, continue:true,
  devel:true, indent:2, maxerr:50,
  newcap:true, nomen:true, plusplus:true,
  regexp:true,sloppy:true, vars:false,
  white:true
*/
/*global*/

var http, server;

http    = require('http');
server  = http.createServer( function (request, response ) {
  response.writeHead( 200, {'Context-Type': 'text/plain'});
  response.end('Hello World Ishige');
}).listen( 3000 );

// console.log('Listing on port %d', server.address().port);
console.log('Server running at http://[your_public_ip]:3000/');

// httpモジュールの読み込み
var http = require('http');
// httpサーバの作成
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3000); // ポート3000番でコネクションの受け入れを行う
// 実行時、コンソールに表示されるメッセージ
console.log('Server running at http://[your_public_ip]:3000/');
