import * as signale from 'signale';
import * as mongoose from 'mongoose';
import { envConfigs } from '../environment';

const mongoUri = `${envConfigs.DATABASE_CONFIG.DATABASE_PREFIX}://${envConfigs.DATABASE_CONFIG.DATABASE_USERNAME}:${envConfigs.DATABASE_CONFIG.DATABASE_PASSWORD}@${envConfigs.DATABASE_CONFIG.DATABASE_HOST}`;

const connectionOptions: mongoose.ConnectOptions = {
  user: envConfigs.DATABASE_CONFIG.DATABASE_USERNAME,
  pass: envConfigs.DATABASE_CONFIG.DATABASE_PASSWORD,
  dbName: envConfigs.DATABASE_CONFIG.DATABASE_NAME,
};

export default function () {
  connectDB();
}

function connectDB(callback?: Function) {
  if (typeof callback !== 'function') callback = function () {};
  let connectBefore = false;
  function connect() {
    if (connectBefore) {
      signale.await('[Database] reconnecting ...');
    }
    mongoose.connect(mongoUri, connectionOptions).then(() => callback);
  }

  connect();

  mongoose.connections.forEach((connection) =>
    connection.on('error', () => {
      signale.error('[Database] connect to database failed');
    }),
  );

  mongoose.connections.forEach((connection) =>
    connection.on('disconnected', () => {
      signale.error('[Database] lost connect');
      if (!connectBefore) {
        setTimeout(connect, 5000);
      }
    }),
  );

  mongoose.connections.forEach((connection) =>
    connection.on('connected', () => {
      signale.success('[Database] connect to database successful');
    }),
  );

  mongoose.connections.forEach((connection) =>
    connection.on('reconnected', () => {
      signale.success('[Database] database reconnected');
    }),
  );
}
