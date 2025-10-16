import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function validateBookmarksCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Validating bookmarks...",
      cancellable: false
    }, async (progress) => {
      progress.report({ message: 'Checking bookmark file paths' });
      
      const result = await bookmarkService.validateBookmarks();
      
      if (result.invalid.length === 0) {
        vscode.window.showInformationMessage(`All ${result.valid.length} bookmarks are valid!`);
      } else {
        const message = `${result.invalid.length} invalid bookmark(s) found out of ${result.valid.length + result.invalid.length} total bookmarks.`;
        
        const action = await vscode.window.showWarningMessage(
          message, 
          'View Invalid Bookmarks', 
          'Remove Invalid Bookmarks', 
          'Cancel'
        );
        
        if (action === 'View Invalid Bookmarks') {
          // Show invalid bookmarks in QuickPick
          const items: vscode.QuickPickItem[] = result.invalid.map(bookmark => ({
            label: bookmark.title,
            description: `${bookmark.filePath}:${bookmark.line + 1}`,
            detail: bookmark.description || 'File not found'
          }));
          
          const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Invalid bookmarks - Select one to see options'
          });
          
          if (selected) {
            // Find the actual bookmark
            const selectedBookmark = result.invalid.find(b => 
              b.title === selected.label && 
              `${b.filePath}:${b.line + 1}` === selected.description
            );
            
            if (selectedBookmark) {
              const option = await vscode.window.showInformationMessage(
                `Invalid bookmark: ${selectedBookmark.title}\nFile not found: ${selectedBookmark.filePath}`,
                'Remove Bookmark',
                'Cancel'
              );
              
              if (option === 'Remove Bookmark') {
                await bookmarkService.deleteBookmark(selectedBookmark.id);
                vscode.window.showInformationMessage('Bookmark removed successfully');
              }
            }
          }
        } else if (action === 'Remove Invalid Bookmarks') {
          // Remove all invalid bookmarks
          for (const bookmark of result.invalid) {
            await bookmarkService.deleteBookmark(bookmark.id);
          }
          vscode.window.showInformationMessage(`${result.invalid.length} invalid bookmark(s) removed successfully`);
        }
      }
    });
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to validate bookmarks: ${error.message}`);
  }
}