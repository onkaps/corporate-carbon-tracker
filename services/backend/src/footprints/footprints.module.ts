import { Module } from '@nestjs/common';
import { FootprintsService } from './footprints.service';
import { FootprintsController } from './footprints.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MlModule } from '../ml/ml.module';

@Module({
  imports: [PrismaModule, MlModule],
  controllers: [FootprintsController],
  providers: [FootprintsService],
  exports: [FootprintsService],
})
export class FootprintsModule {}