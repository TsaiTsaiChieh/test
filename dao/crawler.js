const modules = require('../util/modules');
const url = 'http://www.meetpets.org.tw';

// 爬認養資訊
// 1. 先爬總共的隻數（一頁有 46 項資料）
// 2. 
// modules.async.waterfall([], function (err, result){});
function crawler(species) {
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
            // for (let i = 0; i <= lastPage; i++) {
            for (let i = 0; i <= 0; i++) {
                // console.log(`${url}${species}?page=${i}`);
                modules.request({ url: `${url}/pets/${species}?page=${i}`, method: 'GET' }, function (err, response, body) {
                    if (err) {
                        console.log('info function 失敗');
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
                    if (loaded == 0) next(null, contentURL);
                    // if (loaded == lastPage) next(null, contentURL);
                });
            } // end for loop for latPage
        },
        function (contentURL, next) {
            for (let i = 0; i < 1; i++) {
                // console.log('url:', contentURL[i]);
                // modules.request({ url: `${url}${contentURL[i]}`, method: 'GET' }, function (err, response, body) {

                // modules.request({ url: 'http://www.meetpets.org.tw/content/74351', method: 'GET' }, function (err, response, body) {
                modules.request({ url: 'http://www.meetpets.org.tw/content/74418', method: 'GET' }, function (err, response, body) {
                    if (err) {
                        console.log('contentURL function 失敗');
                        return;
                    }
                    else if (!err && response.statusCode == 200) {
                        var $ = modules.cheerio.load(body);
                        // 寵物資訊
                        var county = $('.field-field-county').children().children().text();
                        var area = $('.field-field-filed-county-area').children().children().text();
                        var petName = $('.field-field-pet-name').children().children().text().replace('動物小名:', '').trim();
                        var petAge = $('.field-field-pet-age').children().children().text().replace('動物的出生日（年齡）:', '').replace('了', '').trim();
                        var neuter = $('.field-field-pet-medical').children().children().text().replace('結紮情況:', '').trim();
                        var description = [$('.field-field-pet-look').children().children().text().replace('簡單描述:', '').trim()];
                        var habit = $('.field-field-pet-habitate').children().children().text().replace('動物個性略述:', '').trim();
                        // 認養資訊
                        // var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養資訊:', '').trim();
                        var limitation = $('.field-field-pet-limitation').children().children().text().replace('認養條件:', '').trim().split('認養條件:');
                        var story = $('.field-field-limitation-desc').children().children().text().split('\n').slice(0, -1);

                        // 聯絡人資訊
                        var contentName = $('.field-field-contact').children().children().text();
                        var contentTel = $('.field-field-tel').children().children().text();
                        let packData = { county, area, petName, petAge, neuter, description, habit, limitation, story, contentName, contentTel };
                        console.log(packData);
                    }
                });
            }
        }
    ], function (err, result) {
        if (err) throw err;
        // else console.log(result);
    });
}
crawler('cat');
// crawler('dog');


// function fintLastPage(species) {
//     return new Promise(function (resolve, reject) {
//         modules.request({ url: `${url}${species}`, method: 'GET' }, function (err, response, body) {
//             if (err) {
//                 reject('fintLastPage function 失敗');
//                 return
//             }
//             else if (!err && response.statusCode == 200) {
//                 var $ = modules.cheerio.load(body);
//                 const pager_last = $('.pager-last');
//                 var index = pager_last[0].attribs.href.search('page=');
//                 resolve(pager_last[0].attribs.href.substr(index + 5));
//             }
//         });
//     });
// }

// function info(lastPage, species) {
//     var contentURL = [];
//     // contentURL[contentURL.length - 1]
//     // var flag = true;
//     const x = new Promise(function (resolve, reject) {
//         for (let i = 0; i <= lastPage; i++) {
//             // console.log(`${url}${species}?page=${i}`);
//             modules.request({ url: `${url}${species}?page=${i}`, method: 'GET' }, function (err, response, body) {
//                 if (err) {
//                     reject('info function 失敗');
//                 }
//                 else if (!err && response.statusCode == 200) {
//                     var $ = modules.cheerio.load(body);
//                     var titles = $('.view-data-node-title a');
//                     for (let j = 0; j < titles.length; j++) {
//                         contentURL.push(titles[j].attribs.href);
//                     }
//                 }
//                 // resolve(contentURL);
//                 // console.log(`${species} length: ${contentURL.length}`);
//             });
//             // console.log(i);
//             // callback(resolve(contentURL));
//             // console.log(`${species} length: ${contentURL.length}`);
//             // resolve(contentURL);
//         }
//         x.then(function (contentURL) {
//             console.log(contentURL);

//             return resolve(contentURL);
//         })
//         // 
//         // return resolve(contentURL);

//     });

// }
// fintLastPage('cat').then(function (lastPage) {
//     info(lastPage, 'cat').then(function (url) {
//         console.log(`length:${url.length}`);
//     });
// }, function (err) {
//     console.log(err);
// });
// fintLastPage('dog').then(function (lastPage) {
//     info(lastPage, 'dog').then(function (url) {
//         console.log(`length:${url.length}`);
//     });
// }, function (err) {
//     console.log(err);
// });

// function test() {
//     var a = [];
//     for (let i = 0; i < 10; i++) {
//         a.push(i);
//     }
//     console.log(a);
// }
// test();


// fintLastPage('dog');
// console.log(catLastPage);

// modules.request({ url: `${url}cat`, method: "GET" }, function (err, response, body) {
//     var result = [];
//     if (!err && response.statusCode == 200) {
//         // body 為原始碼，使用 cheerio.load 將字串轉換為 cheerio(jQuery) 物件
//         // var $ = modules.cheerio.load(body, { decodeEntities: false });
//         var $ = modules.cheerio.load(body);
//         // 貓首頁的標題，一頁有 46 隻
//         var titles = $(".view-data-node-title a");
//         console.log(titles.length);

//         // console.log(titles.text());
//         // console.log('titles:', titles[0].attribs.href);
//         for (let i = 0; i < titles.length; i++) {
//             result.push(titles[i].attribs.href);
//         }
//     }
//     console.log(result);
// });