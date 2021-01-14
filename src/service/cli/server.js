'use strict';

const express = require(`express`);

const {HttpCode} = require(`../../constants`);
const createApi = require(`../api`);
const {getLogger} = require(`../../lib/logger`);
const {API_PORT} = require(`../../../config`);
const {sequelize} = require(`../database`);
const {ExitCode} = require(`../../constants`);

const logger = getLogger({
  name: `api-server`,
});

const createApp = async () => {
  const app = express();
  const apiRoutes = await createApi();

  app.use(express.json());
  app.use((req, res, next) => {
    logger.debug(`Start request to url ${req.url}`);
    res.on(`finish`, () => {
      logger.info(`Response status code: ${res.statusCode}`);
    });

    next();
  });
  app.use(`/api`, apiRoutes);

  app.use((req, res) => {
    logger.error(`Route was not found: ${req.url}`);
    return res.status(HttpCode.NOT_FOUND)
      .send(`Route was not found: ${req.url}`);
  });

  app.use((err, _req, _res, _next) => {
    logger.error(`An error occured on processing request: ${err.message}`);
  });

  return app;
};

module.exports = {
  name: `--server`,
  createApp,
  async run(args) {
    const app = await createApp();
    const [customPort] = args;
    const port = Number.parseInt(customPort, 10) || API_PORT;

    try {
      logger.info(`Trying to connect to the database`);

      const result = await sequelize.sync();

      logger.info(`Successfully connected to ${result.config.database} database`);
    } catch (error) {
      logger.error(`Can not connect to database. Error: ${error}`);

      process.exit(ExitCode.error);
    }

    app.listen(port, (err) => {
      if (err) {
        return logger.error(`Ошибка при создании сервера: ${err}`);
      }

      return logger.info(`Ожидаю соединений на ${port} порт`);
    });
  }
};
