var ejs= require('ejs');//importing module ejs
var mysql = require('mysql');//importing module mysql
function getConnection(){
    var connection = mysql.createConnection({
        host : 'localhost', //host where mysql server is running
        user : 'admin', //user for the mysql application
        password : 'admin', //password for the mysql application
        database : 'test', //database name
        port : 3306, //port, it is 3306 by default for mysql
        connectionLimit: 50
    });
    return connection;
}
//fetching the data from the sql server
function fetchData(callback,sqlQuery){
    console.log("\nSQL Query::"+sqlQuery);
    var connection=getConnection();
    connection.query(sqlQuery, function(err, rows, fields) {
        if(err){
            console.log("ERROR: " + err.message);
        }
        else
        { // return err or result
            console.log("DB Results:"+rows);
            callback(err, rows);
        }
    });
    console.log("\nConnection closed..");
    connection.end();
}
exports.fetchData=fetchData;