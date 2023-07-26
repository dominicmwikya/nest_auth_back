import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { verifyJWTtoken } from './Middlwares/verifyJWTtoken';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const verifyJWTTokenMiddleware = new verifyJWTtoken();
  // app.use(verifyJWTTokenMiddleware.use)
  await app.listen(3001);
}
bootstrap();
