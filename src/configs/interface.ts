export interface EnvironmentConfigs {
  ENV_FILE_PATH: string;
  DATABASE_CONFIG: {
    DATABASE_HOST: string;
    DATABASE_PREFIX: string;
    DATABASE_NAME: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
  };
}
