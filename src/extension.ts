// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { CommandManager } from './commandManager';
import * as commands from './commands/index';
import { setContext } from './context';


export function activate(context: vscode.ExtensionContext): void {
	const message = 'Extension "appa" is now active';
	console.log(message);
	vscode.window.showInformationMessage(message);

    setContext(context);

    context.subscriptions.push(registerCommands());
}

export function deactivate() { }

function registerCommands(): vscode.Disposable {
    const commandManager = new CommandManager();

    commandManager.register(
        // Format commands
        new commands.FormatAllCommand(),
    );

    return commandManager;
}

