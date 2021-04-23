import * as vscode from 'vscode';

import { Command } from '../commandManager';
import { getLogger } from '../logger';

import * as path from 'path';

let includeFileExtensions: string[] = [];
let includeFileNames: string[] = [];
let excludeFileNames: string[] = [];
let excludeFolders: string[] = [];

export class FormatAllCommand implements Command {
    public readonly id = 'appa.format.formatAll';

    public async execute(): Promise<void> {
        vscode.window.withProgress(
            {
                title: "Formatting all eligible files in workspace...",
                location: vscode.ProgressLocation.Notification,
            },
            async () => {
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
                    sum += await formatAllInUri(folder.uri);
                }
                
                const message = "Formatted " + sum + " files."
                getLogger().log(message);                
                vscode.window.showInformationMessage(message);
            },
        );
    }
}

async function formatAllInUri(uri: vscode.Uri): Promise<number> {
    const stat: vscode.FileStat = await vscode.workspace.fs.stat(uri);
    const basename = path.basename(uri.fsPath);
    const extname = path.extname(uri.fsPath);
    const name = basename+extname;
    let sum = 0;

    if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
        if (excludeFolders.includes(basename)) { return 0; }

        const dirEntries = await vscode.workspace.fs.readDirectory(uri);

        for (const dirEntry of dirEntries) {
            const entryName = dirEntry[0];
            const fullEntryPath = vscode.Uri.joinPath(uri, entryName);
            sum += await formatAllInUri(fullEntryPath);
        }
    }
    else if ((stat.type & vscode.FileType.File) === vscode.FileType.File) {
        if (!includeFileNames.includes(name)){
            if (!includeFileExtensions.includes(extname)) { return 0; }
            if (excludeFileNames.includes(name)) { return 0; }
        }
        
        let result = await formatFile(uri);

        if (result) {
            sum += 1;
        }        
    }

    return sum;
}


async function formatFile(uri: vscode.Uri): Promise<boolean> {    
    try {
        await vscode.window.showTextDocument(uri);
        await vscode.commands.executeCommand('editor.action.formatDocument');
        return true;
    } catch (e) {
        getLogger().log("Unable to format [" + uri.fsPath + "]: " + e);
    }

    return false;
}