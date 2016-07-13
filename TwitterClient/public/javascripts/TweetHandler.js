angular.module('Tweets',[])
    .controller('TweetHandler',['$http','$scope',function($http,$scope){
        $scope.allTweets = [];
        $scope.followers = {};
        $scope.getTweets = function() {
            console.log('Getting Tweets!');
            $http({
                method: 'GET',
                url: '/getTweets'
            }).success(function (data) {
               $scope.allTweets = data;
                console.log($scope.allTweets);
            }).error(function (err) {
                console.log(err);
            });
        };
        $scope.postTweet = function(){
            //if(document.getElementById(tweet).value != null){
            console.log('Posting Tweets!');
                $http({
                    method: 'POST',
                    url: '/tweet',
                    data: {'tweet': $scope.tweet}
                }).success(function (data) {
                    if (data.statusCode = 200) {
                        $scope.getTweets();
                        window.location.assign('/goToLogin');
                    }
                }).error(function (err) {
                    alert("Error :" + err);
                });
            //}
            //else{
            //    alert("Empty!")
            //}
        }

        $scope.logout = function(){
            $http(
                {
                    method: 'POST',
                    url: '/logout'
                }
            ).success(function(data){
                alert('You Have been Successfully logged out!');
                window.location.assign('/');
            });
        }

        $scope.searchResults = [];
        $scope.searchUsers = function(){
            console.log("Searching...."+$scope.search);
            if($scope.search.charAt(0) != '#') {
                $http({
                    method: 'POST',
                    url: '/search',
                    data: {'searchStr': $scope.search}
                }).success(function (data) {
                    console.log(data);
                    $scope.searchResults = data;
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
                    $scope.searchResults = data;
                });
            }
            document.getElementById('suggestions').style = 'display: block';
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

        $scope.getCurrentUser = function(){
            $http({
                method: 'POST',
                url: '/getCurrentUser',
            }).success(function(data){
                $scope.results = data;
                $scope.followers = data.Followers;

            });
        }

    }]);