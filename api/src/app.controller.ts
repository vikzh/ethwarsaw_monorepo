import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Transaction } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  sendTransaction(transaction: Transaction): string {
    return this.appService.sendTransaction(transaction);
  }
}
