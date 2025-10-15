import * as path from 'path';
import * as fs from 'fs';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    const userDataDir = path.resolve(extensionDevelopmentPath, '.vscode-test', 'user-data');
    const extensionsDir = path.resolve(extensionDevelopmentPath, '.vscode-test', 'extensions');
    const portableDir = path.resolve(extensionDevelopmentPath, '.vscode-test', 'portable-data');
    const appDataDir = path.resolve(extensionDevelopmentPath, '.vscode-test', 'appdata');
    const localAppDataDir = path.resolve(extensionDevelopmentPath, '.vscode-test', 'localappdata');

    // Ensure local test directories exist to avoid writing to user profile locations
    fs.mkdirSync(userDataDir, { recursive: true });
    fs.mkdirSync(extensionsDir, { recursive: true });
    fs.mkdirSync(portableDir, { recursive: true });
    fs.mkdirSync(appDataDir, { recursive: true });
    fs.mkdirSync(localAppDataDir, { recursive: true });

    // Force VS Code to run in portable mode and keep all data within the workspace
    process.env['VSCODE_PORTABLE'] = portableDir;
    // Redirect common Windows user folders to workspace-local dirs to avoid permission issues
    process.env['APPDATA'] = appDataDir;
    process.env['LOCALAPPDATA'] = localAppDataDir;
    process.env['USERPROFILE'] = extensionDevelopmentPath;

    console.log('Extension development path:', extensionDevelopmentPath);
    console.log('Extension tests path:', extensionTestsPath);

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        `--user-data-dir=${userDataDir}`,
        `--extensions-dir=${extensionsDir}`,
        '--skip-welcome',
        '--skip-release-notes',
        '--disable-telemetry'
      ]
    });
  } catch (err) {
    console.error('Failed to run tests:', err);
    process.exit(1);
  }
}

main();
