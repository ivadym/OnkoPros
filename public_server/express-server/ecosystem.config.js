module.exports = {
    apps : [{
        name: 'public_server',
        script: './app.js',
        exec_mode: 'fork', // 'cluster'
        // instances: 'max',
        autorestart: true,
        watch: false // Reinicia automáticamente la aplicación cuando es modificado el directorio actual/subdirectorios
    }]
};
