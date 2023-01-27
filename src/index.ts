import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { Express } from 'express';
import { Server } from 'http';
import { Context } from 'aws-lambda';
import { createServer, proxy, Response } from 'aws-serverless-express';

let cachedServer: Server;

async function createExpressApp(
  expressApp: Express,
): Promise<INestApplication> {
  return await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
}

async function bootstrap(): Promise<Server> {
  const expressApp = express();
  const app = await createExpressApp(expressApp);
  await app.init();
  return createServer(expressApp);
}

export async function handler(event: any, context: Context): Promise<Response> {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return proxy(cachedServer, event, context, 'PROMISE').promise;
}
