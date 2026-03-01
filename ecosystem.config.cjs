/**
 * PM2 Ecosystem Configuration for ConformEdge
 * Matches existing server patterns (ThriveSend, KopanoWorks)
 */

module.exports = {
  apps: [{
    name: 'conformedge',
    cwd: '/var/www/conformedge',
    script: '/usr/bin/bash',
    args: '-c "node_modules/.bin/next start -p 3020"',
    interpreter: 'none',

    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3020
    },

    // Process management
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,

    // Restart policy
    max_restarts: 10,
    min_uptime: '10s',
    exp_backoff_restart_delay: 1000,

    // Graceful shutdown - prevents port conflicts
    kill_timeout: 10000,
    listen_timeout: 30000,

    // Logging
    error_file: '/root/.pm2/logs/conformedge-error.log',
    out_file: '/root/.pm2/logs/conformedge-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Memory management
    max_memory_restart: '768M'
  }]
};
