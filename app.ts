import express, { Application } from 'express';
import * as signale from 'signale';
import * as dotenv from 'dotenv';
import { envConfigs } from './src/configs/environment';
import databaseConfig from './src/configs/databases';
import registerRoute from './src/configs/route';
import middlewareConfig from './src/configs/middleware';
import errorConfig from './src/configs/error';
import initialSocket from './src/libs/sockets';
import contestService from './src/api/contests/contest.service';

const app: Application = express();
dotenv.config({ path: envConfigs.ENV_FILE_PATH });
signale.success(`[App] environment config successful`);
databaseConfig();
middlewareConfig(app);
signale.success(`[App] middleware config successful`);
registerRoute(app);
errorConfig(app);
signale.success(`[App] error handling config successful`);
const server = initialSocket(app);
signale.success(`[App] Socket initial successful`);

const CrobJob = require('cron').CronJob;

new CrobJob('*/1 * * * *', () => {
  contestService.autoEndContest();
}).start();


server.listen(process.env.OJP_DEFAULT_PORT, function () {
  signale.success(
    `[App] server started on port: ${process.env.OJP_DEFAULT_PORT}`,
  );
});

export default app;
