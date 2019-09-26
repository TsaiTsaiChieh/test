const mysql = require('../util/db');
const modules = require('../util/modules');
const REDIS_PORT = process.env.PORT || 6379;
const client = modules.redis.createClient(REDIS_PORT);
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
function list(category, sex, region, order, age, paging, size) {
    // console.log(`category:${category},sex:${sex},region:${region},order:${order},age:${age}`);

    let offset = paging * size;
    return new Promise(function (resolve, reject) {
        let filter = parseFilter(category, sex, region, order, age);
        if (filter == null) reject({ error: "Wrong Request" });
        mysql.con.query(`SELECT COUNT(pet.id) AS total FROM pet ${filter}`, function (err, result) {
            let body = {};
            if (err) reject(`Query Error in pet Table: ${err}, line number is 24`);
            else {
                maxPage = Math.floor(result[0].total / size);
                if (paging < maxPage) body.paging = paging + 1;
                // console.log(`SELECT pet.* FROM pet ${filter}`);

                mysql.con.query(`SELECT pet.* FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
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
function count(kind, sex, region, order, age, size) {
    if (kind == undefined) kind = '';
    return new Promise(function (resolve, reject) {
        let filter = parseFilter(kind, sex, region, order, age);
        if (age === 'A,C') age = '';
        // 1. Every time we need campaign data, check cache first.
        client.get(`count_${kind}_${sex}_${age}_${order}`, function (err, data) {
            if (err) throw err;
            else if (data) {
                console.log('cache:', JSON.parse(data));
                resolve(JSON.parse(data)); // 2. If data existed in the cache, get it.
            }
            else {
                mysql.con.query(`SELECT COUNT(pet.id) AS count FROM pet ${filter}`, function (err, result) {
                    if (err) reject(`Query Error in pet Table: ${err}, line number is 54`);
                    else {
                        console.log('fetch data');
                        // 3. If there is no data in the cache, get it from database and store in the cache.
                        client.set(`count_${kind}_${sex}_${age}_${order}`, JSON.stringify({ total: result[0].count, lastPage: Math.ceil(result[0].count / size) - 1 }));
                        resolve({ total: result[0].count, lastPage: Math.ceil(result[0].count / size) - 1 });
                    }
                });
            }
        });
    });
}
function parseFilter(kind, sex, region, order, age) {
    let filter = '';
    if (region) {
        filter = 'LEFT JOIN area ON pet.county = area.county ';
    }
    // kind
    if (kind === '' || kind === 'all') filter = filter.concat('WHERE status = 0');
    else if (kind === 'cat') filter = filter.concat(`WHERE status = 0 AND kind='貓'`);
    else if (kind === 'dog') filter = filter.concat(`WHERE status = 0 AND kind='狗'`);
    // sex
    if (sex) filter = filter.concat(` AND sex='${sex}'`);
    // age
    if (age) {
        age = age.split(',');
        if (age.length == 2); // do nothing
        else filter = filter.concat(` AND age='${age}'`);
    }

    // region
    if (region) {
        region = region.split(',');
        if (region.length === 1) filter = filter.concat(` AND area.area = ${region}`);
        else {
            filter = filter.concat(' AND ');
            region.forEach(function (element) {
                filter = filter.concat(`area.area = ${element} OR `);
            });
            filter = filter.substring(0, filter.length - 3);
        }
    }
    if (order)
        filter = filter.concat(' ORDER BY pet.id DESC');
    // console.log(filter);

    return filter;

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