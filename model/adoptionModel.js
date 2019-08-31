const mysql = require('../util/db');

module.exports = {
    list: function (category, paging, size) {
        let offset = paging * size;
        let filter = '';
        return new Promise(function (resolve, reject) {
            switch (category) {
                case 'all':
                    break;
                case 'cat':
                    filter = `WHERE kind = '貓'`;
                    break;
                case 'dog':
                    filter = `WHERE kind = '狗'`;
                    break;
                default:
                    reject({ error: "Wrong Request" });
            }
            mysql.con.query(`SELECT * FROM pet ${filter} LIMIT ${offset},${size}`, function (err, result) {
                if (err) reject(`Tabel pet Query Error: ${err}`);
                for (let i = 0; i < result.length; i++) {
                    result[i].image = JSON.parse(result[i].image);
                    result[i].description = JSON.parse(result[i].description);
                    result[i].habit = JSON.parse(result[i].habit);
                    result[i].story = JSON.parse(result[i].story);
                    result[i].limitation = JSON.parse(result[i].limitation);
                }
                resolve(result);
            });
        });
    } //list end
}