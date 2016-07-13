var ejs = require("ejs");
var mongo = require('./mongo');
var mongodb = require('mongodb');
var mongoURL = "mongodb://localhost:27017/twitter";
var mq_client = require('../rpc/client');

function signUp(req,res){
              //var password = req.param("password");
            //var insertUser = "insert into users (username,email,password) values('"+req.param("fullName")+"','"
            //    +req.param("email")+"','"+req.param("password")+"');";
            //console.log(insertUser);

            var username = req.param('fullName');
            var email = req.param('email');
            var password = req.param('password');

            var msg_payload = {username: username,email: email,password: password};
            mq_client.make_request('signUp_queue',msg_payload,function(err,results){
                if(err){
                    throw err;
                }else if(results.statusCode == 200){
                    res.render("index");
                }
            });
}
function afterSignIn(req,res){

        // check user already exists
        var json_data={};
        var email = req.param("email");
        var password = req.param("password");
        var sessionEmail, sessionUsername,sessionId;
        //var getUser="select * from users where email='"+req.param("email")+"' and password='"+password+"';";
        //console.log("Query is:"+getUser);
        console.log('Logging in '+email);
        var msg_payload = {email: email,password: password};
        mq_client.make_request('login_queue',msg_payload,function(err,results) {
            console.log("Response :"+results.statusCode);
            if (results.statusCode == 200) {
                console.log("User:" + results.username);
                console.log("ID: "+results.id);
                console.log("valid Login");
                req.session.email = email;
                req.session.username = results.username;
                req.session.ID = results.id;
                console.log("Session: "+req.session.email+" "+req.session.username+" "+req.session.ID);
                json_data = {"statusCode": 200};
                console.log("Json Data: "+json_data.statusCode);
                res.send(json_data);
            }
            else {
                json_data = {"statusCode": 400};
                res.send(json_data);
            }

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

function getTweets(req,res){
    //var getFollowers = "select userIdOfFollower from followers where userIdOfCurrent = '"+req.session.username+"';";
    console.log('Getting Tweets!');
    var username = req.session.username;
    var msg_payload = {username: username};
    mq_client.make_request('getTweets_queue',msg_payload,function(err,results) {
            console.log('Results: '+results);
            res.send(results);
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

function tweet(req,res){
    var jsonStatusCode;
    console.log("Tweeting!")
    console.log(req.session.username);
    var msg_payload = {username: req.session.username,tweet:req.param('tweet')};
    mq_client.make_request('tweet_queue',msg_payload,function(err,results){
        if(results.statusCode == 200){
            console.log('Tweet Successful!');
            jsonStatusCode = {statusCode:200};
            res.send(jsonStatusCode);
        }else{
            jsonStatusCode = {statusCode:400};
            res.send(jsonStatusCode);
        }
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

function getCurrentUser(req,res){
    var currentUsername = req.session.username;
    var jsonResponse;
    console.log('Current User: '+currentUsername);
    var msg_payload = {currentUser:currentUsername};
    mq_client.make_request('getCurrentUser_queue',msg_payload,function(err,currentUser){
        if(err){
            throw err;
        }else if(currentUser){
            console.log('Current User from Server: '+currentUser.username);
            res.send(currentUser);
        }
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

function search(req,res){
    console.log('In Search Client!');
    var searchString = req.param('searchStr');
    console.log("Search String: "+searchString);
    var msg_payload = {searchString: req.param('searchStr')};
    mq_client.make_request('search_queue',msg_payload,function(err,searchResults){
        if(err){
            throw err;
        }else{
            res.send(searchResults);
        }
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

function getProfile(req,res){
    var objectId = new mongodb.ObjectId(req.param('id'));
    console.log("Fetching Profile! "+objectId);
    var msg_payload = {objectId: objectId};
    mq_client.make_request('getProfile_queue',msg_payload,function(err,results){
        if(err){
            throw err;
        }else{
            req.session.searchUsername = results.username;
            res.render('profile',{searchResultsUserName: results.username});
        }
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

    mongo.connect(mongoURL,function(){
        var collection = mongo.collection('users');

        collection.find()
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

function searchTweetByUser(req,res){
    var searchUsername = req.session.searchUsername;
    var msg_payload = {searchUsername: searchUsername};
    mq_client.make_request('searchTweetByUser_queue',msg_payload,function(err,results){
        if(err){
            throw err;
        }else{
            res.send(results);
        }
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

function follows(req,res){
    var follow = req.param('follow');
    var currentUser = req.session.username;
    var jsonResponse;
    var msg_payload = {follow: follow,currentUser: currentUser};
    mq_client.make_request('follows_queue',msg_payload,function(err,results){
        if(err){
            throw err;
        }else{
            jsonResponse = {statusCode: 200};
            res.send(jsonResponse);
        }
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


function editProfile(req,res){
    var username = req.session.username;
    var firstName = req.param('firstName');
    var lastName = req.param('lastName');
    var DOB = req.param('DOB');
    console.log(DOB);
    var msg_payload = {firstName: firstName,lastName:lastName,DOB: DOB,username: username};
    mq_client.make_request('editProfile_queue',msg_payload,function(err,results){
        if(err){
            throw err;
        }else{
            res.render('editProfile');
        }
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

function getFollowers(req,res){
    console.log('Fetching Followers! '+req.session.username);
    var msg_payload = {username: req.session.username};
    mq_client.make_request('getFollowers_queue',msg_payload,function(err,followers){
        if(err) {
            throw err;
        }else{
            console.log("Followers :"+followers);
            res.send(followers);
        }
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

function getMyTweet(req,res){
    var msg_payload ={username: req.session.username};
    mq_client.make_request('getMyTweet_queue',msg_payload,function(err,results){
        if(err){
            throw err;
        }else if(results){
            res.send(results);
        }
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