/*---------------------------------------------------------------------------------------------
*  Copyright (c) Alessandro Fragnani. All rights reserved.
*  Licensed under the GPLv3 License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { StatusBarAlignment, StatusBarItem, window, workspace } from "vscode";
import { Locators } from "../autodetect/locators";
import { ProjectStorage } from "../storage/storage";
import { codicons } from "vscode-ext-codicons";
import { isRemoteUri } from "../utils/remote";
import { getCodiconFromUri } from "../utils/icons";
import { Project } from "../core/project";

let statusItem: StatusBarItem;

export function showStatusBar(projectStorage: ProjectStorage, locators: Locators, projectName?: string): Project | undefined {

    const showStatusConfig = workspace.getConfiguration("projectManager").get("showProjectNameInStatusBar");

    const workspace0 = workspace.workspaceFile ? workspace.workspaceFile :
        workspace.workspaceFolders ? workspace.workspaceFolders[ 0 ].uri :
            undefined;
    const currentProjectPath = workspace0 ? workspace0.fsPath : undefined;

    if (!showStatusConfig || !currentProjectPath || !workspace0) { return undefined; }

    if (!statusItem) {
        statusItem = window.createStatusBarItem("projectManager.statusBar", StatusBarAlignment.Left);
        statusItem.name = "Project Manager";
    }
    statusItem.text = getCodiconFromUri(workspace0) + " ";
    statusItem.tooltip = currentProjectPath;

    const openInNewWindow: boolean = workspace.getConfiguration("projectManager").get("openInNewWindowWhenClickingInStatusBar", false);
    if (openInNewWindow) {
        statusItem.command = "projectManager.listProjectsNewWindow";
    } else {
        statusItem.command = "projectManager.listProjects";
    }

    if (projectName) {
        statusItem.text += projectName;
        statusItem.show();
        return undefined;
    }

    let foundProject: Project | undefined;
    if (isRemoteUri(workspace0)) {
        foundProject = projectStorage.existsRemoteWithRootPath(workspace0);
    } else {
        foundProject = projectStorage.existsWithRootPath(currentProjectPath, true)
            ?? locators.vscLocator.existsWithRootPath(currentProjectPath)
            ?? locators.gitLocator.existsWithRootPath(currentProjectPath)
            ?? locators.mercurialLocator.existsWithRootPath(currentProjectPath)
            ?? locators.svnLocator.existsWithRootPath(currentProjectPath)
            ?? locators.anyLocator.existsWithRootPath(currentProjectPath);
    }
    if (foundProject) {
        statusItem.text += foundProject.name;
        statusItem.show();
        return foundProject;
    }
    return undefined;
}

export function updateStatusBar(oldName: string, oldPath: string, newName: string): void {
    if (statusItem.text === codicons.file_directory + " " + oldName && statusItem.tooltip === oldPath) {
        statusItem.text = codicons.file_directory + " " + newName;
    }
}