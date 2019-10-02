/* eslint-disable require-jsdoc */
const noticeModel = require('../model/noticeModel');

function videoInfo(req, res) {
  noticeModel
      .videoInfo()
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res(err.status);
        res(`${err.error}, line number is ${err.line}`);
      });
}
module.exports = {videoInfo};
