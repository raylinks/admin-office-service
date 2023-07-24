import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { GetUsersDTO } from './dto/get-users.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { HttpResponse } from 'src/reponses/http.response';
import { UserService } from './user.service';
import { GetNairaWalletTransactionsDto } from './dto/get-naira-wallet-transactions.dto';
import { UpdateAccountInformationDTO } from './dto/update-account-information.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionAssetSymbolDto } from './dto/transaction-asset-symbol.dto';
import { BlacklistUserDTO } from './dto/blacklist-user.dto';

@Controller('user')
export class UserController {
   constructor(
    private readonly userService: UserService,
       private response: HttpResponse,
     ) {}


  @Get('/')
  async fetchUsersDetails(@Query() query: GetUsersDTO,@Res() res: Response) {
    const users = await this.userService.index(query);
     return this.response.okResponse(res, 'Fetched users successfully', users);
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

   @Get('wallet/transactions/:id')
  async getWalletTransactions(
    @Param('id') id: string,
    @Body() payload:  TransactionAssetSymbolDto,
    @Query() query: QueryTransactionsDto,
    @Res() res: Response
  ) {
    const userWallet =  await this.userService.userWalletTransactions(id,payload,query);
    return this.response.okResponse(res, 'Fetched user wallet successfully', userWallet);
  }

   @Post('update/:id')
  async updateUserInformation(@Res() res: Response,@Param('id') id: string,  @Body() payload:  UpdateAccountInformationDTO) {
    const updatedUserInformation = await this.userService.updateUserInformation(id,payload); 
     return this.response.okResponse(res, 'User information updated successfully', updatedUserInformation);
  }

   @Post('delete/:id')
  async deleteUserAccount(@Res() res: Response, @Param('id') id: string) {
    const deletedUser = await this.userService.deleteUserAccount(id); 
     return this.response.okResponse(res, 'User deleted successfully', deletedUser);
  }

   @Post('blacklist/:id')
  async blacklistUserAccount(@Res() res: Response,@Param('id') id: string, @Body() payload:BlacklistUserDTO) {
    const blacklist = await this.userService.blacklistUserAccount(id,payload); 
    return this.response.okResponse(res, 'User blacklisted successfully', blacklist);
  }

   @Post('disable/2fa/:id')
  async disable2FA(@Res() res: Response,@Param('id') id: string) {
    const disable2FA = await this.userService.disable2FA(id); 
     return this.response.okResponse(res, 'User 2FA disabled successfully', disable2FA);
  }
}