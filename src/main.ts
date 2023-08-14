import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';

const logger = new Logger('main');

async function bootstrap() {
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

  app.listen(process.env.HTTP_PORT || 4003, () => {
    logger.log(`Running on ${process.env.HTTP_PORT || 4003}`);
  });
}
bootstrap();
