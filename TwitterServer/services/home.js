var ejs = require("ejs");
var mongo = require('./mongo');
var mongodb = require('mongodb');
var session = require('client-sessions');
var bcrypt = require('bcryptjs');
var mongoURL = "mongodb://localhost:27017/twitter";

function signUp(message,callback){
        //var password = req.param("password");
        //var insertUser = "insert into users (username,email,password) values('"+req.param("fullName")+"','"
            //    +req.param("email")+"','"+req.param("password")+"');";
            //console.log(insertUser);
            //console.log("In SignUp!");
            var salt = bcrypt.genSaltSync(10);
            //console.log("Salt: "+salt);
            var encryptedPassword = bcrypt.hashSync(message.password,salt);
            //console.log("Encrypted Password: "+encryptedPassword);
            //var decryptedPassword = bcrypt.compareSync(message.password,encryptedPassword);
            //console.log("Decrypted Password: "+decryptedPassword);


            console.log("In SignUp Server"+message.username)
            mongo.connect(mongoURL,function(dbConn){
               var collection = dbConn.collection('users');

                collection.insert({
                    "username": message.username,
                    "email": message.email,
                    "password": encryptedPassword,
                    "salt": salt,
                });
                mongo.releaseConnection(dbConn);
            });
        callback(null,{statusCode: 200});
}
function afterSignIn(message,callback){

        // check user already exists
        //var getUser="select * from users where email='"+req.param("email")+"' and password='"+password+"';";
        //console.log("Query is:"+getUser);
        console.log('Logging In...'+message.email+ " "+message.password);

        //callback(null, {"statusCode": 200, username: message.username, id: "57140fe8c6f7cbe40a2fbee7"});
        mongo.connect(mongoURL,function(dbConn){
           var collections = dbConn.collection('users');

            collections.findOne({"email": ""+message.email},function(err,user){
                if(user) {
                    if(bcrypt.compareSync(message.password,user.password)) {
                        console.log("User:" + user.username);
                        console.log("valid Login");

                        callback(null, {"statusCode": 200, username: user.username, id: user._id});
                    }
                    else{
                        callback(null,{"statusCode": 400});
                    }
                }
                else{
                    callback(null,{"statusCode": 400});
                }
            });

            mongo.releaseConnection(dbConn);

        });
        //mysql.fetchData(function(err,results){
        //    if(err){
        //        throw err;
        //    }
        //    else {
        //        if (results.length > 0) {
        //
        //            console.log("Login check: " + results[0].username);
        //            req.session.email = req.param("email");
        //            req.session.username = results[0].username;
        //            req.session.ID = results[0].ID;
        //            console.log("valid Login");
        //            json_data = {"statusCode": 200};
        //            res.send(json_data);
        //        }
        //
        //        else {
        //
        //            json_data = {"statusCode": 401};
        //            console.log("Invalid Login");
        //            res.send(json_data);
        //        }
        //    }
        //},getUser);

}

function getTweets(message,callback){
    //var getFollowers = "select userIdOfFollower from followers where userIdOfCurrent = '"+req.session.username+"';";
    console.log('In Get Tweets!');
    mongo.connect(mongoURL,function(dbConn){
        console.log('Connection Made!');
        var collection = dbConn.collection('users');
        var tweetsArray = [];
        var tweet = {};
        var followers = [];
        var tweetsJson = {};
        var newTweetsJson= {};
        var returnData = [];
        console.log("User Name:"+message.username);
        collection.findOne({"username":""+message.username},function(err,userFollow){
            //console.log(userFollow);
            followers = userFollow.Following;
            tweet.username = message.username;
            if(userFollow.Tweets) {
                for (var i = 0; i < userFollow.Tweets.length; i++) {
                    tweetsArray[i] = userFollow.Tweets[i];
                }
                tweet.tw = tweetsArray;
                for (var i = 0; i < tweetsArray.length; i++) {
                    tweetsJson = {username: tweet.username, tweet: tweet.tw[i]};
                    returnData.push(tweetsJson);
                }
            }
            if(followers) {
                console.log("Followers are: " + followers[0]);
                for (var i = 0; i < followers.length; i++) {
                    console.log("In Loop! "+followers[i]);
                    collection.findOne({username: followers[i]}, function (err, tweet) {
                        if (err) {
                            throw err;
                        } else if (tweet.Tweets) {
                            var currentFollower = tweet.username;
                            console.log("Current Follower :" + currentFollower);
                            console.log("Follower Tweets: " + tweet.Tweets);
                            for (var j = 0; j < tweet.Tweets.length; j++) {
                                console.log(tweet.Tweets[j]);
                                newTweetsJson = {username: currentFollower, tweet: tweet.Tweets[j]}
                                returnData.push(newTweetsJson);
                            }
                            console.log("Return Data: " + returnData);
                            callback(null, returnData);
                        }
                    });
                }
            }
        });

        mongo.releaseConnection(dbConn);
    });
//    console.log('Query is: '+getFollowers);
//    mysql.fetchData(function(err,results){
//        if(err){
//            throw err;
//        }
//        else{
//            var str;
//            var followers = [];
//
//            console.log(results);
//            for(var i=0;i<results.length;i++){
//                followers[i] = results[i].userIdOfFollower;
//            }
//            str ="'"+followers[0];
//            for(var i=1;i<followers.length;i++){
//                str +="','"+followers[i];
//            }
//
//            str +="'";
//
//            console.log(str);
//
//            var createView = "create view followtemp as select users.ID, users.username, users.email, tweets.tweet " +
//                "from users join tweets " +
//                "where users.email = tweets.username;";
//            mysql.fetchData(function(err,results){
//                if(err){
//                    throw err;
//                }
//                else{
//                    var selectTweetQuery = "select username, tweet from followtemp where username in ("+str+",'"+req.session.username+"');";
//                    console.log("Selected tweet of Follower: "+selectTweetQuery);
//
//                    mysql.fetchData(function(err,results0){
//                        if(err){
//                            throw err;
//                        }else{
//                            console.log("Final Results: "+results0);
//                            res.send(results0);
//
//                            var dropQuery = "drop view followtemp;";
//
//                            mysql.fetchData(function(err,results){
//                                if(err) {
//                                    throw err;
//                                }else{
//                                    console.log("View Dropped!");
//                                }
//                            },dropQuery);
//                        }
//                    },selectTweetQuery);
//                }
//            },createView);
//        }
//    },getFollowers);
}

