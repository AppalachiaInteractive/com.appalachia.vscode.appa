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
exports.FormatAllCommand = void 0;
const vscode = require("vscode");
const logger_1 = require("../logger");
const path = require("path");
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
            vscode.window.withProgress({
                title: "Formatting all eligible files in workspace...",
                location: vscode.ProgressLocation.Notification,
            }, () => __awaiter(this, void 0, void 0, function* () {
                const config = vscode.workspace.getConfiguration('appa.format');
                includeFileExtensions = config.get('includeFileExtensions', []);
                includeFileNames = config.get('includeFileNames', []);
                excludeFileNames = config.get('excludeFileNames', []);
                excludeFolders = config.get('excludeFolders', []);
                const folders = vscode.workspace.workspaceFolders;
                if (!folders) {
                    return;
                }
                let sum = 0;
                for (const folder of folders) {
                    sum += yield formatAllInUri(folder.uri);
                }
                const message = "Formatted x" + sum + " files.";
                logger_1.getLogger().log(message);
                vscode.window.showInformationMessage(message);
            }));
        });
    }
}
exports.FormatAllCommand = FormatAllCommand;
function formatAllInUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield vscode.workspace.fs.stat(uri);
        const basename = path.basename(uri.fsPath);
        const extname = path.extname(uri.fsPath);
        const name = basename + extname;
        const logger = logger_1.getLogger();
        let sum = 0;
        if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
            if (excludeFolders.includes(basename)) {
                return 0;
            }
            const dirEntries = yield vscode.workspace.fs.readDirectory(uri);
            for (const dirEntry of dirEntries) {
                const entryName = dirEntry[0];
                const fullEntryPath = vscode.Uri.joinPath(uri, entryName);
                sum += yield formatAllInUri(fullEntryPath);
            }
        }
        else if ((stat.type & vscode.FileType.File) === vscode.FileType.File) {
            if (!includeFileNames.includes(name)) {
                if (!includeFileExtensions.includes(extname)) {
                    return 0;
                }
                if (excludeFileNames.includes(name)) {
                    return 0;
                }
            }
            let result = yield formatFile(uri);
            if (result) {
                sum += 1;
            }
        }
        return sum;
    });
}
function formatFile(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield vscode.window.showTextDocument(uri);
            yield vscode.commands.executeCommand('editor.action.formatDocument');
            return true;
        }
        catch (e) {
            logger_1.getLogger().log("Unable to format [" + uri.fsPath + "]: " + e);
        }
        return false;
    });
}
//# sourceMappingURL=formatCommands.js.map