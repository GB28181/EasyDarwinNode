const RTSPServer = require('rtsp-server');
const cfg = require('cfg');
const express = require('express');
const yields = require('@penggy/express-yields');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const utils = require('utils');
const ip = require('@penggy/internal-ip');
const events = require('events');

class HTTPServer extends events.EventEmitter {

    constructor(port = 10008) {
        super();
        this.port = port;
        this.app = express();
        this.app.disable('x-powered-by');
        var bodyParser = require('body-parser');
        this.app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
        this.app.use(bodyParser.json({ type: 'application/json', limit: '100mb' }));
        this.app.use(bodyParser.raw({ type: 'text/plain' }));
        this.app.use(bodyParser.text({ type: 'text/html' }));
    
        this.app.use(express.static(cfg.wwwDir));
        var cookieParser = require('cookie-parser');
        this.app.use(cookieParser());
        var session = require('express-session');
        var FileStore = require('easy-session-file-store')(session);
        this.app.use(session({
            secret: 'EasyDarwin',
            store: new FileStore({
                path: path.resolve(cfg.dataDir, 'sessions'),
                reapInterval: 60, //second
                logFn: function(){}
            }),
            rolling: true,
            resave: false,
            saveUninitialized: false,
            name: 'sid',
            genid: function(req) {
                return utils.shortid();
            },
            cookie: {
                httpOnly: true, //not allow js access cookie
                maxAge: 28800000 // 8h 
            },
            unset: 'destroy'
        }));

        this.app.use("/", require('routes/index'));
        this.app.use(require('routes/auth'));
        this.app.use("/user", require('routes/user'));
        this.app.use("/stats", require('routes/stats'));

        //exception handle
        this.app.use((e, req, res, next) => {
            var files = req.files || [];
            for (var _file of files) {
                if (fs.existsSync(_file.path)) {
                    fs.removeSync(_file.path);
                }
            }
            console.log(e);
            if(res.headersSent) {
                return next();
            }
            if (e.message == 'access denied') {
                if (req.xhr || (req.get('accept') || "").match(/\/json$/)) {
                    res.status(401).send(e.message);
                } else {
                    req.session.savedRequestUrl = req.originalUrl;
                    res.redirect("/login.html");
                }
                return;
            }
            res.status(500).send(e.message);
        }); 
    
        this.server = http.createServer(this.app);
        this.server.on("upgrade", (req, socket, head) => {
            const pathname = require('url').parse(req.url).pathname;
            socket.destroy();
        });   
    }

    async start() {
        this.server.listen(this.port, async () => {
            var host = await ip.v4();
            var env = process.env.NODE_ENV || "development";
            console.log(`EasyDarwin http server listening on http://${host}:${this.port} in ${env} mode`);
        })
    }
}

module.exports = HTTPServer;
