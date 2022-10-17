import { EnvironmentConfigs } from './interface';
import * as dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/.env` });

export const envConfigs: EnvironmentConfigs = {
  ENV_FILE_PATH: `${__dirname}/.env`,
  DATABASE_CONFIG: {
    DATABASE_HOST: process.env.MONGODB_DEFAULT_HOST + '',
    DATABASE_PREFIX: process.env.MONGODB_DEFAULT_PREFIX + '',
    DATABASE_USERNAME: process.env.MONGODB_DEFAULT_USER + '',
    DATABASE_PASSWORD: process.env.MONGODB_DEFAULT_PASS + '',
    DATABASE_NAME: process.env.MONGODB_APP_DATABASE + '',
  },
  EMAIL_CONFIG: {
    VERIFY_EMAIL: `src/templates/verify-email.template.hbs`,
  },
  JWT_SECRET: process.env.JWT_SECRET + '',
  ACCESS_TOKEN_EXPIRED: process.env.ACCESS_TOKEN_EXPIRED + '',
  REFRESH_TOKEN_EXPIRED: process.env.REFERSH_TOKEN_EXPIRED + '',
};
