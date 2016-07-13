angular.module("myProfile",[])
    .controller("ProfileController",['$http','$scope',function($http,$scope){
        //var cu;
        $scope.getCurrentUser = function(){
            $http({
                method: 'POST',
                url: '/getCurrentUser',
            }).success(function(data){
                $scope.results = data.username;
                $scope.email = data.email;
                $scope.dob = data.dob;
            });
        }

        $scope.allTweets = [];
        $scope.getMyTweets= function() {
            console.log("Your Name: "+$scope.results);
            //console.log("Fetch by user");
            $http({
                method: 'POST',
                url: '/getMyTweet',
                data: {'currentUser': $scope.results}
            }).success(function (data) {
                console.log(data);
                $scope.allTweets = data.Tweets;
                $scope.myUsername = data.username;
            }).error(function (err) {
                console.log(err);
            });
        };

        $scope.searchResults = [];
        $scope.searchUsers = function(){
            if($scope.search.charAt(0) != '#') {
                $http({
                    method: 'POST',
                    url: '/search',
                    data: {'searchStr': $scope.search}
                }).success(function (data) {
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
    }]);
