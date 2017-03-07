angular.module('ngHelp.searchpage', [])

  .controller('PopoverPageSearchCtrl', function ($scope, $timeout, $http) {
    $scope.pageSearchPopover = {
      content: 'Search Within Page',
      templateUrl: './searchpage/searchPageTemplate.html',
      searchTerm: ''
    };

    $scope.search = function() {
      return $timeout(function () {
        try {
          return $http.post('/pagesearch?v=' + $scope.pageSearchPopover.searchTerm).then(function(response) {
            console.log("Response: " + response);
            return response.data;
          });
        } catch(err) {
          return response.data;
        }
      }, 30);
    };

    $scope.inPageSearch = function() {
      console.log("Searching for: '" + $scope.pageSearchPopover.searchTerm + "' within the page!");
      $scope.search();
    };
  });
