/**
 * Nivel de logs para mostrar al usuario (error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5)
 */
module.exports = {
    activo: true, // true: Logs activos, false: Logs desactivados
    filtroUnico: false, // Impreme los logs solamente del nivel especificado (level)
    levelConsole: 'info',
    levelFile: 'error',
    filename: 'C:/Users/vivanchuk/Documents/ws-OnkoPros/private_server/express-server/logs/app.log'
}
