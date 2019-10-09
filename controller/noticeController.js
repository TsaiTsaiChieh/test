/* eslint-disable require-jsdoc */
const noticeModel = require('../model/noticeModel');

function videoInfo(req, res) {
  noticeModel
      .videoInfo()
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.status);
        res.send(err.error);
      });
}
module.exports = {videoInfo};
