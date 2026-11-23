const LOG_LEVEL_PRIORITY = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50
};
/** Whether `logger` emits `level`; a logger without a declared level is assumed to emit everything. */
export function isLogLevelEnabled(logger, level) {
    return (logger.level === undefined || LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[logger.level]);
}
function noop() { }
/** A new silent logger per call, so a caller patching one changes no other. */
export function createNoopLogger() {
    const logger = {
        level: 'error',
        trace: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        child: () => logger
    };
    return logger;
}
