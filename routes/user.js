const express = require("express");
const escapeReg = require('escape-string-regexp');
const utils = require("utils");
const cfg = require("cfg");

const r = express.Router();

r.get('/defaultPwd', async (req, res) => {
    res.json(cfg.defaultPwd);
})

r.post('/list', async (req, res) => {
    var start = parseInt(req.body.start) || 0;
    var limit = parseInt(req.body.limit) || 10;
    var q = req.body.q || "";
    var sort = req.body.sort;
    var order = req.body.order;
    
    var users = utils.db.read().get("users");
    if(q) {
        users = users.filter(user => {
            var exp = new RegExp(escapeReg(q));
            var _roles = (user.roles||[]).join(',');
            return exp.test(user.name) || exp.test(_roles);
        })
    }
    var total = users.size().value();
    res.json({
        total: total,
        rows: users.drop(start).slice(0, limit).value()
    })
})

r.post('/save', async (req, res) => {
    if(utils.db.read().get('demo').cloneDeep().value()) {
        throw new Error('演示系统, 不支持操作');
    }
    var name = req.body.name;
    var id = req.body.id;
    if(!name) {
        throw new Error('用户名不能为空');
    }
    if(id) {
        utils.db.read().get('users').find({ id: id}).assign({
            name: name
        }).write();
    } else {
        if(utils.db.read().get('users').find({name: name}).size().value() > 0) {
            throw new Error(`用户名已存在`);
        }
        utils.db.read().get('users').push({
            id: utils.shortid(),
            name: name,
            password: utils.md5(cfg.defaultPwd)
        }).write();
    }
    res.sendStatus(200);
})

r.post('/resetPwd', async (req, res) => {
    if(utils.db.read().get('demo').cloneDeep().value()) {
        throw new Error('演示系统, 不支持操作');
    }
    var id = req.body.id;
    utils.db.get('users').find({ id: id}).assign({
        password: utils.md5(cfg.defaultPwd)
    }).write();
    res.sendStatus(200);
})

r.post('/remove', async (req, res) => {
    if(utils.db.read().get('demo').cloneDeep().value()) {
        throw new Error('演示系统, 不支持操作');
    }
    var id = req.body.id;
    utils.db.get('users').remove({ id: id}).write();
    res.sendStatus(200);
})

r.post('/modify-password', async (req, res) => {
    if(utils.db.read().get('demo').cloneDeep().value()) {
        throw new Error('演示系统, 不支持操作');
    }    
    var oldPassword = req.body.oldPassword || "";
    var newPassword = req.body.newPassword || "";
    var newPassword2 = req.body.newPassword2 || "";

    var uid = req.session.user.id;

    var user = utils.db.get('users').find({ id: uid }).cloneDeep().value();
    if (!user || oldPassword != user.password) {
        throw new Error("原密码不正确");
    }
    if (!newPassword) {
        throw new Error("密码不能为空");
    }
    if (newPassword != newPassword2) {
        throw new Error("两次密码输入不一致");
    }
    utils.db.read().get('users').find({ id: uid }).set('password', newPassword).write();
    res.sendStatus(200);
})

module.exports = r;