import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
  validateSync,
} from 'class-validator';

class AppVariables {
  @Matches(/^([/][a-z]+[a-z\d-]*)+$/)
  prefix: string;

  @Min(1024)
  @Max(49151)
  port: number;

  @IsBoolean()
  referrerPolicy: boolean;

  @IsBoolean()
  contentSecurityPolicy: boolean;
}

class JWTVariables {
  @IsString()
  secret: string;

  @Matches(/^[\d]+(ms|s|m|h|d)$/)
  expiresIn: string;
}

class ApolloServices {
  @IsString()
  name: string;

  @IsString()
  url: string;
}

// class ApolloVariables {
//   @IsString()
//   @IsOptional()
//   key?: string;
// }

class GatewayVariables {
  @IsString()
  @IsOptional()
  key?: string;

  @IsBoolean()
  debug: boolean;

  @IsBoolean()
  serviceHealthCheck: boolean;

  @ValidateNested({ each: true })
  @IsOptional()
  services?: ApolloServices[];
}

class EnvironmentVariables {
  @ValidateNested({ each: true })
  app: AppVariables;

  @ValidateNested({ each: true })
  jwt: JWTVariables;

  // @ValidateNested({ each: true })
  // apollo: ApolloVariables;

  @ValidateNested({ each: true })
  gateway: GatewayVariables;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
