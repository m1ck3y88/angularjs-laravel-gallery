/*This is the main file where angular is defined*/
require('./bootstrap');

var myApp = angular.module('myApp', ['ngRoute', 'ngCookies']);

myApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
           templateUrl: 'templates/users/login.html',
           controller: 'userController'
        });

        $routeProvider.when('/dashboard', {
            templateUrl: 'templates/users/dashboard.html',
            controller: 'userController'
        });

        $routeProvider.when('/logout', {
            templateUrl: 'templates/users/logout.html',
            controller: 'userController'
        });

        $routeProvider.otherwise('/');
    }
]);

myApp.controller('userController', ['$scope', '$http', function($scope, $http) {
    console.log('Inside the userController!');
    angular.extend($scope, {
        doLogin: function(loginForm) {
            $http({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: baseUrl + 'auth',
                method: "POST",
                data: {
                    email: $scope.login.username,
                    password: $scope.login.password
                }
            }).then(function(response) {
                console.log("Response: ", response);
            }, function(error) {
                console.log("Error: ", error);
            });
        }
    });
}]);
