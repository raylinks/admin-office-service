import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientKafka, ClientProxy, ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { GetUsersDTO } from './dto/get-users.dto';
import { lastValueFrom } from 'rxjs';
import { ExportDataDto } from './dto/export-data.dto';

@Injectable()
export class UserService {

     constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
    @Inject(RMQ_NAMES.USERDATA_SERVICE) private userClient: ClientRMQ,
  ) {}

  async index(query: GetUsersDTO) {
      try{
      const users = await lastValueFrom(
      this.userClient.send({ cmd:'admin.user'},query)
    );
       return users;
    }
    catch(error){
    }
 
  }

  async getUserById(id: any) {

    const user = await this.userDb.collection('users').find({_id: id});

    if(!user.toArray()){throw new BadRequestException('user not found')}

    return user.toArray(); 
  }

  async exportUsers(payload:ExportDataDto) {
      try{
      const exportedUsers = await lastValueFrom(
      this.userClient.send('admin.user.export', payload)
    );
       return exportedUsers;
    }
    catch(error){
   
    }
 
  }

  async exportFiatAssets(payload:ExportDataDto) {
      try{
      const exportedFiatAssets = await lastValueFrom(
      this.walletClient.send('admin.export.fiat', payload)
    );
       return exportedFiatAssets;
    }
    catch(error){
   
    }
 
  }

  async exportCryptoAssets(payload:ExportDataDto) {
      try{
      const exportedCryptoAssets = await lastValueFrom(
      this.walletClient.send('admin.export.crypto', payload)
    );
       return exportedCryptoAssets;
    }
    catch(error){
   
    }
 
  }

  async usersBalance(userId: string) {
    try{
    const balances = await lastValueFrom(
      this.walletClient.send('admin.wallet.balance',userId),
    );
       return balances;
    }catch(error){
    }
  }

  async userWalletTransactions(id:string, payload, query) {
    try{
    const userTransaction = await lastValueFrom(
      this.walletClient.send('admin.transaction',{id,payload,query})
    );
       return userTransaction;
    }catch(error){
    }
  }

   async updateUserInformation(id:string, payload) {
    try{
    const upatedInfo = await lastValueFrom(
      this.userClient.send('admin.update.user-account',{id,payload})
    );
       return upatedInfo;
    }catch(error){
    }
  }

  async deleteUserAccount(id:string) {
    try{
    const deletedUser = await lastValueFrom(
      this.userClient.send('admin.delete.user-account',{id})
    );
       return deletedUser;
    }catch(error){
    }
  }

   async blacklistUserAccount(id:string,payload) {
    try{
    const blacklistedUser = await lastValueFrom(
      this.userClient.send('admin.blacklist.user-account',{id,payload})
    );
       return blacklistedUser;
    }catch(error){
    }
  }

  async disable2FA(id:string) {
    try{
    const disabledUser2FA = await lastValueFrom(
      this.userClient.send('admin.disable.2fa',{id})
    );
       return disabledUser2FA;
    }catch(error){
    }
  }
}
