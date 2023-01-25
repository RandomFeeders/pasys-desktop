import { Module } from '../../library/decorators';
import { ExampleComponent } from './example.component';

@Module({
	bootstrap: ExampleComponent,
})
export class ExampleModule {}
