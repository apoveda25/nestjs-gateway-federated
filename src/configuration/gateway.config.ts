import { RemoteGraphQLDataSource } from '@apollo/gateway/dist/datasources';
import { ConfigService } from '@nestjs/config';
import { GraphQLRequest, GraphQLResponse } from 'apollo-server-types';
import { sign, verify } from 'jsonwebtoken';
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
    const payload: unknown = context.jwt
      ? verify(context.jwt, this.configService.get<string>('jwt.secret'))
      : { sub: '' };

    request.http.headers.set('x-user-id', payload['sub']);
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
      cors: configService.get('apolloServer.cors'),
    }),
  },
});
