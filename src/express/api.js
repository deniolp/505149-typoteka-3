'use strict';

const axios = require(`axios`).default;

const {getLogger} = require(`../lib/logger`);
const {API_PORT, APP_URL} = require(`../../config`);

const TIMEOUT = 1000;
const defaultUrl = `${APP_URL}:${API_PORT}/api/`;

const logger = getLogger({
  name: `api-axios`,
});

class API {
  constructor(baseUrl, timeout) {
    this._baseUrl = baseUrl;
    this._timeout = timeout;
  }

  async getArticles() {
    const {data: articles} = await axios.get(`${this._baseUrl}articles`);
    return articles;
  }

  async getArticle(id) {
    try {
      const {data: article} = await axios.get(`${this._baseUrl}articles/${id}`);
      return article;
    } catch (error) {
      return logger.error(`Did not find article: ${error.message}`);
    }
  }

  async search(query) {
    try {
      const {data: articles} = await axios.get(`${this._baseUrl}search?query=${query}`);
      return articles;
    } catch (error) {
      return logger.error(`Error while search: ${error.message}`);
    }
  }

  async getCategories() {
    const {data: categories} = await axios.get(`${this._baseUrl}categories`);
    return categories;
  }

  async getArticlesByCategory(id) {
    const {data: articles} = await axios.get(`${this._baseUrl}categories/${id}`);
    return articles;
  }

  async createArticle(data) {
    try {
      const {data: article} = await axios({
        method: `post`,
        url: `${this._baseUrl}articles`,
        data
      });
      return article;
    } catch (error) {
      return logger.error(`Can not create article: ${error.message}`);
    }
  }

  async getComments(id) {
    const {data: comments} = await axios.get(`${this._baseUrl}articles/${id}/comments`);
    return comments;
  }
}

const defaultAPI = new API(defaultUrl, TIMEOUT);

module.exports = {
  API,
  getAPI: () => defaultAPI,
};
