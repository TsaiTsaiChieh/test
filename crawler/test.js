const url = 'http://www.meetpets.org.tw';
const modules = require('../util/modules');
modules.request({ url: `${url}/content/74576`, method: 'GET' }, function (err, response, body) {
    if (err) {
        console.log('fintLastPage function 失敗');
        return
    }
    else if (!err && response.statusCode == 200) {
        let $ = modules.cheerio.load(body);
        let petName = $('.field-field-pet-name').children().children().text().replace('動物小名:', '').trim();
        let age = $('.field-field-pet-age').children().children().text().replace('動物的出生日（年齡）:', '').replace('了', '').trim();
        console.log(petName, age);

    }
});