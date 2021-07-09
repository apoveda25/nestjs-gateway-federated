import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { validate } from './app.validator';

const YAML_CONFIG_FILENAME =
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'development'
    ? `config.${process.env.NODE_ENV}.yml`
    : 'config.development.yml';

export default () => {
  const config = yaml.load(
    readFileSync(join(`${__dirname}/../../`, YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;

  validate(config);

  if (config.gateway.key) process.env.APOLLO_KEY = config.gateway.key;

  if (config.gateway.graphRef)
    process.env.APOLLO_GRAPH_REF = config.gateway.graphRef;

  return config;
};
