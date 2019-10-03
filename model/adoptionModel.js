/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const mysql = require('../util/db');
const modules = require('../util/modules');
const REDIS_PORT = process.env.PORT || 6379;
const client = modules.redis.createClient(REDIS_PORT);
const size = 20; // 一頁要 show 幾個

function get(id) {
  return new Promise(function(resolve, reject) {
    mysql.con.query(`SELECT * FROM pet WHERE id = ? AND status = 0`, id, function(err, result) {
      if (err) {
        reject(new modules.Err(500, 13, `Query Error in pet Table: ${err}`));
      } else if (result.length === 0) {
        reject(new modules.Err(404, 15, 'Id not found in pet table'));
      } else {
        resolve(parseResult(result)[0]);
      }
    });
  });
}

function list(req) {
  const category = req.params.category;
  let paging = parseInt(req.query.paging);
  const {sex, region, order, age} = req.query;
  if (!Number.isInteger(paging)) paging = 0;
  const offset = paging * size;
  return new Promise(function(resolve, reject) {
    const filter = parseFilter(category, sex, region, order, age);
    if (filter.length === 0) {
      reject(new modules.Err(405, 32, 'Wrong request is not allowed in pet table'));
    }
    mysql.con.query(`SELECT COUNT(pet.id) AS total FROM pet ${filter}`, function(err, result) {
      const body = {};
      if (err) {
        reject(new modules.Err(500, 37, `Query error in pet Table: ${err}`));
      } else {
        const maxPage = Math.floor(result[0].total / size);
        if (paging < maxPage) body.paging = paging + 1;
        mysql.con.query(`SELECT pet.* FROM pet ${filter} LIMIT ${offset},${size}`, function(err, result) {
          if (err) {
            reject(new modules.Err(500, 43, `Query error in pet Table: ${err}`));
          } else {
            if (result.length == 0) {
              body.data = [];
            } else {
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

function count(req) {
  const {kind, sex, region, order, age} = req.query;
  if (kind === undefined) kind = '';
  return new Promise(function(resolve, reject) {
    const filter = parseFilter(kind, sex, region, order, age);
    if (filter.length === 0) reject(new modules.Err(405, 64, 'Wrong request is not allowed in pet table'));
    if (age === 'A,C') age = 'all';
    // 1. Every time we need campaign data, check cache first.
    client.get(`count_${kind}_${sex}_${age}_${region}`, function(err, data) {
      if (err) reject(new modules.Err(512, 66, `Redis error: ${err}`));
      else if (data) {
        resolve(JSON.parse(data)); // 2. If data existed in the cache, get it.
      } else {
        mysql.con.query(`SELECT COUNT(pet.id) AS count FROM pet ${filter}`, function(err, result) {
          if (err) {
            reject(new modules.Err(500, 74, `Query error in pet Table: ${err}`));
          } else {
            // 3. If there is no data in the cache,
            // get it from database and store in the cache.
            client.set(`count_${kind}_${sex}_${age}_${region}`,
                JSON.stringify({
                  total: result[0].count,
                  lastPage: Math.ceil(result[0].count / size) - 1,
                })
            );
            client.expire(`count_${kind}_${sex}_${age}_${region}`, 60);
            resolve({
              total: result[0].count,
              lastPage: Math.ceil(result[0].count / size) - 1,
            });
          }
        });
      }
    });
  });
}
function parseFilter(kind, sex, region, order, age) {
  let filter = '';
  if (region) filter = 'LEFT JOIN area ON pet.county = area.county ';
  // kind
  if (kind === '' || kind === 'all') filter = filter.concat('WHERE status = 0');
  else if (kind === 'cat') {
    filter = filter.concat(`WHERE status = 0 AND kind='貓'`);
  } else if (kind === 'dog') {
    filter = filter.concat(`WHERE status = 0 AND kind='狗'`);
  }
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
    if (region.length === 1) {
      filter = filter.concat(` AND area.area = ${region}`);
    } else {
      filter = filter.concat(' AND ');
      region.forEach(function(element) {
        filter = filter.concat(`area.area = ${element} OR `);
      });
      filter = filter.substring(0, filter.length - 3);
    }
  }
  if (order) filter = filter.concat(' ORDER BY pet.id DESC');
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
module.exports = {list, get, count};
