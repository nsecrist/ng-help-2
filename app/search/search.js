'use strict';

angular.module('ngHelp.search', [])

.factory('SearchService', function($timeout, $http) {
    // Privately held observer pattern stuff
    var observerCallbacks = [];
    var searchTerm = "";

    //register an observer
    var registerObserverCallback = function(callback) {
      observerCallbacks.push(callback);
    };

    //call this when you know 'foo' has been changed
    var notifyObservers = function() {
      angular.forEach(observerCallbacks, function(callback){
        callback();
      });
    };

    // Public service interface
    var service = {
        getSearchTerm: function() {
          return searchTerm;
        },

        register: function(callback) {
           registerObserverCallback(callback);
         },

        search: function() {
            return $timeout(function() {
              try {
                return $http.post('/find/search.json?v=' + searchTerm).then(function(response) {
                    console.log("Response: " + response);
                    return response.data;
                });
              } catch(err) {
                return response.data;
              }
            }, 30);
        },

        setSearchTerm: function(value) {
          // Prevent notifying observers if there isn't a change
          if (value != searchTerm)
          {
            searchTerm = value;
            notifyObservers();
          }
        }
    }

    return service;
  })

  .controller('SearchController', ['$scope', '$location', 'SearchService', function($scope, $location, SearchService) {
    $scope.searchTerm = SearchService.searchTerm;

    $scope.updateSearchTerm = function() {

      if ($scope.searchTerm != "") {
        SearchService.setSearchTerm($scope.searchTerm);
        $location.path('/search');
      }
    };
  }])

  .controller('ResultsController', ['$scope', 'SearchService', function($scope, SearchService) {
    var performSearch = function() {
      $scope.searchTerm = SearchService.getSearchTerm();
      SearchService.search().then(function(results) {
        console.log("Results Received: " + JSON.stringify(results));
        $scope.results = results;
      });
    };

    SearchService.register(performSearch);

    performSearch();
  }]);
