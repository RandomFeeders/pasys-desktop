import { readFileSync as fsReadFile, existsSync as fsFileExists } from 'fs';
import {
	ComponentOptions,
	COMPONENT_OPTIONS_METADATA,
	COMPONENT_PATH_METADATA,
	ModuleOptions,
	MODULE_OPTIONS_METADATA,
} from './decorators';
import { resolve as pathResolve } from 'path';
import { Constructor } from './types';

export class InterfaceRenderer {
	private constructor() {}

	public static render(mainModule: Constructor) {
		this.loadModule(mainModule);
	}

	private static loadModule(module: Constructor, parent?: Element) {
		const moduleOptions: ModuleOptions = Reflect.getMetadata(MODULE_OPTIONS_METADATA, module);

		if (!moduleOptions) {
			throw `Please make sure to use the Module decorator in your ${module.name}`;
		}

		if (moduleOptions.bootstrap) {
			this.loadComponent(moduleOptions.bootstrap, parent);
		}

		if (moduleOptions.declarations?.length > 0) {
			moduleOptions.declarations.forEach((component) => this.loadComponent(component));
		}

		const moduleOutlet = document.getElementsByTagName('module-outlet');
		if (moduleOutlet.length > 1) {
			throw `You have multiples module outlets inside your ${module.name}`;
		}

		if (moduleOptions.imports?.length > 0) {
			moduleOptions.imports.forEach((importModule) => this.loadModule(importModule, moduleOutlet.item(0)));
		}
	}

	private static loadComponent(component: Constructor, parent?: Element) {
		const componentOptions: ComponentOptions = Reflect.getMetadata(COMPONENT_OPTIONS_METADATA, component);
		const componentPath: string = Reflect.getMetadata(COMPONENT_PATH_METADATA, component);

		if (!componentOptions || !componentPath) {
			throw `Please make sure to use the Component decorator in your ${component.name}`;
		}

		const template =
			componentOptions.template ??
			this.readComponentTemplateFile(componentOptions.templateUrl, componentPath, component.name);

		const appearances = document.getElementsByTagName(componentOptions.selector);

		if (parent) {
			this.renderComponentAt(component, template, componentOptions.selector, parent);
			parent.remove();
		}

		for (let i = 0; i < appearances.length; i++) {
			this.renderComponentIn(component, template, appearances.item(i));
		}
	}

	private static renderComponentAt(component: Constructor, template: string, tag: string, position: Element) {
		this.renderComponent(component, template, (template) => {
			const element = document.createElement(tag);
			element.innerHTML = template;
			position.parentNode.insertBefore(element, position);
		});
	}

	private static renderComponentIn(component: Constructor, template: string, tag: Element) {
		this.renderComponent(component, template, (template) => {
			tag.innerHTML = template;
		});
	}

	private static renderComponent(
		component: Constructor,
		template: string,
		viewInitCallback: (template: string) => void
	) {
		const instance = new component();

		if (typeof instance.onInit === 'function') instance.onInit();

		const interpolationRegex = /\{\{[ ]*([^ ]*)[ ]*\}\}/g;
		const match = template.match(interpolationRegex);
		const templateWithReplacedInterpolation =
			match && match.length > 0
				? template.replace(interpolationRegex, (_, ...args: string[]) => {
						return args[0].endsWith('()') ? instance[args[0].replace('()', '')]() : instance[args[0]];
				  })
				: template;

		viewInitCallback(templateWithReplacedInterpolation);

		if (typeof instance.onAfterViewInit === 'function') instance.onAfterViewInit();
	}

	private static readComponentTemplateFile(templateUrl: string, path: string, componentName: string) {
		if (!templateUrl) {
			throw `Please make sure to set either template or template url on the ${componentName}`;
		}

		const file = pathResolve(path, templateUrl);
		if (!fsFileExists(file)) {
			throw `Could not find ${componentName} template url, check if the file exist`;
		}

		return fsReadFile(file, { encoding: 'utf-8' });
	}
}
