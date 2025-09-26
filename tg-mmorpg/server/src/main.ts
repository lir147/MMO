
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import helmet from 'helmet';

(BigInt.prototype as any).toJSON = function () { return this.toString(); };

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true, methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','x-telegram-init-data'] });
  await app.listen(process.env.PORT || 10000);
  console.log('API listening on', process.env.PORT || 10000);
}
bootstrap();
