/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License.
 *  See https://github.com/microsoft/vscode/blob/master/LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommandManager = void 0;
const vscode = __webpack_require__(1);
class CommandManager {
    constructor() {
        this.commands = new Map();
    }
    dispose() {
        for (const registration of this.commands.values()) {
            registration.dispose();
        }
        this.commands.clear();
    }
    register(...commands) {
        for (const command of commands) {
            this.registerCommand(command.id, command.execute, command);
        }
    }
    registerCommand(id, impl, thisArg) {
        if (this.commands.has(id)) {
            return;
        }
        this.commands.set(id, vscode.commands.registerCommand(id, impl, thisArg));
    }
}
exports.CommandManager = CommandManager;


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(4), exports);


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SortImportsAndFormatAndSaveAllCommand = exports.SortImportsAndFormatAllCommand = exports.SortImportsAndSaveAllCommand = exports.SortImportsAllCommand = exports.FormatAndSaveAllCommand = exports.FormatAllCommand = void 0;
const vscode = __webpack_require__(1);
const logger_1 = __webpack_require__(5);
const path = __webpack_require__(6);
let includeFileExtensions = [];
let includeFileNames = [];
let excludeFileNames = [];
let excludeFolders = [];
class FormatAllCommand {
    constructor() {
        this.id = 'appa.format.formatAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['editor.action.formatDocument'], 'format', 'formatting', 'formatted', false, false);
        });
    }
}
exports.FormatAllCommand = FormatAllCommand;
class FormatAndSaveAllCommand {
    constructor() {
        this.id = 'appa.format.formatAndSaveAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['editor.action.formatDocument'], 'format and save', 'formatting and saving', 'formatted and saved', true, true);
        });
    }
}
exports.FormatAndSaveAllCommand = FormatAndSaveAllCommand;
class SortImportsAllCommand {
    constructor() {
        this.id = 'appa.format.sortImportsAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['python.sortImports'], 'sort imports', 'sorting imports of', 'sorted imports of', false, false);
        });
    }
}
exports.SortImportsAllCommand = SortImportsAllCommand;
class SortImportsAndSaveAllCommand {
    constructor() {
        this.id = 'appa.format.sortImportsAndSaveAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['python.sortImports'], 'sort imports and save ', 'sorting imports and saving', 'sorted imports and saved', true, true);
        });
    }
}
exports.SortImportsAndSaveAllCommand = SortImportsAndSaveAllCommand;
class SortImportsAndFormatAllCommand {
    constructor() {
        this.id = 'appa.format.sortImportsAndFormatAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['python.sortImports', 'editor.action.formatDocument'], 'sort imports and format', 'sorting imports and formatting', 'sorted imports and formatted', false, false);
        });
    }
}
exports.SortImportsAndFormatAllCommand = SortImportsAndFormatAllCommand;
class SortImportsAndFormatAndSaveAllCommand {
    constructor() {
        this.id = 'appa.format.sortImportsAndFormatAndSaveAll';
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeFormatAll(['python.sortImports', 'editor.action.formatDocument'], 'sort imports, format and save', 'sorting imports, formatting, and saving', 'sorted imports, formatted, and saved', true, true);
        });
    }
}
exports.SortImportsAndFormatAndSaveAllCommand = SortImportsAndFormatAndSaveAllCommand;
function toSentenceCase(str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function executeFormatAll(commands, verb, verbPresent, verbPast, save, close) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('appa.format');
        includeFileExtensions = config.get('includeFileExtensions', []);
        includeFileNames = config.get('includeFileNames', []);
        excludeFileNames = config.get('excludeFileNames', []);
        excludeFolders = config.get('excludeFolders', []);
        vscode.window.withProgress({
            title: toSentenceCase(verbPresent) + " all eligible files in workspace...",
            location: vscode.ProgressLocation.Notification,
        }, () => __awaiter(this, void 0, void 0, function* () {
            const folders = vscode.workspace.workspaceFolders;
            if (!folders) {
                return;
            }
            let sum = 0;
            for (const folder of folders) {
                sum += yield formatAllInUri(folder.uri, commands, verb, verbPresent, verbPast, save, close);
            }
            const message = toSentenceCase(verbPast) + " " + sum + " files.";
            logger_1.getLogger().log(message);
            vscode.window.showInformationMessage(message);
        }));
    });
}
function formatAllInUri(uri, commands, verb, verbPresent, verbPast, save, close) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield vscode.workspace.fs.stat(uri);
        const basename = path.basename(uri.fsPath);
        const extname = path.extname(uri.fsPath);
        const name = basename + extname;
        let sum = 0;
        if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
            if (excludeFolders.includes(basename)) {
                return 0;
            }
            const dirEntries = yield vscode.workspace.fs.readDirectory(uri);
            for (const dirEntry of dirEntries) {
                const entryName = dirEntry[0];
                const fullEntryPath = vscode.Uri.joinPath(uri, entryName);
                sum += yield formatAllInUri(fullEntryPath, commands, verb, verbPresent, verbPast, save, close);
            }
        }
        else if ((stat.type & vscode.FileType.File) === vscode.FileType.File) {
            if (extname === "") {
                return 0;
            }
            if (!includeFileNames.includes(name)) {
                if (!includeFileExtensions.includes(extname)) {
                    return 0;
                }
                if (excludeFileNames.includes(name)) {
                    return 0;
                }
            }
            let result = yield processFile(uri, commands, verb, save, close);
            if (result) {
                sum += 1;
            }
        }
        return sum;
    });
}
function processFile(uri, commands, verb, save, close) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vscode.window.showTextDocument(uri);
            commands.forEach((command) => __awaiter(this, void 0, void 0, function* () {
                yield vscode.commands.executeCommand(command);
            }));
            if (save) {
                yield ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.save());
            }
            if (save && close) {
                yield vscode.commands.executeCommand("workbench.action.closeActiveEditor");
            }
            return true;
        }
        catch (e) {
            logger_1.getLogger().log("Unable to " + verb.toLowerCase() + " [" + uri.fsPath + "]: " + e);
        }
        return false;
    });
}


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getLogger = exports.Logger = void 0;
const vscode = __webpack_require__(1);
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


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("path");;

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.context = exports.setContext = void 0;
function setContext(ctx) {
    exports.context = ctx;
}
exports.setContext = setContext;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const commandManager_1 = __webpack_require__(2);
const commands = __webpack_require__(3);
const context_1 = __webpack_require__(7);
function activate(context) {
    const message = 'Extension "appa" is now active';
    console.log(message);
    vscode.window.showInformationMessage(message);
    context_1.setContext(context);
    context.subscriptions.push(registerCommands());
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function registerCommands() {
    const commandManager = new commandManager_1.CommandManager();
    commandManager.register(
    // Format commands
    new commands.FormatAllCommand(), new commands.FormatAndSaveAllCommand(), new commands.SortImportsAllCommand(), new commands.SortImportsAndSaveAllCommand(), new commands.SortImportsAndFormatAllCommand(), new commands.SortImportsAndFormatAndSaveAllCommand());
    return commandManager;
}

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map