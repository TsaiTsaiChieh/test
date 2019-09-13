// MySQL Initialization
// const modules = require('../util/modules');
const private = require('../private/mysqlcon');
const mysql = require('mysql');
// const mysqlCon = mysql.createPool({
//     connectionLimit: 250,
//     host: private.mysqlSetting.hostname,
//     user: private.mysqlSetting.user,
//     port: private.mysqlSetting.port,
//     password: private.mysqlSetting.password,
//     database: private.mysqlSetting.database
// });
const mysqlCon = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "0000",
    database: "pet_home"
});
// mysqlCon.getConnection(function (err, connection) {

// });
// mysqlCon.connect(function (err) {
//     if (err) {
//         throw err;
//     } else {
//         console.log("Tsai-Chieh connected... ");
//     }
// });
module.exports = {
    con: mysqlCon
};