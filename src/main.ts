import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port as number, '0.0.0.0');
  console.log(`🚀 App running on port ${port}`);
}
bootstrap();
