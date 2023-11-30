import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import config from './src/config';
import { ExceptionFilter } from './src//exceptions/http.exception';
import { AppModule } from 'src/app.module';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import * as requestIp from 'request-ip';
import { apiURLS } from 'src/utils/constants';

let port: number;

  const corsOrigins = ['*'];
  //process.env.ALLOWED_CORS_ORIGINS;

  const corsOriginsArray = corsOrigins
    // ? corsOrigins.trim().split(',').concat('*')
    // : ['*'];

async function bootstrap() {

   const app = await NestFactory.create(AppModule);

  app.use(requestIp.mw());
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

 
    // app.use(function (req, res, next) {
    //   if (process.env.BACKEND_ENV === 'production' && req.secure) {
    //     res.setHeader(
    //       'Strict-Transport-Security',
    //       'max-age=63072000; includeSubDomains; preload',
    //     );
    //     res.setHeader('Referrer-policy', 'strict-origin-when-cross-origin');
    //   }
    //   next(); 
    // });

    app.enableCors({
      origin: corsOriginsArray,
      methods: ['POST','GET','PUT', 'PATCH','DELETE'],
      credentials:true,
      maxAge:3600
    });

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
