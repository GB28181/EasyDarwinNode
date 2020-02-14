const express = require("express");
const cfg = require("cfg");
const utils = require('utils');
const os = require('os');

const r = express.Router();

r.post("/login", async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    if (!username) {
        throw new Error("用户名不能为空");
    }
    if (!password) {
        throw new Error("密码不能为空");
    }
    var user = utils.db.read().get('users').find({ name: username }).cloneDeep().value();
    if (!user) {
        throw new Error("用户名不存在");
    }
    if (user.password !== password) {
        throw new Error("密码错误");
    }
    delete user.password;
    req.session.user = user;
    res.sendStatus(200);
});

r.get("/isDefaultPWd", async (req, res) => {
    var dbPassword = utils.db.read().get('users').find({ name: "admin" }).cloneDeep().value().password;
    var defaultPassword = utils.md5(cfg.defaultPwd);
    if(dbPassword == defaultPassword) {
        res.json("密码(admin)")
    }else{
        res.json("请输入密码")
    }
});

r.get("/logout", async (req, res) => {
    delete req.session;
    if (utils.xhr(req)) {
        res.sendStatus(200);
        return;
    } else {
        res.redirect("/");
    }
});

r.post("/userInfo", async (req, res) => {
    if (req.session.user) {
        var user = utils.db.get('users').find({ name: req.session.user.name }).cloneDeep().value();
        if(user) {
            delete user.password;
            res.json(user);
            return;
        }
    }
    res.json(null);
});

var _cpuInfo = utils.getCPUInfo();
var cpuUsage = 0;
setInterval(() => {
    var cpuInfo = utils.getCPUInfo();
    var idle = cpuInfo.idle - _cpuInfo.idle;
    var total = cpuInfo.total - _cpuInfo.total;
    var per = Math.floor(idle / total * 100) / 100;
    cpuUsage = 1 - per;
    _cpuInfo = cpuInfo;
}, 300)

var memData = [], cpuData = [], pusherData = [], playerData = [];
var duration = 30;
var stats = require('routes/stats');
setInterval(() => {
    var totalmem = os.totalmem();
    var freemem = os.freemem();
    var memUsage = (totalmem - freemem) / totalmem;
    var now = new Date();
    while(memData.length >= duration) {
        memData.shift();
    }
    memData.push({
        time: now,
        '使用': memUsage
    });
    while(cpuData.length >= duration) {
        cpuData.shift();
    }
    cpuData.push({
        time: now,
        '使用': cpuUsage
    })
    while(pusherData.length >= duration) {
        pusherData.shift();
    }
    var pusherCnt = 0;
    if(stats.rtspServer) {
        pusherCnt = Object.keys(stats.rtspServer.sessions).length;
    }
    pusherData.push({
        time: now,
        '总数': pusherCnt
    })
    while(playerData.length >= duration) {
        playerData.shift();
    }
    var playerCnt = 0;
    if(stats.rtspServer) {
        for(var path in stats.rtspServer.sessions) {
            var pushSession = stats.rtspServer.sessions[path];
            playerCnt += Object.keys(pushSession.playSessions).length;
        }
    }
    playerData.push({
        time: now,
        '总数': playerCnt
    })
}, 1000);

r.post('/serverInfo', async (req, res) => {
    res.json({
        memData: memData,
        cpuData: cpuData,
        pusherData: pusherData,
        playerData: playerData
    })
})

var startTime = new Date();

r.get('/runtime', async(req,res) => {
    var now = new Date();
    var runtime = now - startTime;
    function formatDuring(mss) {
        var days = parseInt(mss / (1000 * 60 * 60 * 24));
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((mss % (1000 * 60)) / 1000);
        return days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 ";
    }
    var formateTime = formatDuring(runtime)
    res.json(formateTime);
})

module.exports = r;