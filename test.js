var request = require('request');
var cheerio = require('cheerio');

request({ url: "http://www.meetpets.org.tw/pets/cat", method: "GET" }, function (e, r, b) {
    var result = [];
    if (!e) {
        var $ = cheerio.load(b, { decodeEntities: false });

        var titles = $(".view-data-node-title a");

        console.log(titles.text());

        // for (let i = 0; i < titles.length; i++) {
        //     result.push(titles);
        // }
    }
    // console.log(result);


});