import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { SessionsService } from '../sessions/sessions.service';

@Module({ controllers: [AnalysisController], providers: [SessionsService] })
export class AnalysisModule {}


