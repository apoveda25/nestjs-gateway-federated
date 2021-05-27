import { RemoteGraphQLDataSource } from '@apollo/gateway/dist/datasources';
import { ConfigService } from '@nestjs/config';
import { GatewayModuleOptions } from '@nestjs/graphql';
import { GraphQLRequest, GraphQLResponse } from 'apollo-server-types';
import { GraphQLError } from 'graphql';
import { sign, verify } from 'jsonwebtoken';
import { AuthService } from '../app/auth/auth.service';
import { ISearchUser } from '../app/auth/interfaces/auth-service.interface';

export interface IContext {
  jwt: string;
}

export interface IPayload {
  sub: string;
}

export class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  constructor(
    private readonly options: Record<string, unknown>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super(options);
  }

  async willSendRequest({
    request,
    context,
  }: {
    request: GraphQLRequest;
    context: IContext;
  }): Promise<void> {
    const payload = context.jwt ? this.getPayload(context) : { sub: '' };

    const { _id, active, emailActive, role, scopes }: ISearchUser = context.jwt
      ? await this.getUserRoleScopes(payload)
      : {
          _id: '',
          active: false,
          emailActive: false,
          role: { _id: '', _key: '', level: 9 },
          scopes: [],
        };

    request.http.headers.set(
      'x-user',
      JSON.stringify({ _id, active, emailActive }),
    );
    request.http.headers.set('x-role', JSON.stringify(role));
    request.http.headers.set(
      'x-scopes',
      scopes.map((scope: any) => scope.name).join(','),
    );
  }

  async didReceiveResponse({
    response,
  }: {
    response: GraphQLResponse;
  }): Promise<GraphQLResponse> {
    if (response?.data?.signIn) {
      response.data.signIn.token = sign(
        JSON.parse(response.data.signIn.token),
        this.configService.get<string>('jwt.secret'),
        { expiresIn: this.configService.get<string>('jwt.expiresIn') },
      );
    }

    if (response?.data?.login) {
      response.data.login.token = sign(
        JSON.parse(response.data.login.token),
        this.configService.get<string>('jwt.secret'),
        { expiresIn: this.configService.get<string>('jwt.expiresIn') },
      );
    }

    return response;
  }

  private getPayload(context: IContext) {
    return verify(context.jwt, this.configService.get<string>('jwt.secret'));
  }

  private async getUserRoleScopes(
    payload: Record<string, any> | string,
  ): Promise<ISearchUser> {
    return await this.authService.searchUserRoleScopes({
      _id: payload['sub'],
    });
  }
}

export const gatewayConfigFactory = async (
  configService: ConfigService,
): Promise<GatewayModuleOptions> => {
  const gateway = {
    debug: configService.get('gateway.debug'),
    serviceHealthCheck: configService.get('gateway.serviceHealthCheck'),
  };

  if (!configService.get('gateway.key'))
    gateway['serviceList'] = configService.get('gateway.services');

  return {
    gateway,
    server: {
      context: ({ req }) => {
        if (!req.headers.authorization) return { jwt: null };

        if (req.headers.authorization.includes('Bearer '))
          return {
            jwt: req.headers.authorization.replace('Bearer ', ''),
          };

        throw new GraphQLError('Token bearer is bad.');
      },
    },
  };
};
