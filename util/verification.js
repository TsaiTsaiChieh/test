/* eslint-disable max-len */
const mysql = require('../util/db');

function token(req, res, next) {
  const {authorization} = req.headers;
  if (!authorization) {
    res.status(406);
    res.send('Invalid token');
    return;
  }
  if (authorization) {
    const token = authorization.replace('Bearer ', '');

    // IF(expr1,expr2,expr3): if expr1 is ture, return expr2; else return expr3
    // TIMESTAMPDIFF(unit, begin, end)
    const searchUserSQL = `SELECT user_id, IF( TIMESTAMPDIFF(SECOND,created, NOW()) > access_expired,'Yes','No') AS expiredResult FROM token WHERE access_token = '${token}'`;

    mysql.con.query(searchUserSQL, function(err, result) {
      // result[0].expiredResult = 'Yes';
      if (err) {
        res.status(500);
        res.send(`Query Error in token Table: ${err}`);
        return;
      }
      if (result.length === 0) {
        res.status(406);
        res.send('Invalid token');
        return;
      }
      if (result[0].expiredResult === 'Yes') {
        res.status(408);
        res.send('Token expired');
        return;
      }
      req.userId = result[0].user_id;
      next();
    });
  }
}
module.exports = {token};
