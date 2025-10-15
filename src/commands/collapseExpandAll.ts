import * as vscode from 'vscode';

export async function collapseAllCommand(): Promise<void> {
  try {
    await vscode.commands.executeCommand('workbench.actions.treeView.bookmarkExplorer.collapseAll');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to collapse all: ${error.message}`);
  }
}

export async function expandAllCommand(): Promise<void> {
  try {
    // Note: VS Code doesn't have a built-in expandAll command for tree views
    // This is a placeholder that could be enhanced with custom logic
    vscode.window.showInformationMessage('Expand all functionality');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to expand all: ${error.message}`);
  }
}
