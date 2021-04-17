import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
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
}

class ServiceVariable {
  @IsString()
  name: string;

  @IsUrl()
  url: string;
}

class JWTVariables {
  @IsString()
  secret: string;

  @Matches(/^[\d]+(ms|s|m|h|d)$/)
  expiresIn: string;
}

class ApolloVariables {
  @IsString()
  @IsOptional()
  key?: string;
}

class ApolloServerVariables {
  @IsBoolean()
  cors: boolean;
}

class EnvironmentVariables {
  @ValidateNested({ each: true })
  app: AppVariables;

  @ValidateNested({ each: true })
  services: ServiceVariable[];

  @ValidateNested({ each: true })
  jwt: JWTVariables;

  @ValidateNested({ each: true })
  apollo: ApolloVariables;

  @ValidateNested({ each: true })
  apolloServer: ApolloServerVariables;
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
