(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('movieService', movieService);

	movieService.$inject = ['$http'];

	/** @ngInject */
  function movieService($http) {
    var service = {
      searchMovies: searchMovies
    };
    return service;

    //////////
    /**
     * Resolve api
     * query
     */
    function searchMovies(query) {
		return $http.get('http://www.omdbapi.com/?s='+query+'&apikey=1a7568ba');
    }

  }

})();
