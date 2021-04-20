import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GATEWAY_BUILD_SERVICE, GraphQLGatewayModule } from '@nestjs/graphql';
import configuration from './configuration/app.config';
import { ConfigurationModule } from './configuration/configuration.module';
import { gatewayConfigFactory } from './configuration/gateway.config';
import { AuthModule } from './app/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration],
      encoding: 'UTF-8',
    }),
    GraphQLGatewayModule.forRootAsync({
      imports: [ConfigModule, ConfigurationModule],
      inject: [ConfigService, GATEWAY_BUILD_SERVICE],
      useFactory: gatewayConfigFactory,
    }),
    ConfigurationModule,
    AuthModule,
  ],
})
export class AppModule {}
