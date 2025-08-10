import { Module } from '@nestjs/common';
import { ConnController } from './conn.controller';
import { ConnService } from './conn.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({ imports: [SessionsModule], controllers: [ConnController], providers: [ConnService] })
export class ConnModule {}


