// MySQL Initialization
const mysql = require('mysql');
const mysqlCon = mysql.createPool({
  connectionLimit: process.env.MYSQL_CONNCTION_LIMIT,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

module.exports = {
  con: mysqlCon,
};
