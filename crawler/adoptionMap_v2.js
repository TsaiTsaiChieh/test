const modules = require('../util/modules');
const mysql = require('../util/db');
const url = 'http://www.meetpets.org.tw';

// 爬認養資訊
// 1. 先爬總共的隻數（一頁有 46 項資料）
// 2. 
// modules.async.waterfall([], function (err, result){});

function countyTable(countyString) {
    switch (countyString) {
        case '台北市':
            return 2;
        case '新北市':
            return 3;
        case '基隆市':
            return 4;
        case '宜蘭縣':
            return 5;
        case '桃園縣':
            return 6;
        case '新竹縣':
            return 7;
        case '新竹市':
            return 8;
        case '苗栗縣':
            return 9;
        case '台中市':
            return 10;
        case '彰化縣':
            return 11;
        case '南投縣':
            return 12;
        case '雲林縣':
            return 13;
        case '嘉義縣':
            return 14;
        case '嘉義市':
            return 15;
        case '台南市':
            return 16;
        case '高雄市':
            return 17;
        case '屏東縣':
            return 18;
        case '花蓮縣':
            return 19;
        case '台東縣':
            return 20;
        case '澎湖縣':
            return 21;
        case '金門縣':
            return 22;
        case '連江縣':
            return 23;
        // default:
        //     return 0;
    }
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
function crawler(species) {
    console.log(`update Map(${species}) start...`);
    modules.async.waterfall([
        // 先爬各種類的最後 page 數
        function (next) {
            modules.request({ url: `${url}/pets/${species}`, method: 'GET' }, function (err, response, body) {
                if (err) {
                    console.log('fintLastPage function 失敗');
                    return
                }
                else if (!err && response.statusCode == 200) {
                    var $ = modules.cheerio.load(body);
                    const pager_last = $('.pager-last');
                    var index = pager_last[0].attribs.href.search('page=');
                    next(null, pager_last[0].attribs.href.substr(index + 5));
                }
            });
        },
        function (lastPage, next) {
            // 爬總隻數
            var contentURL = [];
            var loaded = -1;
            for (let i = 0; i <= lastPage; i++) {
                // for (let i = 0; i <= 0; i++) {
                // console.log(`${url}/pets/${species}?page=${i}`);
                modules.request({ url: `${url}/pets/${species}?page=${i}`, method: 'GET' }, function (err, response, body) {
                    if (err) {
                        console.log(err, 'info function 失敗');
                        return;
                    }
                    else if (!err && response.statusCode == 200) {
                        var $ = modules.cheerio.load(body);
                        var titles = $('.view-data-node-title a');
                        for (let j = 0; j < titles.length; j++) {
                            contentURL.push(titles[j].attribs.href);
                        }
                        loaded++;
                    }
                    if (loaded == lastPage) next(null, contentURL);
                    // if (loaded == lastPage) next(null, contentURL);
                });
            } // end for loop for latPage
        },
        // 將撈好的全部 URL 開始抓取每筆資料，並 push 在 data
        function (contentURL, next) {
            // console.log(contentURL.length);
            var data = [];
            var loaded = 0;
            var kind = '';

            for (let i = 0; i < contentURL.length; i++) {
                setTimeout(function () {
                    // console.log(`${i} item...`);
                    // console.log('url:', `${i},${url}${contentURL[i]}`);
                    modules.request({ url: `${url}${contentURL[i]}`, method: 'GET' }, function (err, response, body) {
                        // modules.request({ url: 'http://www.meetpets.org.tw/content/74351', method: 'GET' }, function (err, response, body) {
                        // modules.request({ url: 'http://www.meetpets.org.tw/content/74418', method: 'GET' }, function (err, response, body) {
                        if (err) {
                            console.log(err);
                            console.log(`${i},${url}${contentURL[i]} contentURL function 失敗`);
                            return;
                        }
                        else if (!err && response.statusCode == 200) {
                            var $ = modules.cheerio.load(body);
                            // 寵物資訊
                            var link = contentURL[i].replace('/content/', '');
                            if (species == 'cat') {
                                kind = '貓';
                            }
                            else if (species == 'dog') {
                                kind = '狗';
                            }
                            var petName = $('.field-field-pet-name').children().children().text().replace('動物小名:', '').trim();
                            var age = $('.field-field-pet-age').children().children().text().replace('動物的出生日（年齡）:', '').replace('了', '').trim();
                            age = ageTable(age);
                            var neuter = $('.field-field-pet-medical').children().children().text().replace('結紮情況:', '').trim();
                            neuter = neuterTable(neuter);
                            var countyString = $('.field-field-county').children().children().text();
                            var county = countyTable(countyString);
                            var title = $('title').text().replace(' | 台灣認養地圖', '');
                            // var image = $('.field-field-pets-image');
                            var image = [];
                            // console.log($('.field-field-pets-image').children().children().length);
                            // console.log('test123', $('.field-field-pets-image').children());
                            // console.log('hhii.....', $('.field-field-pets-image').children().children());
                            for (let j = 0; j < $('.field-field-pets-image').children().children().length; j++) {
                                // console.log(j, $('.field-field-pets-image').children().children()[j].children[0].attribs.src);
                                image.push($('.field-field-pets-image').children().children()[j].children[0].attribs.src);
                            }
                            // console.log(image);
                            // var area = $('.field-field-filed-county-area').children().children().text();


                            var description = $('.field-field-pet-look').children().children().text().replace('簡單描述:', '').trim();
                            var habit = $('.field-field-pet-habitate').children().children().text().replace('動物個性略述:', '').trim();
                            // 認養資訊
                            // var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養資訊:', '').trim();
                            var story = $('.field-field-limitation-desc').children().children().text().slice(0, -1);
                            var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養條件:', '').split('認養條件:');
                            for (let j = 0; j < limitation.length; j++) {
                                limitation[j] = limitation[j].trim();
                            }
                            // 聯絡人資訊
                            var contactName = $('.field-field-contact').children().children().text();
                            var contactMethod = $('.field-field-tel').children().children().text().substring(255, -1);
                            let packData = { link, kind, petName, age, neuter, county, title, image, description, habit, story, limitation, contactName, contactMethod };
                            // console.log(packData);
                            loaded++;

                            data.push(packData);
                        }
                        if (loaded === contentURL.length) next(null, data);
                    });
                }, 100 * i);
            } // end for loop
        },
        // 將全部資料開始餵入資料庫
        function (data, next) {
            // console.log('data.length', data.length);
            var insert_pet = [];
            var loaded = 0;
            for (let i = 0; i < data.length; i++) {
                insert_pet.push({
                    db: 2, status: 0, db_link: data[i].link, kind: data[i].kind, petName: data[i].petName,
                    age: data[i].age, sex: 'N',
                    neuter: data[i].neuter, county: data[i].county, title: data[i].title,
                    image: JSON.stringify(data[i].image), description: JSON.stringify(data[i].description),
                    habit: JSON.stringify(data[i].habit), story: JSON.stringify(data[i].story),
                    limitation: JSON.stringify(data[i].limitation), contactName: data[i].contactName,
                    contactMethod: data[i].contactMethod
                });
                // console.log(insert_pet);

                loaded++;
                if (loaded === data.length) next(null, insert_pet);
            }
        },
        function (pet_data, next) {
            let loaded = 0;
            pet_data.forEach(element => {

                element = checkTitle(element);
                // if (element.status === 1) console.log(element.title);
                mysql.con.getConnection(function (err, connection) {
                    if (err) modules.errorInsert(err, 217);
                    else {
                        connection.query(`SELECT db_link FROM pet WHERE db_link=${element.db_link} AND db=2`, function (err, result) {
                            if (err) modules.errorInsert(err, 219);
                            else {
                                loaded++;
                                if (result.length === 0) {
                                    connection.query(`INSERT INTO pet SET ?`, element, function (err, result) {
                                        if (err) modules.errorInsert(err, 224);
                                        // console.log('insert', result);

                                    }); // INSERT query
                                } // result.length === 0 'if', should insert data
                                else if (result.length !== 0) {
                                    connection.query(`UPDATE pet SET ? WHERE db_link=${element.db_link} AND db=2`, element, function (err, result) {
                                        if (err) modules.errorInsert(err, 231);
                                        // console.log('update', result);
                                    }); // UPDATE query
                                } // result.length !== 0 'else if', should insert data
                                connection.release();
                            } // first connection.query 'else' 
                        }); // first connection.query
                    } // mysql.con.getConnection 'else'
                    if (loaded === pet_data.length) console.log('Adoption map update finish.');
                }); // mysql.con.getConnection
            }); // pet_data.forEach
        }
    ], function (err, result) { });
}
function checkTitle(ele) {
    let title = ele.title;
    if (title.includes('已送養') || title.includes('已送出') || title.includes('暫停送養') || title.includes('已去新家') || title.includes('已出養') ||
        title.includes('已認養') || title.includes('已領養') || title.includes('已被') || title.includes('已經找到') || title.includes('暫停送養') ||
        title.includes('結案') || title.includes('目前已去') || title.includes('暫不開放') || title.includes('已被預定') || title.includes('已有人認養') ||
        title.includes('結束') || title.includes('已找到') || title.includes('已經') || title.includes('已有緣')) {
        ele.status = 1;
    }
    return ele;
}
function updateAdoptionMap() {
    crawler('cat');
    crawler('dog');
}

module.exports = { updateAdoptionMap };