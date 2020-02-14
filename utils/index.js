const cfg = require('cfg');
const shortid = require('shortid');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync.js');
const path = require('path');
const crypto = require("crypto");
const fs = require('fs-extra');
const moment = require('moment');
const url = require('url');
const os = require('os');

exports.md5 = str => {
    return crypto.createHash('md5').update(str, "utf8").digest('hex');
}

exports.xhr = req => {
    return req.xhr || (req.get('accept') || "").match(/\/json$/);
}

exports.shortid = function() {
    return shortid.generate();
}

exports.formatDate = function(d) {
    return moment(d).format('YYYY-MM-DD')
}

exports.formatDateTime = function(d) {
    return moment(d).format('YYYY-MM-DD HH:mm:ss')
}

exports.getCPUInfo = function() { 
    var cpus = os.cpus();
    var idle = 0;
    var total = 0;
    for(var cpu in cpus){
        if (!cpus.hasOwnProperty(cpu)) continue;	
        for(var key in cpus[cpu].times) {
            if(!cpus[cpu].times.hasOwnProperty(key)) continue;
            total += cpus[cpu].times[key];
            if(key == 'idle') {
                idle += cpus[cpu].times[key];
            }
        }
    }
	
    return {
        'idle': idle, 
        'total': total
    };
}

fs.ensureDirSync(cfg.dataDir);
const db = lowdb(new FileSync(path.resolve(cfg.dataDir, 'db.json')));
db.defaults({
    users: [{id: exports.shortid(), name: 'admin', password: exports.md5(cfg.defaultPwd)}],
    demo: false,
    apiAuthed: false
}).write();
exports.db = db;
