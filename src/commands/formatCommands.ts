import * as vscode from 'vscode';

import { Command } from '../commandManager';
import { getLogger } from '../logger';

import * as path from 'path';
import { basename } from 'node:path';

let includeFileExtensions: string[] = [];
let includeFileNames: string[] = [];
let excludeFileNames: string[] = [];
let excludeFolders: string[] = [];

export class FormatAllCommand implements Command {
    public readonly id = 'appa.format.formatAll';

    public async execute(): Promise<void> {
        await executeFormatAll(['editor.action.formatDocument'], 'format', 'formatting','formatted', false, false)
    }
}

export class FormatAndSaveAllCommand implements Command {
    public readonly id = 'appa.format.formatAndSaveAll';

    public async execute(): Promise<void> {
        await executeFormatAll(['editor.action.formatDocument'], 'format and save', 'formatting and saving','formatted and saved', true, true)
    }
}

export class SortImportsAllCommand implements Command {
    public readonly id = 'appa.format.sortImportsAll';
    
    public async execute(): Promise<void> {
        await executeFormatAll(['python.sortImports'], 'sort imports', 'sorting imports of','sorted imports of', false, false)
    }
}

export class SortImportsAndSaveAllCommand implements Command {
    public readonly id = 'appa.format.sortImportsAndSaveAll';
    
    public async execute(): Promise<void> {
        await executeFormatAll(['python.sortImports'], 'sort imports and save ', 'sorting imports and saving','sorted imports and saved', true, true)
    }
}


export class SortImportsAndFormatAllCommand implements Command {
    public readonly id = 'appa.format.sortImportsAndFormatAll';
    
    public async execute(): Promise<void> {
        await executeFormatAll(['python.sortImports','editor.action.formatDocument'], 'sort imports and format', 'sorting imports and formatting','sorted imports and formatted', false, false)
    }
}

export class SortImportsAndFormatAndSaveAllCommand implements Command {
    public readonly id = 'appa.format.sortImportsAndFormatAndSaveAll';
    
    public async execute(): Promise<void> {
        await executeFormatAll(['python.sortImports','editor.action.formatDocument'], 'sort imports, format and save', 'sorting imports, formatting, and saving','sorted imports, formatted, and saved', true, true)
    }
}


function toSentenceCase(str: string) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}
function toTitleCase(str: string) {
    return str.replace(
        /\w\S*/g,
        function (txt: string) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

async function executeFormatAll(
    commands: string[],
    verb: string,
    verbPresent: string,
    verbPast: string,
    save: boolean,
    close: boolean): Promise<void> {

    const config = vscode.workspace.getConfiguration('appa.format');
    includeFileExtensions = config.get('includeFileExtensions', []);
    includeFileNames = config.get('includeFileNames', []);
    excludeFileNames = config.get('excludeFileNames', []);
    excludeFolders = config.get('excludeFolders', []);

    vscode.window.withProgress(
        {
            title: toSentenceCase(verbPresent) + " all eligible files in workspace...",
            location: vscode.ProgressLocation.Notification,
        },
        async () => {

            const folders = vscode.workspace.workspaceFolders;
            if (!folders) {
                return;
            }

            let sum = 0;
            for (const folder of folders) {
                sum += await formatAllInUri(folder.uri, commands, verb, verbPresent, verbPast, save, close);
            }

            const message = toSentenceCase(verbPast) + " " + sum + " files.";
            getLogger().log(message);
            vscode.window.showInformationMessage(message);
        },
    );
}


async function formatAllInUri(
    uri: vscode.Uri,
    commands: string[],
    verb: string,
    verbPresent: string,
    verbPast: string,
    save: boolean,
    close: boolean
): Promise<number> {
    const stat: vscode.FileStat = await vscode.workspace.fs.stat(uri);
    const basename = path.basename(uri.fsPath);
    const extname = path.extname(uri.fsPath);
    const name = basename + extname;
    const logger = getLogger();
    let sum = 0;

    if ((stat.type & vscode.FileType.Directory) === vscode.FileType.Directory) {
        if (excludeFolders.includes(basename)) { return 0; }

        const dirEntries = await vscode.workspace.fs.readDirectory(uri);

        for (const dirEntry of dirEntries) {
            const entryName = dirEntry[0];
            const fullEntryPath = vscode.Uri.joinPath(uri, entryName);
            sum += await formatAllInUri(fullEntryPath, commands, verb, verbPresent, verbPast, save, close);
        }
    }
    else if ((stat.type & vscode.FileType.File) === vscode.FileType.File) {
        if (extname === "") { return 0; }
        if (!includeFileNames.includes(name)) {
            if (!includeFileExtensions.includes(extname)) { return 0; }
            if (excludeFileNames.includes(name)) { return 0; }
        }

        let result = await processFile(uri, commands, verb, save, close)

        if (result) {
            sum += 1;
        }
    }

    return sum;
}

async function processFile(
    uri: vscode.Uri,
    commands: string[],
    verb: string,
    save: boolean,
    close: boolean
): Promise<boolean> {
    try {
        await vscode.window.showTextDocument(uri);

        commands.forEach(async command => {
            await vscode.commands.executeCommand(command);    
        });
        
        if (save) {
            await vscode.window.activeTextEditor?.document.save()
        }
        if (save && close) {
            await vscode.commands.executeCommand("workbench.action.closeActiveEditor")
        }
        return true;
    } catch (e) {
        getLogger().log("Unable to " + verb.toLowerCase() + " [" + uri.fsPath + "]: " + e);
    }

    return false;
}