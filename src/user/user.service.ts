import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientKafka, ClientProxy, ClientRMQ } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RMQ_NAMES } from 'src/utils/constants';
import { Db } from 'mongodb';
import { GetUsersDTO } from './dto/get-users.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {

     constructor(
    @Inject('USER_DB_CONNECTION') private userDb: Db,
    @Inject(RMQ_NAMES.WALLET_SERVICE) private walletClient: ClientRMQ,
  ) {}

    async index(query: GetUsersDTO) {
       var pageLen: number, pageNo: number;
      if (query.pageLen && query.pageNo) (pageLen = parseInt(query.pageLen)), (pageNo = parseInt(query.pageNo));
      else throw new BadRequestException('Please provide pageNo and pageLen!')

      const user = await this.userDb.collection('users').aggregate([ 
        {
          $lookup: {
          from: "kyc",
          localField: "id",
          foreignField: "userId",
          as: "kyc_details",
        }
      }
    ]);

      if(!user.toArray()){throw new BadRequestException('user not found')}

        const users = await user.skip((pageNo - 1) * pageLen).limit(pageLen).toArray();

    return users; 
  }

  async getUserById(id: any) {

       const user = await this.userDb.collection('users').find({_id: id});

      if(!user.toArray()){throw new BadRequestException('user not found')}

    return user.toArray(); 
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

  async userNairaWalletTransactions(query) {
    try{
      console.log("here");
    const balances = await lastValueFrom(
      this.walletClient.send('admin.naira.transactions',query),
    );
       return balances;
    }catch(error){
    }
  }

}
