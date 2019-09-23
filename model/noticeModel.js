const modules = require('../util/modules');
const mysql = require('../util/db');

function videoInfo() {
    return new Promise(function (resolve, reject) {
        mysql.con.query('SELECT * FROM video', function (err, result) {
            if (err) reject({ code: 500, error: `Query Error in video Table, the number line is 6: ${err}` });
            else {
                body = {};
                if (result.length === 0) body.data = [];
                else {
                    result.forEach(function (ele) { ele.subtitle = JSON.parse(ele.subtitle) });
                    // result.subtitle = JSON.parse(result.subtitle);
                    body.data = result;
                }
                resolve(body);
            }
        });
    });

}
module.exports = { videoInfo };