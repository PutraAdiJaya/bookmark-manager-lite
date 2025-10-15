import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function addBookmarkCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor');
      return;
    }

    const position = editor.selection.active;
    const filePath = vscode.workspace.asRelativePath(editor.document.uri);

    // Get bookmark title from user
    const title = await vscode.window.showInputBox({
      prompt: 'Enter bookmark title',
      placeHolder: 'e.g., Important function',
      validateInput: (value) => {
        return value.trim() ? null : 'Title cannot be empty';
      }
    });

    if (!title) {
      return; // User cancelled
    }

    // Extract code context for description
    const line = editor.document.lineAt(position.line);
    const description = line.text.trim() || 'No description';

    // Add bookmark
    await bookmarkService.addBookmark({
      title: title.trim(),
      description,
      filePath,
      line: position.line,
      column: position.character,
      tags: []
    });

    vscode.window.showInformationMessage(`Bookmark "${title}" added successfully`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to add bookmark: ${error.message}`);
  }
}
