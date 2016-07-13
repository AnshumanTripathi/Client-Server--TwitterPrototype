var app = angular.module('Twitter',[]);

app.directive('topNav',function(){
    return{
        restrict: 'E',
        templateUrl: "../directives/top-nav.html"
    };
});

app.controller("LoginController",['$http','$scope',function($http,$scope){
    $scope.invalidLogin = true;
    $scope.login = function(){
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        console.log(email+"    "+password);
        $http(
            {
                method: 'POST',
                url:'/login',
                data:{
                    "email" : email,
                    "password" : password
                }
            }
        ).success(function(data){
            console.log("Data"+data);
            if(data.statusCode == 200){
                window.location.assign('/goToLogin');
            }
            else if(data.statusCode == 400)
            {
                $scope.invalidLogin = false;
            }
        });
    }
}]);
