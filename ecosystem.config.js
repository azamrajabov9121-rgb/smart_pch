module.exports = {
    apps: [
        {
            name: 'smart-pch-server',
            script: './server/index.js',
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            autorestart: true,
            restart_delay: 1000,
            exp_backoff_restart_delay: 100,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: './server/logs/err.log',
            out_file: './server/logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true
        }
    ]
};
