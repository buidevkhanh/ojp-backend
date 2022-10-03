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
};
