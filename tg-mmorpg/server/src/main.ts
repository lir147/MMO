
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.PORT || 8080);
  console.log('API listening on', process.env.PORT || 8080);
}
bootstrap();
