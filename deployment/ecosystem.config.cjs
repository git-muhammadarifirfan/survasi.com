module.exports = {
  apps: [
    {
      name: 'bsan-jatim-api',
      script: 'index.js',
      cwd: './server',
      instances: 1,
      exec_mode: 'fork', // Fork mode uses significantly less RAM than cluster mode on 2GB VM
      node_args: '--max-old-space-size=512',
      max_memory_restart: '400M', // Auto restart if memory exceeds 400MB
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '../logs/pm2-error.log',
      out_file: '../logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
    },
  ],
};
