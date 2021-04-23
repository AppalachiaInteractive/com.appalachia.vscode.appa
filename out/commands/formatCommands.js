"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortImportsAndFormatAndSaveAllCommand = exports.SortImportsAndFormatAllCommand = exports.SortImportsAndSaveAllCommand = exports.SortImportsAllCommand = exports.FormatAndSaveAllCommand = exports.FormatAllCommand = void 0;
const vscode = require("vscode");
const logger_1 = require("../logger");
const path = require("path");
//import { basename } from 'node:path';
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
// function toTitleCase(str: string) {
//     return str.replace(
//         /\w\S*/g,
//         function (txt: string) {
//             return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//         }
//     );
// }
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
//# sourceMappingURL=formatCommands.js.map