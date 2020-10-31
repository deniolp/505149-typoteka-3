'use strict';

const {Router} = require(`express`);
const {DateTimeFormat} = require(`intl`);
const formidable = require(`formidable`);
const path = require(`path`);

const {getLogger} = require(`../../lib/logger`);
const {dateToTime} = require(`../../lib/utils`);
const api = require(`../api`).getAPI();

const UPLOAD_DIR = `../upload/img/`;

const articlesRouter = new Router();

const uploadDirAbsolute = path.resolve(__dirname, UPLOAD_DIR);

const logger = getLogger({
  name: `front-server-formidable`,
});

articlesRouter.get(`/add`, async (req, res) => {
  const categories = await api.getCategories();
  res.render(`new-post`, {DateTimeFormat, title: `Публикация`, categories});
});

articlesRouter.post(`/add`, async (req, res) => {
  const categories = await api.getCategories();
  const allowedTypes = [`image/jpeg`, `image/png`];
  let isAllowedFormat;
  let article = {category: []};

  const formData = new formidable.IncomingForm({maxFileSize: 2 * 1024 * 1024});
  try {
    formData.parse(req)
      .on(`field`, (name, field) => {
        if (name === `category`) {
          article[name].push(field);
        } else {
          article[name] = field;
        }
      })
      .on(`fileBegin`, (name, file) => {
        if (!allowedTypes.includes(file.type)) {
          isAllowedFormat = false;
        } else {
          isAllowedFormat = true;
          file.path = uploadDirAbsolute + `/` + file.name;
        }
      })
      .on(`file`, (name, file) => {
        article.picture = file.path.match(/\/([^\/]+)\/?$/)[1];
      })
      .on(`aborted`, () => {
        logger.error(`Request aborted by the user.`);
      })
      .on(`error`, async (err) => {
        logger.error(`There is error while parsing form data. ${err}`);

        if (article.createdDate) {
          article.createdDate = new Date(dateToTime(`d.m.y`, article.createdDate)).toISOString();
        } else {
          article.createdDate = Date.now();
        }

        article.picture = ``;
        if (categories.length === 0) {
          categories = await api.getCategories();
        }

        res.render(`new-post`, {article, DateTimeFormat, title: `Публикация`, categories});
      })
      .on(`end`, async () => {
        if (!article.createdDate) {
          article.createdDate = new DateTimeFormat(`ru-Ru`, {day: `numeric`, month: `numeric`, year: `numeric`, hour: `numeric`, minute: `numeric`, second: `numeric`}).format(Date.now());
        }
        if (isAllowedFormat) {
          await api.createArticle(article);
          res.redirect(`/my`);
        } else {
          formData.emit(`error`, `Not correct file's extension.`);
        }
      });
  } catch (error) {
    logger.error(`Error happened: ${error}`);
  }
});

articlesRouter.get(`/categories`, async (req, res) => {
  const categories = await api.getCategories();

  res.render(`all-categories`, {title: `Категории`, categories});
});

articlesRouter.get(`/category/:id`, async (req, res) => {
  const {id} = req.params;
  const categories = await api.getCategories();
  const selectedCategory = categories[id - 1];
  const articlesByCategory = await api.getArticlesByCategory(id);

  res.render(`articles-by-category`, {title: `Статьи по категории`, categories, selectedCategory, articlesByCategory, id, DateTimeFormat});
});

articlesRouter.get(`/:id`, async (req, res) => {
  const {id} = req.params;
  const article = await api.getArticle(id);
  const categories = await api.getCategories();

  res.render(`post`, {DateTimeFormat, article, title: `Пост`, categories});
});

articlesRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  const categories = await api.getCategories();
  const article = await api.getArticle(id);
  if (categories.length === 0) {
    categories = await api.getCategories();
  }

  if (article) {
    res.render(`new-post`, {article, DateTimeFormat, title: `Публикация`, categories});
  } else {
    res.status(404).render(`errors/404`, {title: `Страница не найдена`});
  }
});

module.exports = articlesRouter;