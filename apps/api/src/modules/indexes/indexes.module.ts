import { Module } from '@nestjs/common';
import { IndexesController } from './indexes.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [IndexesController], providers: [SessionsService] })
export class IndexesModule {}