function tweet(message,callback){
    var jsonStatusCode;
    console.log("Tweeting!")
    console.log(message.username);
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');
        collection.update({"username":""+message.username},{$push : {"Tweets": ""+message.tweet}},function(err,tweet){
            if(err){
                throw err;
            }else if(tweet){
                console.log("Tweet Successful!")
                jsonStatusCode = {statusCode:200};
                callback(null,jsonStatusCode);
            }else{
                jsonStatusCode = {statusCode:400};
                callback(null,jsonStatusCode);
            }
        });
        mongo.releaseConnection(dbConn);
    });

    //var query = "insert into tweets values('"+req.session.email+"','"+ req.param("tweet")+"');";
    //mysql.fetchData(function (err,results) {
    //    if(err){
    //        throw err;
    //    }
    //    else
    //    {
    //        console.log(tweet+" added");
    //        res.send(true);
    //
    //    }
    //},query);
}

function logout(req,res){
    console.log("Session variable: "+req.session.email);
    req.session.destroy();
    res.render("index");

}

function goToLogin(req,res){
    if(req.session.email){
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("Home");
    }
    else{
        res.render("index");
    }
}

function getCurrentUser(message,callback){
    var currentUsername = message.currentUser;
    console.log('Current User: '+currentUsername);
    var jsonResponse;
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');
        collection.findOne({username:currentUsername},function(err,user){
            if(err){
                throw err;
            }else if(user){
                callback(null,user);
            }
        });
        mongo.releaseConnection(dbConn);
    });
    //var getCurrentUserQuery = "select * from users where email = '"+currentUserEmail+"';";
    //
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        res.send(results);
    //    }
    //},getCurrentUserQuery);
}

function search(message,callback){
    var searchString = message.searchString;
    console.log("Search String: "+searchString);
    mongo.connect(mongoURL,function(dbConn){
       var collection = dbConn.collection('users');
        var searchQuery = {"username" : new RegExp(searchString,'i')};
        collection.find(searchQuery).toArray(function(err,searchResults){
            if(err){
                throw err;
            }else if(searchResults){
                    callback(null,searchResults);
            }
        });
        mongo.releaseConnection(dbConn);
    });
    //var searchQuery = "select * from users where username like '%"+searchString+"%';";
    //console.log("Search Query: "+searchQuery);
    //mysql.fetchData(function (err,results) {
    //    if(err){
    //        throw err;
    //    }else{
    //        res.send(results);
    //    }
    //},searchQuery);
}

function getProfile(message,callback){
    var objectId = new mongodb.ObjectId(message.objectId);
    console.log("Fetching Profile! "+objectId);
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');

        collection.findOne({_id: objectId},function(err,results){
            if(err){
                throw err;
            }else if(results){
                console.log("Opening Profile!");
                callback(null,results);
            }
        });

        mongo.releaseConnection(dbConn);
    });
    //var getProfileById = "select * from users where ID = "+req.param('id')+";";
    //console.log("Get Profile Query: "+getProfileById);
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        console.log("Results are: "+results[0].username);
    //        var resultsUserName = results[0].username;
    //        req.session.searchEmail = results[0].email;
    //        res.render('profile',{searchResultsUserName: resultsUserName});
    //    }
    //},getProfileById);
}

