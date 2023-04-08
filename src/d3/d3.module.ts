import { Module } from '@nestjs/common';
import { D3Controller } from './d3.controller';

@Module({
  controllers: [D3Controller],
  providers: []
})
export class D3Module {}
