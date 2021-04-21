import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GATEWAY_BUILD_SERVICE } from '@nestjs/graphql';
import { AuthModule } from '../app/auth/auth.module';
import { AuthService } from '../app/auth/auth.service';
import { AuthenticatedDataSource } from './gateway.config';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      useFactory: (
        AuthenticatedDataSource,
        configService: ConfigService,
        authService: AuthService,
      ) => {
        return ({ name, url }) =>
          new AuthenticatedDataSource(
            { name, url },
            configService,
            authService,
          );
      },
      inject: [AuthenticatedDataSource, ConfigService, AuthService],
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
export class ConfigurationModule {}
