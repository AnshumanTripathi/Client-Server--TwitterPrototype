var MongoClient = require('mongodb').MongoClient;
var db;
var connected = false;
var mongoURL = "mongodb://localhost:27017/twitter";

var connectionPool = [];

function addConnectionToPool(){
    return MongoClient.connect(mongoURL, function(err, _db){
        console.log("Creating a new connection in the pool with MongoDB at : "+mongoURL);
        if (err) { throw new Error('Could not connect: '+err); }
        db = _db;
        // Adding the connection to the pool.
        connectionPool.push(db);
        connected = true;
        console.log(connected +" is connected?");
    });
}

var dbPool = {
    "maxPoolSize": 500
};

var createPool = function createConnectionPool(){
    for(var i = 0; i < dbPool.maxPoolSize; i++){
        addConnectionToPool();
    }
};

createPool();
/**
 * Connects to the MongoDB Database with the provided URL
 */
exports.connect = function(url, callback){
    console.log('CONNECTION POOL : '+connectionPool.length);
    if(connectionPool.length > 0){
        callback(connectionPool.pop());
    } else {
        console.log("Empty! Filling connection pool to its full capacity.");
        this.createConnectionPool();
        callback(connectionPool.pop());
    }
    console.log("pool connect length: "+connectionPool.length);
};

/**
 * Returns the collection on the selected database
 */
exports.collection = function(name){
    var c;
    if (!connected) {
        throw new Error('Must connect to Mongo before calling "collection"');
    }
    if(connectionPool.length > 0){
        c = connectionPool.pop();
        console.log("pool collection length: "+connectionPool.length);
        return c.collection(name);
    } else {
        console.log("Connection pool is empty. Filling connection pool to its full capacity.");
        //this.createConnectionPool();
        c = connectionPool.pop();
        console.log("pool collection length: "+connectionPool.length);
        return c.collection(name);
    }
};

exports.releaseConnection = function(conn){
    if (!connected) {
        throw new Error('Must connect to Mongo before releasing connection');
    }
    if(connPool.length < dbPool.maxPoolSize){
        connectionPool.push(conn);
        console.log("pool release length: "+connectionPool.length);
    }
}
/**
 * Connects to the MongoDB Database with the provided URL
 */
//exports.connect = function(url, callback){
//    MongoClient.connect(url, function(err, _db){
//      if (err) { throw new Error('Could not connect: '+err); }
//      db = _db;
//      connected = true;
//      console.log(connected +" is connected?");
//      callback(db);
//    });
//};
//
///**
// * Returns the collection on the selected database
// */
//exports.collection = function(name){
//    if (!connected) {
//      throw new Error('Must connect to Mongo before calling "collection"');
//    }
//    return db.collection(name);
//
//};
