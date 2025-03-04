/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const modules = require('../util/modules');
const mysql = require('../util/db');
const client = modules.redis.createClient(process.env.REDIS_PORT);

function videoInfo() {
  return new Promise(function(resolve, reject) {
    client.get('video', function(err, data) {
      if (err) {
        reject(new modules.Err(500, `Redis Error: ${err}`));
        return;
      }
      if (data) {
        resolve(JSON.parse(data));
      } else {
        mysql.con.query('SELECT * FROM video', function(err, result) {
          if (err) {
            reject(new module.Err(500, `Query Error in video Table: ${err}`));
            return;
          }
          body = {};
          if (result.length === 0) {
            body.data = [];
          } else {
            result.forEach(function(ele) {
              ele.subtitle = JSON.parse(ele.subtitle);
            });
            body.data = result;
            client.set('video', JSON.stringify(body));
            client.expire('video', 3600);
          }
          resolve(body);
        });
      }
    });
  });
}
module.exports = {
  videoInfo,
};
