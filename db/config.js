require('dotenv').config();
var mysql = require('mysql');

var con = new mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

con.connect();

module.exports = con;
