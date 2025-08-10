import { Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [ExplorerController], providers: [SessionsService] })
export class ExplorerModule {}


