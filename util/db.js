// MySQL Initialization
const modules = require('../util/modules');
const private = require('../private/mysqlcon');
const mysqlCon = modules.mysql.createConnection({
    host: private.mysqlSetting.hostname,
    user: private.mysqlSetting.user,
    port: private.mysqlSetting.port,
    password: private.mysqlSetting.password,
    database: private.mysqlSetting.database
});

mysqlCon.connect(function (err) {
    if (err) {
        throw err;
    } else {
        console.log("Tsai-Chieh connected... ");
    }
});
module.exports = {
    con: mysqlCon
};