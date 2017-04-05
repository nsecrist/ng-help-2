'use strict';

// Declare app level module which depends on views, and components
var ngHelpApp = angular.module('ngHelp', [
    'ngRoute',
    'ngHelp.contents',
    'ngHelp.search',
    'ui.bootstrap',
    'ngHelp.searchpage'
]).

config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/home', {
        templateUrl: '/partials/welcome.html'
    }).
    when('/p/:name*', {
        templateUrl: function(urlattr) {
            return '/sections/' + urlattr.name;
        },
        controller: 'SectionController'
    }).
    when('/search', {
      templateUrl: '/search/results.html',
      // TO
      controller: 'ResultsController'
    }).
    otherwise({
        redirectTo: '/home'
    });

        $locationProvider.html5Mode({
          enabled: true
        });

        // $locationProvider.hashPrefix('!');
    }
]);

ngHelpApp.run(function($rootScope, $location, $anchorScroll, $routeParams) {
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $location.hash($routeParams.scrollTo);
        $anchorScroll();
    });
});
