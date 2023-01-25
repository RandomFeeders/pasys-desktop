import 'reflect-metadata';
import { resolve as pathResolve } from 'path';
import { app as electronApp, BrowserWindow } from 'electron';

const app: {
	main_window?: BrowserWindow;
} = {};

function createMainWindow() {
	app.main_window = new BrowserWindow({
		width: 1280,
		height: 720,
		frame: false,
		resizable: true,
		webPreferences: {
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			contextIsolation: false,
		},
	});

	const url = {
		pathname: pathResolve(__dirname, 'index.html'),
		protocol: 'file',
	};

	app.main_window.loadURL(`${url.protocol}://${url.pathname}`);

	if (process.env.DEBUG === 'true') {
		app.main_window.webContents.openDevTools();
	}

	app.main_window.on('closed', () => {
		app.main_window = null;
	});
}

electronApp.on('ready', async () => {
	createMainWindow();

	const remote = await import('@electron/remote/main');
	remote.initialize();
	remote.enable(app.main_window.webContents);
});

electronApp.on('window-all-closed', () => {
	if (process.platform !== 'darwin') electronApp.quit();
});

electronApp.on('activate', () => {
	if (!app.main_window) createMainWindow();
});
