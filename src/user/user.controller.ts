import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { GetUsersDTO } from './dto/get-users.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { HttpResponse } from 'src/reponses/http.response';
import { UserService } from './user.service';
import { GetNairaWalletTransactionsDto } from './dto/get-naira-wallet-transactions.dto';
import { UpdateAccountInformationDTO } from './dto/update-account-information.dto';

@Controller('user')
export class UserController {
   constructor(
    private readonly userService: UserService,
       private response: HttpResponse,
     ) {}


  @Get('/')
  async fetchUsersDetails(@Query() query: GetUsersDTO) {
    return await this.userService.index(query);
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

   @Post('update/:id')
  async updateUserInformation(@Param('id') id: string,  @Body() payload:  UpdateAccountInformationDTO) {
    return  await this.userService.updateUserInformation(id,payload); 
  }

   @Post('delete/:id')
  async deleteUserAccount(@Param('id') id: string) {
    return  await this.userService.deleteUserAccount(id); 
  }

   @Post('blacklist/:id')
  async blacklistUserAccount(@Param('id') id: string) {
    return  await this.userService.blacklistUserAccount(id); 
  }

   @Post('disable/2fa/:id')
  async disable2FA(@Param('id') id: string) {
    return  await this.userService.disable2FA(id); 
  }
}