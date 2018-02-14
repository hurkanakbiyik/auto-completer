(function () {
	'use strict';

	angular
		.module('app')
		.controller('AppController', AppController);

	AppController.$inject = ['$rootScope','$timeout','$q','$http','movieService'];

	/** @ngInject */
	function AppController($rootScope,$timeout,$q,$http,movieService) {
		var vm = this;
		vm.search = search;
		vm.searchResultClick = searchResultClick;

		init();

		// Data
		$rootScope.global = {
			search: ''
		};

		function init() {

		}


		/**
		 * Search action
		 *
		 * @param query
		 * @returns {Promise}
		 */
		function search(query) {
			var deferred = $q.defer();

			if(query){
				movieService.searchMovies(query).then(function (response) {
					if(response.data.Error){
						deferred.reject(response.data.Error);
					}else{
						deferred.resolve(response.data.Search);
					}

				}, function myError(response) {
					deferred.reject(response);
				});
			}else{
				deferred.reject(null);
			}

			return deferred.promise;
		}

		/**
		 * Search result click action
		 *
		 * @param item
		 */
		function searchResultClick(item) {
			// If item has a link
			if (item.imdbID) {
				window.open ('http://www.imdb.com/title/' + item.imdbID,'_blank',false)
			}
		}

	}
})();
