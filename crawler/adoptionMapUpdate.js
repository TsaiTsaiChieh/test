/* eslint-disable max-len */
const modules = require('../util/modules');
const mysql = require('../util/db');
const url = 'http://www.meetpets.org.tw';

// 爬認養資訊
// 1. 先爬狗和貓的最後一頁
// 2. 收集每頁毛孩標題的網址
// 3. 根據各網址去撈毛孩的詳細資料，並打包好資料
// 4. 把資料存進資料庫
async function crawledAdoptionMap(species) {
  return new Promise(async function(resolve, reject) {
    console.log(`Start to update ${species} information from Taiwan adoption map...`);
    const lastPage = await findKindLastPage(species);
    const urlArray = await getKindUrl(species, lastPage);
    const petData = await getPetData(species, urlArray);
    insertData(petData);
    resolve(`Taiwan adoption map in ${species} update finish.`);
  });
}

function insertData(petData) {
  return new Promise(function(resolve, reject) {
    let loaded = 0;
    petData.forEach(function(ele) {
      mysql.con.getConnection(function(err, connection) {
        if (err) {
          modules.errorInsert(err, 23);
          reject(new modules.Err(500, 25, `Connection Error: ${err}`));
        } else {
          connection.query('SELECT db_link FROM pet WHERE db_link = ? AND db = 2', ele.db_link, function(err, result) {
            if (err) {
              reject(new modules.Err(500, 25, `Query Error in pet Table: ${err}`));
            } else {
              loaded ++;
              if (result.length === 0) {
                connection.query('INSERT INTO pet SET ?', ele, function(err, result) {
                  if (err) {
                    modules.errorInsert(err, 48);
                    reject(new modules.Err(500, 25, `Insert Error in pet Table: ${err}`));
                  } else {
                    resolve('Insert data in pet table successful.');
                  }
                });
              } else if (result.length !== 0) {
                connection.query('UPDATE pet SET ? WHERE db_link = ? AND db = 2', [ele, ele.db_link], function(err, result) {
                  if (err) {
                    modules.errorInsert(err, 48);
                    reject(new modules.Err(500, 25, `Insert Error in pet Table: ${err}`));
                  } else {
                    resolve('Update data in pet table successful.');
                  }
                });
              }
            }
            if (loaded === petData.length) console.log(`Taiwan adoption map in ${ele.kind} update finish.`);
          });
          connection.release();
        }
      });
    });
  });
}

function getPetData(species, urlArray) {
  return new Promise(function(resolve, reject) {
    const petData = [];
    let loaded = 0;
    urlArray.forEach(function(ele, index) {
      setTimeout(function() {
        modules.axios
            .get(`${url}${ele}`)
            .then(function(response) {
              // console.log(`${url}${ele} || ${index}/${species}`);
              const image = [];
              const $ = modules.cheerio.load(response.data);
              // 寵物資訊
              const link = ele.replace('/content/', '');
              const kind = `${species === 'dog' ? '狗' : '貓'}`;
              const petName = $('.field-field-pet-name').text().replace('動物小名:', '').trim();
              const age = ageTable($('.field-field-pet-age').text().replace('動物的出生日（年齡）:', '').replace('了', '').trim());
              const neuter = neuterTable($('.field-field-pet-medical').text().replace('結紮情況:', '').trim());
              const county = countyTable($('.field-field-county').text().replace('所在縣市:', '').trim());
              const title = $('title').text().replace(' | 台灣認養地圖', '');
              $('.field-field-pets-image').children('.field-items').children('.field-item').each(function(index, ele) {
                image.push(ele.children[0].attribs.src);
              });
              const description = $('.field-field-pet-look').text().replace('簡單描述:', '').trim();
              const habit = $('.field-field-pet-habitate').text().replace('動物個性略述:', '').trim();
              // 認養資訊
              const story = $('.field-field-limitation-desc').text().replace('動物的故事 / 詳細認養條件描述:', '').trim().slice(0, -1); // replace the /n
              const limitation = $('.field-field-pet-limitation').text().replace('認養條件:', '').split('認養條件:').map((ele) => ele.trim());
              // 聯絡人資訊
              const contactName = $('.field-field-contact').text().replace('聯絡人:', '').trim();
              const contactMethod = $('.field-field-tel').text().replace('電話/聯絡方式:', '').trim().substring(255, -1); // Avoid too long contacnt method
              petData.push({db: 2, status: checkTitle(title), db_link: link, kind, petName, age, sex: 'N', neuter, county,
                title, image: JSON.stringify(image), description: JSON.stringify(description), habit: JSON.stringify(habit),
                story: JSON.stringify(story), limitation: JSON.stringify(limitation), contactName, contactMethod});
              loaded ++;
              if (loaded === urlArray.length) resolve(petData);
            })
            .catch(function(err) {
              console.log(err);
              reject(new modules.Err(400, 112, `Load the pet details in ${species} failed, the error is ${err}`));
            });
      }, index * 500);
    });
  });
}

