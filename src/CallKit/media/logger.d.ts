export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';
/** The `zapo-js` `Logger` shape, redeclared so a browser host can pass any matching object. */
export interface Logger {
    readonly level?: LogLevel;
    trace(message: string, context?: Readonly<Record<string, unknown>>): void;
    debug(message: string, context?: Readonly<Record<string, unknown>>): void;
    info(message: string, context?: Readonly<Record<string, unknown>>): void;
    warn(message: string, context?: Readonly<Record<string, unknown>>): void;
    error(message: string, context?: Readonly<Record<string, unknown>>): void;
    child(bindings: Readonly<Record<string, unknown>>): Logger;
}
/** Whether `logger` emits `level`; a logger without a declared level is assumed to emit everything. */
export declare function isLogLevelEnabled(logger: Logger, level: LogLevel): boolean;
/** A new silent logger per call, so a caller patching one changes no other. */
export declare function createNoopLogger(): Logger;
