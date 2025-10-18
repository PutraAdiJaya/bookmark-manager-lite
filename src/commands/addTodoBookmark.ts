import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function addTodoBookmarkCommand(bookmarkService: IBookmarkService): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const document = editor.document;
  const position = editor.selection.active;
  const filePath = vscode.workspace.asRelativePath(document.uri);
  const line = position.line;
  const column = position.character;

  try {
    // Get the line text for default title
    const lineText = document.lineAt(line).text.trim();
    const defaultTitle = lineText.substring(0, 50) || `TODO: Line ${line + 1}`;

    // Prompt for bookmark title
    const title = await vscode.window.showInputBox({
      prompt: 'Enter TODO bookmark title',
      placeHolder: 'e.g., Fix bug in authentication',
      value: defaultTitle,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title cannot be empty';
        }
        return null;
      }
    });

    if (title === undefined) {
      return; // User cancelled
    }

    // Prompt for description (optional)
    const description = await vscode.window.showInputBox({
      prompt: 'Enter description (optional)',
      placeHolder: 'Additional details about this TODO...'
    });

    if (description === undefined) {
      return; // User cancelled
    }

    // Add bookmark with TODO tag
    await bookmarkService.addBookmark({
      title: title.trim(),
      description: description?.trim() || '',
      filePath,
      line,
      column,
      tags: ['TODO'] // Automatically add TODO tag
    });

    vscode.window.showInformationMessage(`TODO bookmark added: ${title.trim()}`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to add TODO bookmark: ${error.message}`);
  }
}