function getKindUrl(species, lastPage) {
  return new Promise(function(resolve, reject) {
    const urlArray = [];
    let loaded = -1; // Because the first page is zero
    for (let i = 0; i <= lastPage; i++) {
      modules.axios
          .get(`${url}/pets/${species}?page=${i}`)
          .then(function(response) {
            const $ = modules.cheerio.load(response.data);
            // Each title hides the pet content URL in each page
            const titles = $('.view-data-node-title a');
            titles.each(function(index, ele) {
              urlArray.push(ele.attribs.href);
            });
            loaded ++;
            if (loaded === lastPage) resolve(urlArray);
          })
          .catch(function(err) {
            reject(new modules.Err(400, 24, `Get the Url in ${species} failed, the error is ${err}`));
          });
    }
  });
}
function findKindLastPage(species) {
  return new Promise(function(resolve, reject) {
    modules.axios
        .get(`${url}/pets/${species}`)
        .then(function(response) {
          const $ = modules.cheerio.load(response.data);
          const index = $('.pager-last').attr('href').search('page=');
          const lastPage = Number.parseInt($('.pager-last').attr('href').substr(index+5));
          resolve(lastPage);
        })
        .catch(function(err) {
          reject(new modules.Err(400, 30, `Find the last page in ${species} failed, the error is ${err}`));
        });
  });
}

function checkTitle(title) {
  let status = 0;
  if (title.includes('已送養') || title.includes('已送出') || title.includes('暫停送養') || title.includes('已去新家') || title.includes('已出養') ||
        title.includes('已認養') || title.includes('已領養') || title.includes('已被') || title.includes('已經找到') || title.includes('暫停送養') ||
        title.includes('結案') || title.includes('目前已去') || title.includes('暫不開放') || title.includes('已被預定') || title.includes('已有人認養') ||
        title.includes('結束') || title.includes('已找到') || title.includes('已經') || title.includes('已有緣')) {
    status = 1;
  }
  return status;
}

function countyTable(countyString) {
  const countyCode = {
    台北市: 2,
    新北市: 3,
    基隆市: 4,
    宜蘭縣: 5,
    桃園縣: 6,
    新竹縣: 7,
    新竹市: 8,
    苗栗縣: 9,
    台中市: 10,
    彰化縣: 11,
    南投縣: 12,
    雲林縣: 13,
    嘉義縣: 14,
    嘉義市: 15,
    台南市: 16,
    高雄市: 17,
    屏東縣: 18,
    花蓮縣: 19,
    台東縣: 20,
    澎湖縣: 21,
    金門縣: 22,
    連江縣: 23,
  };
  let code;
  Object.keys(countyCode).map(function(key) {
    if (countyString === key) {
      code = countyCode[key];
    }
  });
  return code;
}

function neuterTable(neuterString) {
  switch (neuterString) {
    case '是':
      return 'T';
    case '否':
      return 'F';
    default:
      return 'N';
  }
}

function ageTable(ageString) {
  if (ageString.includes('年')) return 'A';
  else return 'C';
}

// Update orderly
async function updateAdoptionMap() {
  await crawledAdoptionMap('dog');
  await crawledAdoptionMap('cat');
}
updateAdoptionMap();
module.exports = {updateAdoptionMap};
