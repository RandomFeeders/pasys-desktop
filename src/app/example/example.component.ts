import { Component } from '../../library/decorators';

@Component({
	selector: 'app-example',
	template: '<p>This is an example!</p>',
})
export class ExampleComponent {
	public onInit(): void {
		console.log('Example component init');
	}

	public onAfterViewInit(): void {
		console.log('After example component view init');
	}
}
