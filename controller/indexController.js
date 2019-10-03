/* eslint-disable require-jsdoc */
const indexModel = require('../model/indexModel');

function index(req, res) {
  indexModel
      .index()
      .then(function(body) {
        res.render('index', {body});
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(`${err.error}, line number is ${err.line}`);
      });
}

function adoption(req, res) {
  res.render('adoption');
}

function member(req, res) {
  res.render('member');
}

function notice(req, res) {
  res.render('notice');
}

module.exports = {
  index, adoption, member, notice,
};
