import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Response } from 'express';
import { GetUsersDTO } from './dto/get-users.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { HttpResponse } from 'src/reponses/http.response';
import { UserService } from './user.service';
import { GetNairaWalletTransactionsDto } from './dto/get-naira-wallet-transactions.dto';

@Controller('user')
export class UserController {
   constructor(
    private readonly userService: UserService,
       private response: HttpResponse,
     ) {}


  @Get('/')
  async fetchUsersDetails(@Res() res: Response,@Query() query: GetUsersDTO) {
    const user =  await this.userService.index(query);
     return this.response.okResponse(res, 'Fetched users successfully', user);
  }

   @Get('/:id')
  async fetchUsersDetailsById(@Res() res: Response, @Param('id') id: string) {
    const user =  await this.userService.getUserById(id);
     return this.response.okResponse(res, 'Fetched user successfully', user);
  }

   @Get('balance/:id')
  async fetchUserBalance(@Res() res: Response, @Param('id') id: string) {
    const user =  await this.userService.usersBalance(id); 
     return this.response.okResponse(res, 'Fetched user balance successfully', user);
  }

   @Get('nairawallet/transactions')
  async getNairaWalletTransactions(
     @Query() query: GetNairaWalletTransactionsDto,
  ) {
    return await this.userService.userNairaWalletTransactions(query);
  }
}