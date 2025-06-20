import { app, BrowserWindow } from 'electron'
// import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {ipcMain, dialog } from 'electron'
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';


// const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 700,
    height: 660,
    minWidth: 700,  
    minHeight: 660, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

ipcMain.handle('dialog:openFile', async () => {
  if (!win) {
    return null;
  }
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'Markup Files', extensions: ['xml', 'html'] }
    ]
  });

  if (canceled || !filePaths[0]) {
    return null;
  }

  const path = filePaths[0];
  const stats = fs.statSync(path);
  const type = stats.isDirectory() ? 'folder' : 'file';

  return { path, type };
});

ipcMain.handle('xml:parse', async (event, filePath) => {
  try {
    // Read the file content from the path provided by the frontend
    const xmlData = fs.readFileSync(filePath, 'utf-8');

    // Configure the parser
    const parser = new XMLParser({
      ignoreAttributes: false, // Keep attributes
      attributeNamePrefix: "@_", // Prefix attributes to distinguish them
      allowBooleanAttributes: true,
      // parseAttributeValue: true,
      trimValues: true,
      // parseTagValue: true,
    });

    // Parse the XML into a JavaScript object
    const jsonObj = parser.parse(xmlData);

    // Send the parsed object back to the frontend
    return { status: 'success', data: jsonObj };

  } catch (error) {
    console.error('Failed to parse XML file:', error);
    // Send an error object back if anything goes wrong
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return { status: 'error', message: errorMessage };
  }
});

ipcMain.handle('file:read', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error('Failed to read file:', error);
    return null;
  }
});

// Handler to write new content to a file
ipcMain.handle('file:write', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { status: 'success' };
  } catch (error) {
    console.error('Failed to write file:', error);
    return { status: 'error', message: error };
  }
});
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
