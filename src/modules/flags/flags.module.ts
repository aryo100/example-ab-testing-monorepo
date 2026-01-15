import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagsController } from './flags.controller';
import { VariantsService } from './variants.service';
import { VariantsController } from './variants.controller';

@Module({
  controllers: [FlagsController, VariantsController],
  providers: [FlagsService, VariantsService],
  exports: [FlagsService, VariantsService],
})
export class FlagsModule {}


