'use strict';

const express = require(`express`);
const path = require(`path`);

const myRoutes = require(`./routes/my-routes`);
const articlesRoutes = require(`./routes/articles-routes`);
const searchRoutes = require(`./routes/search-routes`);
const mainRoutes = require(`./routes/main-routes`);
const {getLogger} = require(`../lib/logger`);

const logger = getLogger({
  name: `front-server`,
});

const app = express();
const port = 8080;
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, `files`)));

app.set(`views`, path.join(__dirname, `templates`));
app.set(`view engine`, `pug`);

app.use(`/`, mainRoutes);
app.use(`/my`, myRoutes);
app.use(`/articles`, articlesRoutes);
app.use(`/search`, searchRoutes);

app.use((req, res) => {
  res.status(404).render(`errors/404`, {title: `Страница не найдена`});
});

app.use((err, req, res, _next) => {
  res.status(err.status || 500);
  res.render(`errors/500`, {title: `Ошибка сервера`});
});

app.listen(port, (err) => {
  if (err) {
    return logger.error(`Ошибка при создании сервера: ${err}`);
  }

  return logger.info(`Ожидаю соединений на ${port} порт`);
});
