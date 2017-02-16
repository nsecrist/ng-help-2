'use strict';

angular.module('ngHelp.contents', [])

    .factory('ContentsService', function($timeout, $http) {
        var data = {};
        var service = {
            fetch: function() {
              // If we have not already retrieved the contents.JSON object, do so.
              if(data !== null) {
                return $timeout(function() {
                    console.log('making http request');
                    // var data = $http.get('/contents/contents.json?v=' + (new Date().getTime())).then(function(response) {
                    //     return response.data;
                    // });
                    data = $http.get('/contents/contents.json').then(function(response) {
                        return response.data;
                    });

                    console.log("data: \n" + data);
                    return data;
                  }, 30);
                }
                else {
                  console.log("Hooray! Already have contents.json loaded!");
                  return data;
                }
              }
            }
        return service;
    })

    .service('SearchString', function() {
      var searchString = '';

      return {
        getSearchString: function() {
          return searchString;
        },
        setSearchString: function(value) {
          searchString = value;
        }
      };
    })

    .controller('ContentsController', ['$scope', 'ContentsService', function($scope, ContentsService) {
        $scope.contents = ContentsService.fetch().then(function(contents) {
            $scope.contents = contents;
        });
    }])

    .controller('SectionController', ['$scope', '$location', 'ContentsService', function($scope, $location, ContentsService) {
        console.log("SectionController");
        // $route.current.templateUrl = '/p/' + $routeParams.name + ".html?v=" + (new Date().getTime());
        $scope.GoToSection = function(sectionTitle) {
          // Get contents.json object
          var contents = ContentsService.fetch().then(function(contents) {
            for (var i = 0; i < contents.length; i++) {
                if (contents[i].title === sectionTitle) {
                    $location.url("/" + contents[i].url);
                    console.log("GoToSection Path: " + $location.url());
                }
              }
            });
        };
    }])

    .controller('SearchController', ['$scope', '$location', 'SearchString', function($scope, $location, SearchString) {
        $scope.search = function() {
            console.log("Searching for: " + $scope.SearchString);
            SearchString.setSearchString($scope.SearchString);
            $location.url("/search?");
        };
        $scope.getSearchString = function() {
          return SearchString.getSearchString();
        };
    }])

    .directive('nghelpContents', function() {
        return {
            templateUrl: '/contents/contents.html',
            restrict: 'E'
        };
    });
