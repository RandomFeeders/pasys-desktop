import 'reflect-metadata';
import { ElectronReloader } from './reloader';
import { resolve as pathResolve } from 'path';
import { app as electronApp, BrowserWindow } from 'electron';
import { config } from './config';

const app: {
	reloader?: ElectronReloader;
	main_window?: BrowserWindow;
} = {
	reloader: new ElectronReloader(pathResolve(__dirname, 'styles.css')),
};

app.reloader.startWatcher(1); // TODO: Remove hard-coded id

function createMainWindow() {
	app.main_window = new BrowserWindow({
		width: config.screen_width,
		height: config.screen_height,
		frame: false,
		resizable: true,
		icon: pathResolve(__dirname, 'assets/pasys-logo.png'),
		webPreferences: {
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			contextIsolation: false,
			preload: pathResolve(__dirname, 'preload.js'),
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
