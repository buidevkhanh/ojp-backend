import { Application } from 'express';
import * as bodyParser from 'body-parser';

export default function (app: Application) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(require('cors')());
}
