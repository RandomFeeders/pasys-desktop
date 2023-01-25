import 'dotenv/config';
import { existsSync as fsExists, writeFileSync as fsWriteFile, readFileSync as fsReadFile } from 'fs';
import { resolve as pathResolve } from 'path';

interface Config {
	screen_width: number;
	screen_height: number;
}

const configPath = pathResolve(__dirname, 'config.json');
const defaultConfig: Config = {
	screen_width: 1280,
	screen_height: 720,
};

if (!fsExists(configPath)) {
	fsWriteFile(configPath, JSON.stringify(defaultConfig, undefined, 4), { encoding: 'utf-8' });
}

const configFileContent = fsReadFile(configPath, { encoding: 'utf-8' });
export const config: Config = JSON.parse(configFileContent);
