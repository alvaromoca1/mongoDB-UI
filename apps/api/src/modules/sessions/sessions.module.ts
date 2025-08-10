import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [
    {
      provide: SessionsService,
      useClass: SessionsService,
    },
  ],
  exports: [SessionsService],
})
export class SessionsModule {}


