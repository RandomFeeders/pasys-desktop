import { spawn } from 'child_process';
import { WatchOptions, FSWatcher, watch } from 'chokidar';
import { app, BrowserWindow } from 'electron';

const appPath = app.getAppPath();
const ignoredPaths = /node_modules|[/\\]\./;

export interface ElectronReloaderOptions extends WatchOptions {
	command?: string;
	hardResetMethod?: 'exit' | 'quit';
	forceHardReset?: boolean;
	timeout?: number;
}

export interface ElectronReloaderEvents {
	'before-reload': () => void;
	'after-reload': () => void;
}

export class ElectronReloader {
	private pattern: string;
	private options: ElectronReloaderOptions;

	private mainWindowId: number;
	private watcher: FSWatcher;
	private windows: BrowserWindow[];
	private events: { [key in keyof ElectronReloaderEvents]?: ElectronReloaderEvents[key][] };

	private reloadTimeout: NodeJS.Timeout;

	public constructor(pattern: string, options?: ElectronReloaderOptions) {
		this.pattern = pattern;

		this.options = options ?? {};
		this.options.hardResetMethod ??= 'quit';
		this.options.forceHardReset ??= false;
		this.options.timeout = isNaN(this.options.timeout) ? 1500 : this.options.timeout;

		this.options.ignored ??= [];
		if (!Array.isArray(this.options.ignored)) this.options.ignored = [this.options.ignored];
		this.options.ignored.push(ignoredPaths);
		if (this.options.forceHardReset === false) this.options.ignored.push('main.js');

		this.windows = [];
		this.events = {};
	}

	public startWatcher(mainWindowId: number): void {
		if (!this.watcher) this.createWatcher();

		if (process.env.DEBUG === 'true') {
			this.enableDevToolsEvents();
		}

		app.on('browser-window-created', (e, window) => {
			this.windows.push(window);
			if (window.id === mainWindowId) this.mainWindowId = mainWindowId;

			window.on('closed', () => {
				try {
					const index = this.windows.indexOf(window);
					this.windows.splice(index, 1);
					if (window.id === mainWindowId) this.mainWindowId = null;
				} catch {}
			});
		});

		if (this.options.forceHardReset === true) this.watcher.once('change', (...e) => this.resetHandler(...e));
		else this.watcher.on('change', (path, stats) => this.resetHandler(path, stats));
	}

	private createWatcher(): void {
		if (this.options.forceHardReset) {
			this.watcher = watch([this.pattern, 'main.js'], this.options);
		} else {
			this.watcher = watch(this.pattern, this.options);
		}
	}

	private enableDevToolsEvents(): void {
		this.on('before-reload', () => {
			this.windows.forEach((window) => {
				if (window.webContents.isDevToolsOpened()) {
					window.webContents.closeDevTools();
				}
			});
		});

		this.on('after-reload', () => {
			const mainWindow = this.windows.find((window) => window.id === this.mainWindowId);
			if (mainWindow) mainWindow.webContents.openDevTools();
		});
	}

	private resetHandler(...args: any[]): void {
		clearTimeout(this.reloadTimeout);
		this.reloadTimeout = setTimeout(() => {
			this.emit('before-reload');

			if (this.options.forceHardReset === false) {
				this.windows.forEach((window) => window.webContents.reloadIgnoringCache());
			}

			if (this.options.command) {
				const process = spawn(this.options.command, [appPath, ...args], { detached: true, stdio: 'inherit' });
				process.unref();

				if (this.options.hardResetMethod === 'exit') {
					app.exit();
				} else {
					app.quit();
				}
			}

			this.emit('after-reload');
		}, this.options.timeout);
	}

	private emit<T extends 'after-reload'>(type: 'after-reload'): void;
	private emit<T extends 'before-reload'>(type: 'before-reload'): void;
	private emit<T extends keyof ElectronReloaderEvents>(type: T, ...args: any[]): void {
		if (this.events[type] && this.events[type].length > 0) {
			this.events[type].forEach((callback) => callback()); // TODO: Fix not used args
		}
	}

	public addEventListener<T extends keyof ElectronReloaderEvents>(
		type: T,
		listener: ElectronReloaderEvents[T]
	): void {
		this.events[type] ??= [];
		this.events[type].push(listener);
	}

	public removeEventListener<T extends keyof ElectronReloaderEvents>(
		type: T,
		listener: ElectronReloaderEvents[T]
	): void {
		if (this.events[type] && this.events[type].length > 0) {
			const index = this.events[type].indexOf(listener);
			this.events[type].splice(index, 1);
		}
	}

	public on<T extends keyof ElectronReloaderEvents>(type: T, listener: ElectronReloaderEvents[T]): void {
		this.addEventListener(type, listener);
	}
}
