const RTSPServer = require('rtsp-server');
const HTTPServer = require('http-server');
const cfg = require('cfg');

process.title = "EasyDarwin";

//rtsp server start
var rtspServer = new RTSPServer(cfg.rtsp_tcp_port);
rtspServer.start();

//http server start
var httpServer = new HTTPServer(cfg.http_port);
httpServer.start();
