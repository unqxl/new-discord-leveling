module.exports = class Logger {
    log(...message) {
        return console.log(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }

    warn(...message) {
        return console.warn(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }

    error(...message) {
        return console.error(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }
}