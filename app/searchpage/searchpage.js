angular.module('ngHelp.searchpage', [])

  .controller('PopoverPageSearchCtrl', function ($scope, $timeout, $http) {
    $scope.pageSearchPopover = {
      content: 'Search Within Page',
      // templateUrl: './searchpage/searchPageTemplate.html',
      templateUrl: './searchpage/search-window.html',
      searchTerm: ''
    };

    $scope.search = function(type) {
      return $timeout(function () {
        try {
          switch(type) {
            case 1: // Search Forward
              return $http.post('/forward').then(function(response) {
                console.log("Response: " + response);
                return response.data;
              });
            case 2: // Search Backward
              return $http.post('/backward').then(function(response) {
                console.log("Response: " + response);
                return response.data;
              });
              case 3: // Cancel Search
                $('#PageSearch').popover('hide');

                return $http.post('/cancel').then(function(response) {
                  console.log("Response: " + response);
                  return response.data;
                });
            default:
              return $http.post('/pagesearch?v=' + $scope.pageSearchPopover.searchTerm).then(function(response) {
                console.log("Response: " + response);
                return response.data;
              });
          }
        } catch(err) {
          return response.data;
        }
      }, 30);
    };

    $scope.inPageSearch = function(type) {
          console.log("Searching for: '" + $scope.pageSearchPopover.searchTerm + "' within the page!");
          $scope.search(type);
    };

    $scope.alertSearch = function($event) {
      if ($event.which === 13) {
        console.log("Enter key pressed.")
        $scope.inPageSearch(0);
      }
    };
  });
