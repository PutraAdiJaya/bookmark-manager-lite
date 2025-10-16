import * as vscode from 'vscode';
import { IBookmarkService } from '../services/IBookmarkService';

export async function showStatisticsCommand(bookmarkService: IBookmarkService): Promise<void> {
  try {
    const stats = bookmarkService.getStatistics();
    
    // Create statistics message
    let statsMessage = `# Bookmark Statistics\n\n`;
    statsMessage += `## Overview\n`;
    statsMessage += `- **Total Bookmarks**: ${stats.totalBookmarks}\n`;
    statsMessage += `- **Total Tags**: ${stats.totalTags}\n`;
    statsMessage += `- **Files with Bookmarks**: ${Object.keys(stats.bookmarksPerFile).length}\n\n`;
    
    statsMessage += `## Most Used Tags\n`;
    if (stats.mostUsedTags.length > 0) {
      stats.mostUsedTags.forEach(({ tag, count }) => {
        statsMessage += `- **${tag}**: ${count} bookmark${count !== 1 ? 's' : ''}\n`;
      });
    } else {
      statsMessage += `- No tags found\n`;
    }
    statsMessage += `\n`;
    
    statsMessage += `## Files with Most Bookmarks\n`;
    const sortedFiles = Object.entries(stats.bookmarksPerFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 files
    
    if (sortedFiles.length > 0) {
      sortedFiles.forEach(([file, count]) => {
        statsMessage += `- **${file}**: ${count} bookmark${count !== 1 ? 's' : ''}\n`;
      });
    } else {
      statsMessage += `- No files found\n`;
    }
    
    // Show statistics in a webview panel
    const panel = vscode.window.createWebviewPanel(
      'bookmarkStatistics',
      'Bookmark Statistics',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    
    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bookmark Statistics</title>
        <style>
          body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.5;
          }
          h1, h2, h3 {
            color: var(--vscode-foreground);
          }
          ul {
            list-style-type: disc;
            padding-left: 20px;
          }
          li {
            margin-bottom: 5px;
          }
          .stat-card {
            background-color: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-sideBar-border);
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
          }
        </style>
      </head>
      <body>
        <h1>Bookmark Statistics</h1>
        
        <div class="stat-card">
          <h2>Overview</h2>
          <p><span class="stat-number">${stats.totalBookmarks}</span> Total Bookmarks</p>
          <p><span class="stat-number">${stats.totalTags}</span> Unique Tags</p>
          <p><span class="stat-number">${Object.keys(stats.bookmarksPerFile).length}</span> Files with Bookmarks</p>
        </div>
        
        <div class="stat-card">
          <h2>Most Used Tags</h2>
          <ul>
            ${stats.mostUsedTags.length > 0 
              ? stats.mostUsedTags.map(({ tag, count }) => 
                  `<li><strong>${tag}</strong>: ${count} bookmark${count !== 1 ? 's' : ''}</li>`
                ).join('')
              : '<li>No tags found</li>'
            }
          </ul>
        </div>
        
        <div class="stat-card">
          <h2>Files with Most Bookmarks</h2>
          <ul>
            ${sortedFiles.length > 0 
              ? sortedFiles.map(([file, count]) => 
                  `<li><strong>${file}</strong>: ${count} bookmark${count !== 1 ? 's' : ''}</li>`
                ).join('')
              : '<li>No files found</li>'
            }
          </ul>
        </div>
      </body>
      </html>
    `;
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to show statistics: ${error.message}`);
  }
}