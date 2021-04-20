import { RemoteGraphQLDataSource } from '@apollo/gateway/dist/datasources';
import { ConfigService } from '@nestjs/config';
import { GraphQLRequest, GraphQLResponse } from 'apollo-server-types';
import { sign, verify } from 'jsonwebtoken';
import { AuthService } from '../app/auth/auth.service';
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
    const payload = this.getPayloadOrPayloadDefault(context);

    const { scopes } = await this.getUserScopesOrScopesDefault(payload);

    request.http.headers.set('x-user-id', payload['sub']);
    request.http.headers.set('x-user-scopes', scopes.join(','));
  }

  async didReceiveResponse({
    response,
  }: {
    response: GraphQLResponse;
  }): Promise<GraphQLResponse> {
    if (response.data.signIn) {
      response.data.signIn.token = sign(
        JSON.parse(response.data.signIn.token),
        this.configService.get<string>('jwt.secret'),
        { expiresIn: this.configService.get<string>('jwt.expiresIn') },
      );
    }

    return response;
  }

  private getPayloadOrPayloadDefault(context: IContext) {
    return context.jwt
      ? verify(context.jwt, this.configService.get<string>('jwt.secret'))
      : { sub: '' };
  }

  private async getUserScopesOrScopesDefault(
    payload: Record<string, any> | string,
  ) {
    return payload['sub'] !== ''
      ? await this.authService.searchUserScopes({
          _id: payload['sub'],
        })
      : { scopes: [] };
  }
}

export const gatewayConfigFactory = async (configService: ConfigService) => ({
  gateway: {
    serviceList: configService.get('apollo.key')
      ? []
      : configService.get('services'),
  },
  server: {
    context: ({ req }) => ({
      jwt: req.headers.authorization
        ? req.headers.authorization.replace('Bearer ', '')
        : null,
    }),
  },
});
