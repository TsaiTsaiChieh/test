/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const mysql = require('../util/db');
const modules = require('../util/modules');

function index() {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT COUNT(*) AS count FROM pet WHERE kind='狗' AND status=0 
    UNION 
    SELECT COUNT(*) FROM pet WHERE kind='貓' AND status=0`, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 10, `Query Error in pet Table: ${err}`));
      } else {
        resolve({dogCount: result[0].count, catCount: result[1].count});
      }
    });
  });
}
module.exports = {index};
