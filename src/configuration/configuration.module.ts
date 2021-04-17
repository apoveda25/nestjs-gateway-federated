import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GATEWAY_BUILD_SERVICE } from '@nestjs/graphql';
import { AuthenticatedDataSource } from './gateway.config';

@Module({
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      useFactory: (AuthenticatedDataSource, configService: ConfigService) => {
        return ({ name, url }) =>
          new AuthenticatedDataSource({ name, url }, configService);
      },
      inject: [AuthenticatedDataSource, ConfigService],
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
export class ConfigurationModule {}
