"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const commandManager_1 = require("./commandManager");
const commands = require("./commands/index");
const context_1 = require("./context");
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
//# sourceMappingURL=extension.js.map