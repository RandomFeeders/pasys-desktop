import { Module } from '../library/decorators';
import { AppComponent } from './app.component';
import { ExampleModule } from './example/example.module';
import { HeaderComponent } from './header/header.component';

@Module({
	imports: [ExampleModule],
	declarations: [HeaderComponent],
	bootstrap: AppComponent,
})
export class AppModule {}
