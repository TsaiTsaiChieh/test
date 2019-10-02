/* eslint-disable require-jsdoc */
const adoptionModel = require('../model/adoptionModel');

function get(req, res) {
  const id = parseInt(req.query.id);
  if (!Number.isInteger(id)) {
    res.status(405);
    res.send('Id request is not allowed in pet table');
  } else {
    adoptionModel
        .get(id)
        .then(function(body) {
          res.json(body);
        })
        .catch(function(err) {
          res.status(err.code);
          res.send(`${err.error}, line number is ${err.line}`);
        });
  }
}
function list(req, res) {
  adoptionModel
      .list(req)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(`${err.error}, line number is ${err.line}`);
      });
}
function count(req, res) {
  adoptionModel
      .count(req)
      .then(function(body) {
        res.json(body);
      })
      .catch(function(err) {
        res.status(err.code);
        res.send(`${err.error}, line number is ${err.line}`);
      });
}
function search(req, res) {
  const {kind, sex, region, order, age} = req.body;
  if (!kind || (kind.includes('cat') && kind.includes('dog'))) {
    res.redirect(`/adoption?kind=all&${queryString(sex, region, order, age)}`);
  } else if (kind.includes('cat')) {
    res.redirect(`/adoption?kind=cat&${queryString(sex, region, order, age)}`);
  } else if (kind.includes('dog')) {
    res.redirect(`/adoption?kind=dog&${queryString(sex, region, order, age)}`);
  }
}
function queryString(sex, region, order, age) {
  let searchUrl = '';
  if (sex && region) searchUrl = `sex=${sex}&region=${region}&`;
  else if (region) searchUrl = `region=${region}&`;
  else if (sex) searchUrl = `sex=${sex}&`;
  if (order === 'desc') searchUrl = searchUrl.concat(`order=${order}&`);
  if (age) searchUrl = searchUrl.concat(`age=${age}&`);
  searchUrl = searchUrl.concat('paging=0');
  return searchUrl;
}
module.exports = {
  list, get, search, count,
};
