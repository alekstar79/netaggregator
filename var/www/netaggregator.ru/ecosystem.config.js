const path = require('path')

module.exports = {
    apps: [
        {
            name: 'nuxt-app',
            script: 'yarn',
            args: '--cwd /var/www/netaggregator.ru/nuxt/ run start',
            // script: './nuxt/node_modules/nuxt/bin/nuxt.js',
            // args: `start ${path.join(__dirname, '/nuxt')}`,
            exec_interpreter: 'node',
            exec_mode: 'cluster',
            instances: 'max',

            env: { NODE_ENV: 'production' },
            max_memory_restart: '560M',
            restart_delay: 3000,
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'drawer',
            script: 'yarn',
            args: '--cwd /var/www/netaggregator.ru/nuxt/ run draw',
            // script: 'npm --prefix /var/www/netaggregator.ru/nuxt run draw',
            exec_interpreter: 'node',
            exec_mode: 'fork',
            autorestart: true,
            watch: false,

            env: { NODE_APP: 'draw' },

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'services',
            script: './src/App/Service/server.php',
            exec_interpreter: 'php',
            exec_mode: 'fork',

            // max_memory_restart: '350M',
            restart_delay: 3000,
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'birthday',
            script: './src/App/Service/Birthday/server.php',
            exec_interpreter: 'php',
            exec_mode: 'fork',

            max_memory_restart: '150M',
            restart_delay: 3000,
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'mailing',
            script: './src/App/Service/Chat/builder.php',
            exec_interpreter: 'php',
            exec_mode: 'fork',

            // max_memory_restart: '150M',
            restart_delay: 3000,
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'info',
            script: './src/App/Service/Info/server.php',
            exec_interpreter: 'php',
            exec_mode: 'fork',

            // max_memory_restart: '150M',
            restart_delay: 3000,
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw',
            time: true
        },
        {
            name: 'webp-watchers',
            script: './webp-watchers.sh',
            args: path.join(__dirname, '/nuxt/static'),
            exec_interpreter: 'bash',
            exec_mode: 'fork',
            autorestart: true,
            watch: false,

            merge_logs: true,
            log_type: 'raw'
        }
    ]
}
