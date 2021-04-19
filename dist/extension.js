/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
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
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
let includeExtensions = [];
let excludeFolders = [];
let unableToFormat = [];
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const message = 'Extension "appa" is now active';
    console.log(message);
    vscode.window.showInformationMessage(message);
    const config = vscode.workspace.getConfiguration('formatAll');
    includeExtensions = config.get('includeFileExtensions', []);
    excludeFolders = config.get('excludeFolders', []);
    let disposable = vscode.commands.registerCommand('appa.formatAll', () => __awaiter(this, void 0, void 0, function* () {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            return;
        }
        for (const folder of folders) {
            yield formatAll(folder.uri);
        }
        vscode.window.showInformationMessage('Finished formatting all.');
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function formatAll(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield vscode.workspace.fs.stat(uri);
        if (((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) && !excludeFolders.includes(path.basename(uri.fsPath))) {
            const files = yield vscode.workspace.fs.readDirectory(uri);
            for (const file of files) {
                yield formatAll(vscode.Uri.joinPath(uri, file[0]));
            }
        }
        else if (((stat.type & vscode.FileType.File) === vscode.FileType.File) && includeExtensions.includes(path.extname(uri.fsPath))) {
            try {
                yield vscode.window.showTextDocument(uri);
                yield vscode.commands.executeCommand('editor.action.formatDocument');
            }
            catch (e) {
                unableToFormat.push(uri.fsPath);
            }
        }
    });
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");;

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map