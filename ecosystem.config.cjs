module.exports = {
  apps: [
    {
      name: "conformedge",
      script: ".next/standalone/server.js",
      cwd: "/var/www/conformedge",
      env: {
        NODE_ENV: "production",
        PORT: 3020,
        HOSTNAME: "0.0.0.0",
      },
      instances: 1,
      max_memory_restart: "400M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
