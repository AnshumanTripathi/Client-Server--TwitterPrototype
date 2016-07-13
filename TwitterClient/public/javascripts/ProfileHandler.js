angular.module("Profile",[])
    .controller("ProfileController",['$http','$scope',function($http,$scope){
        //var cu;
        $scope.getCurrentUser = function(){
           $http({
               method: 'POST',
               url: '/getCurrentUser',
           }).success(function(data){
                $scope.results = data.username;
               console.log("Current User"+$scope.results);
               //cu = $scope.currentUserName;
           });
       }

        $scope.allTweets = [];
        $scope.getTweetsByUser = function() {
            $scope.username = document.getElementById('searchedUserName').innerHTML;
            console.log('Searched User Name: '+$scope.username);
            //console.log("Fetch by user");
            $http({
                method: 'GET',
                url: '/getTweetsByUser'
            }).success(function (data) {
                $scope.username = data.username
                $scope.allTweets = data.Tweets;
            }).error(function (err) {
                console.log(err);
            });
        };

        $scope.searchResults = [];
        $scope.showSearchSuggestions=true;
        $scope.searchUsers = function(){
            if($scope.search.charAt(0) != '#') {
                $http({
                    method: 'POST',
                    url: '/search',
                    data: {'searchStr': $scope.search}
                }).success(function (data) {
                    console.log(data);
                    $scope.searchResults = data;
                    $scope.showSearchSuggestions=true;
                });

            }else
            if($scope.search.charAt(0) == '#'){

                var hashTag = $scope.search;
                hashTag = hashTag.substr(1);
                console.log("HashTag is: "+hashTag)
                $http({
                    method: 'POST',
                    url: '/searchTweet',
                    data: {'searchStr': hashTag}
                }).success(function(data){
                    $scope.showSearchSuggestions=true;
                    $scope.searchResults = data;
                });
            }
            document.getElementById('suggestions').style = 'display: block';
        }

        $scope.logout = function(){
            $http(
                {
                    method: 'POST',
                    url: '/logout'
                }
            ).success(function(data){
                window.location.assign('/');
            });
        }

        $scope.follow = function(){
            var username = document.getElementById('searchedUserName').innerHTML;
            $http({
                method: 'POST',
                url: '/follow',
                data: {'follow' : username}
            }).success(function(data){
                if(data.statusCode = 200) {
                    console.log('Follower Added!');
                }
            });
        }
        $scope.hideFollower = false;
        $scope.getFollowers = function(){
            console.log("In get Followers");
            var username = document.getElementById('searchedUserName').innerHTML;
            $http({
                method: 'POST',
                url: '/getFollowers',
                data: {'currentUser':username}
            }).success(function(data){
                console.log("My Followers: "+data.Following);
                if(data.Following) {
                    for (var i = 0; i < data.Following.length; i++) {
                        if (username == data.Following[i] || username == $scope.results) {
                            $scope.hideFollower = true;
                        }
                    }
                }
            });
        }

        $scope.retweet = function(){
            var currentTweet = document.getElementById('hiddenTweet').value;
            console.log('Current Tweet: '+currentTweet);
            $http({
                method: 'POST',
                url: '/retweet',
                data: {
                    "currentTweet": currentTweet
                }
            }).success(function(data){
                console.log("Retweeted: "+currentTweet);
            });
        }
    }]);
