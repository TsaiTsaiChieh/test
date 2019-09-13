const mysql = require('../util/db');

function get(id) {
    return new Promise(function (resolve, reject) {
        mysql.con.query(`SELECT * FROM pet WHERE id=${id} AND status = 0`, function (err, result) {
            if (err) {
                reject(`Query Error in Table pet: ${err}, line number is 5`);
            }
            else if (result.length == 0) {
                reject('id Error in pet Table');
            }
            else {
                resolve(parseResult(result)[0]);
            }
        });
    });
}
function list(category, sex, paging, size) {
    let offset = paging * size;
    console.log(category, sex);
    return new Promise(function (resolve, reject) {
        // filter = parseKind(category);
        let filter = parseFilter(category, sex);
        if (filter == null) reject({ error: "Wrong Request" });
        mysql.con.query(`SELECT COUNT(id) AS total FROM pet ${filter}`, function (err, result) {
            let body = {};
            if (err) reject(`Query Error in pet Table: ${err}, line number is 24`);
            else {
                maxPage = Math.floor(result[0].total / size);
                if (paging < maxPage) body.paging = paging + 1;

                mysql.con.query(`SELECT * FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
                    if (err) reject(`Query Error in pet Table: ${err}, line number is 31`);
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
function count(kind, sex, size) {
    if (kind == undefined) kind = '';
    return new Promise(function (resolve, reject) {
        let filter = parseFilter(kind, sex);
        mysql.con.query(`SELECT COUNT(id) AS count FROM pet ${filter}`, function (err, result) {
            if (err) reject(`Query Error in pet Table: ${err}, line number is 52`);
            else resolve({ total: result[0].count, lastPage: Math.ceil(result[0].count / size) - 1 });
        });
    });
}
function parseFilter(kind, sex) {
    console.log(`in filter: kind=${kind},sex=${sex}`);
    let filter;
    if (kind === '' || kind === 'all') filter = 'WHERE status = 0';
    else if (kind === 'cat') filter = `WHERE status = 0 AND kind='貓'`;
    else if (kind === 'dog') filter = `WHERE status = 0 AND kind='狗'`;
    // sex
    if (sex) filter = filter.concat(` AND sex='${sex}'`);
    console.log(filter);
    return filter;

}
function parseKind(kind) {
    switch (kind) {
        case 'all': case '':
            return 'WHERE status = 0';
        case 'cat':
            return `WHERE kind = '貓' AND status = 0`;
        case 'dog':
            return `WHERE kind = '狗' AND status = 0`;
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