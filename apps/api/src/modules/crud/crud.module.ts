import { Module } from '@nestjs/common';
import { CrudController } from './crud.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [CrudController], providers: [SessionsService] })
export class CrudModule {}


