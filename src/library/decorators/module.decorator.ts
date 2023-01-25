import { Constructor } from '../types';

export interface ModuleOptions {
	imports?: Constructor[];
	declarations?: Constructor[];
	bootstrap?: Constructor;
}

export const MODULE_OPTIONS_METADATA = 'module-options';

export function Module(options: ModuleOptions) {
	return function (target: Constructor): void {
		Reflect.defineMetadata(MODULE_OPTIONS_METADATA, options, target);
	};
}
