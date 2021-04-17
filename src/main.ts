import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
// import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet());
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minutes
      max: 20, // limit each IP to 20 requests per windowMs
    }),
  );
  app.enableCors();

  const configService = app.get(ConfigService);

  await app.listen(configService.get('app.port'));
}
bootstrap();
