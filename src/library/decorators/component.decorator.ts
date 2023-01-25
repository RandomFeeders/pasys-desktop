import { getCaller } from '../utils';
import { dirname } from 'path';
import { Constructor } from '../types';

export interface ComponentOptions {
	selector: string;
	template?: string;
	templateUrl?: string;
}

export const COMPONENT_OPTIONS_METADATA = 'component-options';
export const COMPONENT_PATH_METADATA = 'component-path';

export function Component(options: ComponentOptions) {
	return function (target: Constructor): void {
		const callerFile = getCaller(2).getFileName();
		Reflect.defineMetadata(COMPONENT_OPTIONS_METADATA, options, target);
		Reflect.defineMetadata(COMPONENT_PATH_METADATA, dirname(callerFile), target);
	};
}
