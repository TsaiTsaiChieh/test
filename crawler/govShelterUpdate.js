/* eslint-disable max-len */
const modules = require('../util/modules');
const mysql = require('../util/db');
const url = 'http://data.coa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL';
// 爬政府收容所資訊
// 1. 先爬收容所毛孩所有資料
// 2. 重新包裝原始資料
// 3. 把資料存進/更新資料庫

async function crawledGovShelter() {
  console.log('Start to update information from government shelter ...');
  const rawData = await getPetData();
  const petData = repackage(rawData);
  const dbLink = [];
  petData.forEach((ele) => dbLink.push(ele.db_link));
  // Looking for the db_link where status = 0 in the database is still in the government shelter data whether or not,
  // if not in the government data, the pet status we cannot trace, it should update the status of pet to 1,
  // if in the government data, do nothing in updataStatus function, it will update data in saveData function.
  updateStatus(dbLink);
  saveData(petData);
}

function saveData(petData) {
  let loaded = 0;
  mysql.con.getConnection(function(err, connection) {
    petData.forEach(function(ele) {
      if (err) {
        modules.errorInsert(modules.path.basename(__filename), err, 28);
      } else {
        connection.query('SELECT id, db_link FROM pet WHERE db_link = ? AND db = 1', ele.db_link, function(err, result) {
          if (err) {
            modules.errorInsert(modules.path.basename(__filename), err, 32);
          } else {
            loaded ++;
            if (result.length === 0) {
              connection.query('INSERT INTO pet SET ?', ele, function(err, result) {
                if (err) {
                  modules.errorInsert(modules.path.basename(__filename), err, 38);
                }
              });
            } else if (result.length !== 0) {
              connection.query(`UPDATE pet SET ? WHERE db_link = ? AND db = 1`, [ele, ele.db_link], function(err, result) {
                if (err) {
                  modules.errorInsert(modules.path.basename(__filename), err, 44);
                }
              });
            }
          }
          if (loaded === petData.length) console.log(`Governmnet shelter data update finish, a total of ${loaded} data.`);
        });
      }
    }); // petDate forEach
    connection.release();
  }); // get connection
}

function updateStatus(dbLink) {
  mysql.con.query('SELECT db_link FROM pet WHERE db = 1 AND status = 0', function(err, result) {
    if (err) {
      modules.errorInsert(modules.path.basename(__filename), err, 60);
    } else {
      mysql.con.getConnection(function(err, connection) {
        if (err) {
          modules.errorInsert(modules.path.basename(__filename), err, 64);
        } else {
          // isFound is database selection results to map each government data, so it is a boolean array
          const isFound = result.map((ele) => dbLink.includes(ele.db_link));
          isFound.forEach(function(ele, index) {
            if (!ele) {
              connection.query(`UPDATE pet SET status = 1 WHERE db_link = ? AND db = 1`, result[index].db_link, function(err, result) {
                if (err) {
                  modules.errorInsert(modules.path.basename(__filename), err, 72);
                }
              });
            }
          });
        }
        connection.release();
      }); // get connection
    }
  });
}

function repackage(rawData) {
  const petData = [];
  rawData.forEach(function(ele) {
    if (ele.animal_subid && ele.animal_id) { // 因為政府收容所一定要有這兩項資料才能鏈結
      petData.push({db: 1, status: 0, db_link: ele.animal_id, link_id: ele.animal_subid, kind: ele.animal_kind,
        sex: ele.animal_sex, age: `${ele.animal_age === 'ADULT' ? 'A' : 'C'}`, color: ele.animal_colour,
        neuter: ele.animal_sterilization, bacterin: ele.animal_bacterin, county: ele.animal_area_pkid,
        foundplace: ele.animal_foundplace, title: ele.animal_title, image: JSON.stringify([ele.album_file]),
        description: JSON.stringify(ele.animal_remark), opendate: opendateTransform(ele.animal_createtime),
        contactName: ele.shelter_name, contactMethod: ele.shelter_tel});
    }
  });
  return petData;
}
function opendateTransform(opendate) {
  if (opendate.length === 0) opendate = new Date().toISOString().slice(0, 10);
  return opendate.split('/').join('-');
}
function getPetData() {
  return new Promise(async function(resolve, reject) {
    const data = [];
    // Skip like index, we do not know the number of pets, so the second condition in for loop is empty.
    for (let page = 0; ; page++) {
      const responseData = await getBatchData(page);
      if (responseData.length === 0) {
        resolve(data);
        break;
      } else {
        responseData.forEach(function(ele) {
          data.push(ele);
        });
      }
    }
    reject(new modules.Err(400, `getPetData function failed`));
  });
}

// For ensuring the order of request, modeling the function to promise function.
function getBatchData(page) {
  return new Promise(function(resolve, reject) {
    const batch = 1000;
    modules.axios
        .get(`${url}&$top=${batch}&$skip=${batch*page}&animal_status=OPEN`)
        .then(function(response) {
          resolve(response.data);
        })
        .catch(function(err) {
          modules.errorInsert(modules.path.basename(__filename), err, 129);
          reject(new modules.Err(400, `Load the pet details in govment shelter failed, the error is ${err}`));
        });
  });
}
module.exports = {crawledGovShelter};
