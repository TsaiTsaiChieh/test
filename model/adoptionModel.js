const mysql = require('../util/db');

function get(id) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`SELECT * FROM pet WHERE id=${id}`, function (err, result) {
            if (err) {
                reject(`Query Error in Table pet: ${err}`);
            }
            else if (result.length == 0) {
                reject('id Error in pet Table');
            }
            else {
                resolve(parseResult(result));
            }
        });
    });
}
function list(category, paging, size) {
    let offset = paging * size;
    let filter;
    return new Promise(function (resolve, reject) {
        filter = parseKind(category);
        if (filter == null) reject({ error: "Wrong Request" });
        mysql.con.query(`SELECT COUNT(id) AS total FROM pet ${filter}`, function (err, result) {
            let body = {};
            if (err) reject(`Query Error in pet Table: ${err}`);
            else {
                maxPage = Math.floor(result[0].total / size);
                if (paging < maxPage) body.paging = paging + 1;

                mysql.con.query(`SELECT * FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
                    if (err) reject(`Query Error in pet Table: ${err}`);
                    else {
                        if (result.length == 0) {
                            body.data = [];
                        }
                        else {
                            parseResult(result);
                            body.data = result;
                        }
                        resolve(body);
                    }
                });
            }
        });
    });
}
function count(kind, size) {
    if (kind == undefined) kind = '';
    return new Promise(function (resolve, reject) {
        let filter = parseKind(kind);
        mysql.con.query(`SELECT COUNT(id) AS count FROM pet ${filter}`, function (err, result) {
            if (err) reject(`Query Error in pet Table: ${err}`);
            else resolve({ total: result[0].count, lastPage: Math.ceil(result[0].count / size) - 1 });
        });
    });
}
function parseKind(kind) {
    switch (kind) {
        case 'all': case '':
            return '';
        case 'cat':
            return `WHERE kind = '貓'`;
        case 'dog':
            return `WHERE kind = '狗'`;
        default:
            return null;
    }
}
function parseResult(result) {
    for (let i = 0; i < result.length; i++) {
        result[i].image = JSON.parse(result[i].image);
        result[i].description = JSON.parse(result[i].description);
        result[i].habit = JSON.parse(result[i].habit);
        result[i].story = JSON.parse(result[i].story);
        result[i].limitation = JSON.parse(result[i].limitation);
    }
    return result;
}
module.exports = { list, get, count }