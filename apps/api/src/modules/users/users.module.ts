import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [UsersController], providers: [SessionsService] })
export class UsersModule {}


