import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
global['fetch']=require('node-fetch');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(8000);

}
bootstrap();
