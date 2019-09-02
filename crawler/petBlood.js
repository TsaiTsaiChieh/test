const modules = require('../util/modules');
const mysql = require('../util/db');
const url = 'https://www.facebook.com/petblood';

modules.request({ url, method: 'GET' }, function (err, response, body) {
    if (err) {
        console.log('petBlood function 失敗');
    }
    else if (!err && response.statusCode == 200) {
        var $ = modules.cheerio.load(body);
        var title = $('#pageTitle');
        // var text = $('.text_exposed_root > p');
        // var text = $('.text_exposed_root', 'p');
        // var text = $('p');
        // var test = $('.text_exposed_show');
        // var postMsg = $('data-testid.post_message');
        // var wrapper = $('#u_0_2c > div._5pcr.userContentWrapper');
        // console.log(text.children().attribs);
        console.log(title.text());
    }

});