import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express';
import { Context, Callback, Handler } from 'aws-lambda/handler';

const logger = new Logger('serverless');
let cachedServer: Handler;
async function serverlessBootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((err) => {
            const { value, property, constraints } = err;
            const constVal = constraints == undefined ? '' : constraints;
            return { value, property, constraints: Object.values(constVal) };
          }),
        );
      },
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  cachedServer = cachedServer ?? (await serverlessBootstrap());
  logger.log('Serverless running');
  logger.log({
    event: event,
    context: context,
    callback: callback,
  });
  return cachedServer(event, context, callback);
};

module.exports.handler = handler;
