/**
 * Routes file for Login
 */

var ejs = require("ejs");
var mysql = require('./mysql');
var hash = require('./encryption').hash;
var tweet = require('./tweet');

exports.login = function(req, res){
	if (req.session.user) { 
		  console.log('validated user');
		  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		  res.render("profileHome",{userObj:req.session.user});
		  //next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
	  } else { 
		  res.render('login', { title: 'Log in to Twitter', alertClass: '', msg: '' });
	  }
};

//Check login - called when '/checklogin' POST call given from AngularJS module in login.ejs
exports.checkLogin = function(req,res)
{
	if (req.session.user) { 
		  console.log('validated user');
		  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		  res.render("profileHome",{userObj:req.session.user});
		  //next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
	  } else { 
	var json_responses;
	var email = req.param("email");
	var pass = req.param("password");
	  if (!module.parent) console.log('authenticating %s:%s', email, pass);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
	                                                                         
	  var getUser="select * from account where email=?";
		console.log("Query is:"+getUser);
		
		mysql.fetchData(function(err,results){
			if(err){
				console.log("ERROR: "+err);
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
			else 
			{
				if(results.length > 0){
					var rows = results;
					var jsonString = JSON.stringify(results);
					var jsonParse = JSON.parse(jsonString);
					// apply the same algorithm to the POSTed password, applying                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
					  // the hash against the pass / salt, if there is a match we                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
					  // found the user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
					  hash(pass, rows[0].salt, function(err, hash){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
					    if (err) {
					    	console.log("ERROR: "+err);
					    	json_responses = {"statusCode" : 401};
							res.send(json_responses);
					    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
					    if (hash.toString() == rows[0].hash){
						   
						        	//console.log(result);
						        	console.log(jsonParse);
						        	req.session.user = jsonParse;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
					                req.session.success = 'Authenticated as ' + jsonParse.firstName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
					                  + ' click to <a href="/logout">logout</a>.';  
					                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
					                json_responses = {"statusCode" : 200, "userObj" : jsonParse};
									res.send(json_responses);
					                //res.end(result);
						            
					    } else {
					    	req.session.error = 'Authentication failed';
					    	//res.render('login', { title: 'Twitter' , alertClass: 'alert-danger', msg: 'Email/Password combination is Invalid.'});
					    	json_responses = {"statusCode" : 401, "msg" : "Email/Password combination is Invalid."};
							res.send(json_responses);
					    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
					                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
					  });
				}
				else {    
					console.log("Invalid Login");
					//res.render('login', { title: 'Twitter' , alertClass: 'alert-danger', msg: 'The email and password you entered did not match our records. Please double-check and try again.'});
					json_responses = {"statusCode" : 401, "msg" : "The email and password you entered did not match our records. Please double-check and try again."};
					res.send(json_responses);
				}
			}  
		}, getUser, [email]);
	  }
};


//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	//Checks before redirecting whether the session is valid
	if(req.session.user)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render("profileHome",{userObj:req.session.user});
	}
	else
	{
		res.redirect('/');
	}
};


//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};
