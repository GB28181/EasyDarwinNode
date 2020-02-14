const cfg = require('cfg');
const path = require('path');

module.exports = {
  apps: [
    {
      name: "EasyDarwin",
      script: 'app.js',
      cwd: __dirname,
      env: {
        NODE_PATH: __dirname,
        NODE_ENV: 'production'
      },
      watch: false,
      max_restarts: 5,
      // autorestart: false,
      error_file: path.resolve(cfg.dataDir, "logs/EasyDarwin.log"),
      out_file: path.resolve(cfg.dataDir, "logs/EasyDarwin.log")
    }
  ]
};
