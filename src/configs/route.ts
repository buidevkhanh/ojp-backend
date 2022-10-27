import { Application, urlencoded } from 'express';
import * as path from 'path';
import * as glob from 'glob';
import * as signale from 'signale';

export default function (app: Application) {
  const routePaths = glob.sync(
    path.normalize(`${__dirname}/../api/**/*.route.{ts,js}`),
  );
  /**
   * router configuration
   */
  const routes = routePaths.map((routePath) => {
    const childRoute = require(routePath).default;
    const routeName = require(routePath).name;

    signale.success(
      `[Route] route for module [[${routeName}]] has been registed`,
    );
    return childRoute;
  });

  app.use('/api/v1', routes);
}
