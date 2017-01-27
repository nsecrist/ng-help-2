'use strict';

angular.module('ngHelp.contents', [])

.factory('ContentsService', function($timeout, $http) {
    var service = {
        fetch: function() {
            return $timeout(function() {
              console.log('making http request');
                // var data = $http.get('/contents/contents.json?v=' + (new Date().getTime())).then(function(response) {
                //     return response.data;
                // });
                var data = $http.get('/contents/contents.json').then(function(response) {
                    return response.data;
                });


                console.log("data: \n" + data);
                return data;
            }, 30);
        }
    }

    return service;
  })

  .controller('ContentsController', ['$scope', 'ContentsService', function($scope, ContentsService) {
    $scope.contents = ContentsService.fetch().then(function(contents) {
      $scope.contents = contents;
    });
  }])

  .controller('SectionController', ['$scope', '$route', '$routeParams', function($scope, $route, $routeParams) {
    console.log("SectionController");
    //$route.current.templateUrl = '/p/' + $routeParams.name + ".html?v=" + (new Date().getTime());
  }])

  .directive('nghelpContents', function() {
    return {
      templateUrl: '/contents/contents.html',
      restrict: 'E'
    };
  });