function searchTweet(req,res){

    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');

        collection.find();
    });

    //var searchTweet = "select * from tweets where tweet like '%"+req.param('searchStr')+"%';";
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        res.send(results);
    //    }
    //},searchTweet);
}

function searchTweetByUser(message,callback){
    var searchUsername = message.searchUsername;
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');
        collection.findOne({username: searchUsername},function(err,tweets){
            if(err){
                throw err;
            }else if(tweets){
                callback(null,tweets);
            }
        });
       mongo.releaseConnection(dbConn);
    });
    //var searchTweetByUserQuery = "select tweet from tweets where username = '"+req.session.searchEmail+"';";
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        res.send(results);
    //    }
    //},searchTweetByUserQuery);
}

function follows(message,callback){
    console.log('Following'+message.follow);
    var follow = message.follow;
    var currentUser = message.currentUser;
    var jsonResponse;
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');

        collection.update({username:currentUser},{"$push":{Following:follow}},function(err,followers){
            if(err){
                throw err;
            }else if(followers){
                console.log("Now Following!");
                collection.update({username: message.follow},{"$push":{Followers:currentUser}},function(err,follow){
                    if(err){
                        throw err;
                    }else{
                        jsonResponse = {statusCode:'200'};
                        callback(null,jsonResponse);
                    }
                });
            }
        });

        mongo.releaseConnection(dbConn);
    });
    //var addFollowQuery = "insert into followers values('"+currentUser+"','"+follow+"');";
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        console.log("Follower Added!");
    //        res.send('true');
    //    }
    //},addFollowQuery);
}


function editProfile(message,callback){

    var firstName = message.firstName;
    var lastName = message.lastName;
    var DOB = message.DOB;
    console.log("UserName from Session: "+message.username);
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');

        collection.update({username: message.username},
            {"$set":{"firstName":firstName,"lastName":lastName,"dob":new Date(DOB)}},function(err,results){
            if(err){
                throw err;
            }else if(results){
                console.log("Profile Updated");
                callback(null,true);
            }
        });

        mongo.releaseConnection(dbConn);
    });

    //var updateQuery = "update users set first_name = '"+firstName+"', last_name = '"+lastName+"', DOB= STR_TO_DATE('"+DOB+"', '%Y-%m-%d') " +
    //    "where username ='"+req.session.username+"';";
    //
    //console.log("Update Query: "+updateQuery);
    //
    //mysql.fetchData(function(err,results){
    //    if(err){
    //        throw err;
    //    }else{
    //        console.log("Profile Updated");
    //        res.render('editProfile');
    //    }
    //},updateQuery);
}

function getFollowers(message,callback){
    console.log('Fetching Followers from DB!');
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');
        collection.findOne({username:message.username},function(err,followers){
            if(err){
                throw err;
            }else if(followers){
                console.log(followers);

                callback(null,followers);
            }else{
                console.log('No Followers');
            }
        });

        mongo.releaseConnection(dbConn);
    });
    //var getMyFollowers = "select userIdOfFollower from followers where userIdOfCurrent = '"+req.session.username+"';";
    //console.log(getMyFollowers);
    //mysql.fetchData(function (err,results) {
    //    if(err){
    //        throw err;
    //    }else{
    //        var myFollowers = [];
    //        for(var i=0;i<results.length;i++){
    //            myFollowers[i] = results[i].userIdOfFollower;
    //        }
    //
    //        res.send(myFollowers);
    //    }
    //},getMyFollowers);
}

//function retweet(req,res){
//
//    var retweetQuery = "insert into tweets values ('"+req.session.email+"','"+req.param('currentTweet')+"');";
//    console.log("Retweet Query: "+retweetQuery);
//    mysql.fetchData(function (err,results) {
//        if(err){
//            throw err;
//        }else{
//            console.log("Retweeted: "+req.param('currentTweet'));
//        }
//    },retweetQuery);
//}

function getMyTweet(message,callback){
    mongo.connect(mongoURL,function(dbConn){
        var collection = dbConn.collection('users');

        collection.findOne({username: message.username},function(err,myTweets){
            if(err){
                throw err;
            }
            else if(myTweets){
                callback(null,myTweets);
            }
        });

        mongo.releaseConnection(dbConn);
    });
}

exports.follows = follows;
exports.goToLogin = goToLogin;
exports.afterSignIn=afterSignIn;
exports.signUp = signUp;
exports.tweet = tweet;
exports.getTweets = getTweets;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
exports.search = search;
exports.getProfile = getProfile;
exports.searchTweet = searchTweet;
exports.searchTweetByUser = searchTweetByUser;
exports.editProfile = editProfile;
exports.getFollowers = getFollowers;
//exports.retweet = retweet;
exports.getMyTweets = getMyTweet;