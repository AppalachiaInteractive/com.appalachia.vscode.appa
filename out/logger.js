"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = exports.Logger = void 0;
const vscode = require("vscode");
class Logger {
    constructor(name) {
        this.channel = vscode.window.createOutputChannel(name);
    }
    log(message) {
        this.channel.appendLine(message.toString());
    }
}
exports.Logger = Logger;
let logger;
/**
 * Gets a singleton instance of a logger that writes to an OutputChannel.
 */
function getLogger() {
    if (!logger) {
        logger = new Logger('Extension Manager');
    }
    return logger;
}
exports.getLogger = getLogger;
//# sourceMappingURL=logger.js.map