const mysql = require('../util/db');

function list(category, paging, size) {
    let offset = paging * size;
    let filter = '';
    return new Promise(function (resolve, reject) {
        switch (category) {
            case 'all':
                break;
            case 'cat':
                filter = `WHERE kind = '貓'`;
                break;
            case 'dog':
                filter = `WHERE kind = '狗'`;
                break;
            default:
                reject({ error: "Wrong Request" });
        }
        mysql.con.query(`SELECT COUNT(id) AS total FROM pet ${filter}`, function (err, result) {
            let body = {};
            if (err) reject(`Table pet Query Error: ${err}`);
            else {
                maxPage = Math.floor(result[0].total / size);
                if (paging < maxPage) body.paging = paging + 1;

                mysql.con.query(`SELECT * FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
                    if (err) reject(`Table pet Query Error: ${err}`);
                    else {
                        if (result.length == 0) {
                            body.data = [];
                        }
                        else {
                            for (let i = 0; i < result.length; i++) {
                                result[i].image = JSON.parse(result[i].image);
                                result[i].description = JSON.parse(result[i].description);
                                result[i].habit = JSON.parse(result[i].habit);
                                result[i].story = JSON.parse(result[i].story);
                                result[i].limitation = JSON.parse(result[i].limitation);
                            }
                            body.data = result;
                        }
                        resolve(body);
                    }
                });
            }
        });
    });
} //list end
module.exports = { list }