import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { GraphQLError } from 'graphql';
import { IAuthServiceGrpc, IUserId } from './interfaces/auth-service.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private authServiceGrpc: IAuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authServiceGrpc = this.client.getService<IAuthServiceGrpc>(
      'AuthService',
    );
  }

  async searchUserRoleScopes(userId: IUserId) {
    try {
      return await this.authServiceGrpc
        .searchUserRoleScopes(userId)
        .toPromise();
    } catch (error) {
      console.log(error);
      throw new GraphQLError('Internal server error - Auth Service');
    }
  }
}
