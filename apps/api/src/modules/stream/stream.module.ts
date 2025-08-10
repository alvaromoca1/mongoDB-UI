import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [StreamController], providers: [SessionsService] })
export class StreamModule {}


