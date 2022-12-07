/*This is the main file where angular is defined*/
require('./bootstrap');

var myApp = angular.module('myApp', ['ngRoute', 'ngCookies']);

/*Routes*/
myApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
           templateUrl: 'templates/users/login.html',
           controller: 'userController'
        });

        $routeProvider.when('/dashboard', {
            templateUrl: 'templates/users/dashboard.html',
            controller: 'userController',
            authenticated: true
        });

        $routeProvider.when('/gallery/view', {
            templateUrl: 'templates/gallery/gallery-view.html',
            controller: 'galleryController',
            authenticated: true
        });
        $routeProvider.when('/gallery/add', {
            templateUrl: 'templates/gallery/gallery-add.html',
            controller: 'galleryController',
            authenticated: true
        });

        $routeProvider.when('/logout', {
            templateUrl: 'templates/users/logout.html',
            controller: 'userController',
            authenticated: true
        });

        $routeProvider.otherwise('/');
    }
]);

/*Authentication*/
myApp.run(['$rootScope', '$location', 'userModel',
    function($rootScope, $location, userModel) {
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if (next.$$route.authenticated) {
                if(!userModel.getAuthStatus()) {
                    $location.path('/');
                }
            }

            if (next.$$route.originalPath === '/') {
                console.log('Login page');
                if (userModel.getAuthStatus()) {
                    $location.path(current.$$route.originalPath);
                }
            }
        })
    }
]);

/*Controllers*/
myApp.controller('globalController', ['$scope', function($scope) {
    $scope.global = {};
    $scope.global.navUrl = 'templates/partials/nav.html';
}]);

myApp.controller('navController', ['$scope', '$location', 'userModel', function($scope, $location, userModel) {
    angular.extend($scope, {
        user: userModel.getUserObject(),
        navUrl: [{
            link: 'Home',
            url: '/dashboard',
            subMenu: [{
                link: 'View Gallery',
                url: '/gallery/view',
            }, {
                link: 'Add Gallery',
                url: '/gallery/add',
            }]
        }, {
            link: 'View Gallery',
            url: '/gallery/view'
        }, {
            link: 'Add Gallery',
            url: '/gallery/add'
        }]
    });
    // console.log("$scope.user: ", $scope.user);

    angular.extend($scope, {
        doLogout: function() {
            userModel.doUserLogout();
            $location.path('/');
        },
        checkActiveLink: function(routeLink) {
            if ($location.path() === routeLink) {
                return 'make-active';
            }
        }
    });
}]);

myApp.controller('galleryController', ['$scope', '$location','galleryModel', function($scope, $location, galleryModel) {
    angular.extend($scope, {
       newGallery: {},
       errorDiv: false,
       errorMessage: []
    });

    /*Functions*/
    angular.extend($scope, {
       saveNewGallery: function(addGalleryForm) {
           console.log('addGalleryForm: ', addGalleryForm);
           if (addGalleryForm.$valid) {
               $scope.formSubmitted = false;
               galleryModel.saveGallery($scope.newGallery).then(function(response) {
                   console.log('Response: ', response);
                   $location.path('/gallery/view')
               }, function(error) {
                   console.log('Error: ', error.data);
               });
           } else {
               $scope.formSubmitted = true;
               console.log('Error');
           }
       }
    });
}]);

myApp.controller('userController', ['$scope', '$location', 'userModel', function($scope, $location, userModel) {
    console.log('Inside the userController!');
    angular.extend($scope, {
        login: {
            username: 'mickey@test.com',
            password: 'password'
        }
    });
    angular.extend($scope, {
        doLogin: function() {
            var data = {
                email: $scope.email,
                password: $scope.password
            }
            console.log(data);
            userModel.doUserLogin(data).then(function() {
                $location.path('/dashboard');
            });
        }
    });
}]);

/*Models*/
myApp.factory('galleryModel', ['$http', function($http) {
    return {
        saveGallery: function(galleryData) {
            return $http({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: baseUrl + 'gallery',
                method: 'POST',
                data: {
                    name: galleryData.name
                }
            });
        }
    };
}]);
myApp.factory('userModel', ['$http', '$location', '$route', '$cookies', function($http, $location, $route, $cookies) {
    var userModel = {};
    userModel.doUserLogin = function(data) {
        return $http({
            headers: {
                'Content-Type': 'application/json'
            },
            url: baseUrl + 'auth',
            method: "POST",
            data: {
                email: data.email,
                password: data.password
            }
        }).then(function(response) {
            console.log("Response: ", response);
            $cookies.put('auth', JSON.stringify(response));
        }, function(error) {
            console.log("Error: ", error.data);
            console.log( "Status: ", error.status);
            console.log("Headers: ", error.headers);
            alert(error.data);
        });
    };

    /**
     * Return whether the user is logged in or not
     * based on the cookie set during the login
     *
     * @return {boolean}
     */
    userModel.getAuthStatus = function() {
        var status = $cookies.get('auth');
        if (status) {
            return true;
        } else {
            return false
        }
    };

    /**
     * Get the user object converted from string to JSON
     *
     * @return {user object}
     */
    userModel.getUserObject = function() {
        var userObj = angular.fromJson($cookies.get('auth'));
        // console.log("userObj: ", userObj);
        return userObj;
    }

    /**
     * Close the session of the current user
     * and delete the cookie set for him
     *
     * @return {boolean}
     */
    userModel.doUserLogout = function() {
        $cookies.remove('auth');
    };
    return userModel;
}]);
