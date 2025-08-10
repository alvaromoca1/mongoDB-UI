import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConnModule } from './connections/conn.module';
import { SessionsModule } from './sessions/sessions.module';
import { ExplorerModule } from './explorer/explorer.module';
import { CrudModule } from './crud/crud.module';
import { AggregateModule } from './aggregate/aggregate.module';
import { IndexesModule } from './indexes/indexes.module';
import { TransferModule } from './transfer/transfer.module';
import { AnalysisModule } from './analysis/analysis.module';
import { UsersModule } from './users/users.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [
    AuthModule,
    ConnModule,
    SessionsModule,
    ExplorerModule,
    CrudModule,
    AggregateModule,
    IndexesModule,
    TransferModule,
    AnalysisModule,
    UsersModule,
    StreamModule,
  ],
})
export class AppModule {}


