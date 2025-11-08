import { Module } from '@nestjs/common';
import { FootprintsService } from './footprints.service';
import { FootprintsController } from './footprints.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FootprintsController],
  providers: [FootprintsService],
  exports: [FootprintsService],
})
export class FootprintsModule {}