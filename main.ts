import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from './src/config';
import { ExceptionFilter } from './src//exceptions/http.exception';
import { AppModule } from 'src/app.module';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { apiURLS } from 'src/utils/constants';

let port: number;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: false,
      validationError: { value: false },
      transform: true,
    }),
  );

  app.enableCors({ origin: true });
  app.enableShutdownHooks();
  port = config.port;

  Sentry.init({
    dsn: config.sentryDSN,
    tracesSampleRate: 1.0,
    environment: config.env,
    integrations: [new ProfilingIntegration()],
    profilesSampleRate: 1.0,
  });

  const swagConfig = new DocumentBuilder()
    .setTitle('Furex Admin Service API')
    .setDescription('Admin API Documentation for FUrex')
    .setVersion('1.0')
    .addServer(`http://localhost:${port}`)
    .addServer(`${apiURLS[config.env] || ''}/admin-service`, config.env)
    .addApiKey(
      {
        type: 'apiKey',
        scheme: 'x-api-key',
        name: 'x-auth-token',
        in: 'header',
      },
      'auth',
    )
    .build();
  SwaggerModule.setup(
    '/docs',
    app,
    SwaggerModule.createDocument(app, swagConfig),
  );

  await app.listen(port);
}

bootstrap().then(() => {
  console.info(`
      ------------
      Admin Service Application Started!
      API V1: http://localhost:${port}/
      API Docs: http://localhost:${port}/docs
      ------------
`);
});
