import { Module } from '@nestjs/common';
import { AggregateController } from './aggregate.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [AggregateController], providers: [SessionsService] })
export class AggregateModule {}


