'use strict';

const axios = require(`axios`);

const {getLogger} = require(`../../lib/logger`);

const logger = getLogger();

const HOST = process.env.HOST || `http://localhost:3000/`;

const getComments = async (id) => {
  try {
    const {data: response} = await axios.get(`${HOST}api/articles/${id}/comments`);
    return response;
  } catch (error) {
    return logger.error(error.message);
  }
};

module.exports = getComments;
