const modules = require('../util/modules');
const mysql = require('../util/db');
const REDIS_PORT = process.env.PORT || 6379;
const client = modules.redis.createClient(REDIS_PORT);

function videoInfo() {
    return new Promise(function (resolve, reject) {
        client.get('video', function (err, data) {
            if (err) reject(`Redis Error: ${err}, line number is 8`);
            else if (data) {
                resolve(JSON.parse(data));
            }
            else {
                mysql.con.query('SELECT * FROM video', function (err, result) {
                    if (err) reject({ code: 500, error: `Query Error in video Table, the number line is 15: ${err}` });
                    else {
                        body = {};
                        if (result.length === 0) body.data = [];
                        else {
                            console.log('fetch data in noticeModel.js');
                            result.forEach(function (ele) { ele.subtitle = JSON.parse(ele.subtitle); });
                            // result.subtitle = JSON.parse(result.subtitle);
                            client.set('video', JSON.stringify(result));
                            client.expire('video', 3600);
                            body.data = result;
                        }
                        resolve(body);
                    }
                });
            }
        });

    });

}
module.exports = { videoInfo };