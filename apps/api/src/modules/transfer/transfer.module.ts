import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [TransferController], providers: [SessionsService] })
export class TransferModule {}


