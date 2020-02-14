const path = require("path");
const os = require("os");

module.exports = {
    http_port: 10008,
    rtsp_tcp_port: 554,
    defaultPwd: 'admin',
    rootDir: __dirname,
    wwwDir: path.resolve(__dirname, "www"),
    dataDir: path.resolve(os.homedir(), ".easydarwin")
}