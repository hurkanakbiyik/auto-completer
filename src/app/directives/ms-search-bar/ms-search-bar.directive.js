(function ()
{
	'use strict';

	angular
		.module('app.core')
		.controller('MsSearchBarController', MsSearchBarController)
		.directive('msSearchBar', msSearchBarDirective);

	MsSearchBarController.$inject = ['$scope','$element','$timeout'];

	/** @ngInject */
	function MsSearchBarController($scope, $element, $timeout)
	{
		var vm = this;

		// Data
		vm.query = '';
		vm.queryOptions = {
			debounce: vm.debounce || 1000
		};
		vm.resultsLoading = false;
		vm.results = null;
		vm.selectedResultIndex = 0;
		vm.ignoreMouseEvents = false;

		// Methods
		vm.populateResults = populateResults;
		vm.clear = clear;

		vm.absorbEvent = absorbEvent;
		vm.handleKeydown = handleKeydown;
		vm.handleMouseenter = handleMouseenter;
		vm.temporarilyIgnoreMouseEvents = temporarilyIgnoreMouseEvents;
		vm.handleResultClick = handleResultClick;
		vm.ensureSelectedResultIsVisible = ensureSelectedResultIsVisible;

		//////////

		init();

		function init()
		{
			// Watch the model changes to trigger the search
			$scope.$watch('MsSearchBar.query', function (current, old)
			{
				if ( angular.isUndefined(current) )
				{
					return;
				}

				if ( angular.equals(current, old) )
				{
					return;
				}

				// Evaluate the onSearch function to access the
				// function itself
				var onSearchEvaluated = $scope.$parent.$eval(vm.onSearch, {query: current}),
					isArray = angular.isArray(onSearchEvaluated),
					isPromise = (onSearchEvaluated && !!onSearchEvaluated.then);

				if ( isArray )
				{
					// Populate the results
					vm.populateResults(onSearchEvaluated);
				}

				if ( isPromise )
				{
					// Show the loader
					vm.resultsLoading = true;

					onSearchEvaluated.then(
						// Success
						function (response)
						{
							// Populate the results
							vm.populateResults(response);
						},
						// Error
						function (message)
						{
							// Assign an empty array to show
							// the no-results screen
							if(message){
								vm.populateResults([]);
								vm.errorMessage = message ? message : "No Result!"
							}else{
								vm.populateResults(null);
								vm.errorMessage = ""
							}

						}
					).finally(function ()
						{
							// Hide the loader
							vm.resultsLoading = false;
						}
					);
				}
			});
		}

		/**
		 * Populate the results
		 *
		 * @param results
		 */
		function populateResults(results)
		{

			var isArray = angular.isArray(results),
				isNull = results === null;

			// Only accept arrays and null values
			if ( !isArray && !isNull )
			{
				return;
			}

			// Reset the selected result
			vm.selectedResultIndex = 0;

			// Populate the results
			vm.results = results;
		}

		/**
		 * Clear
		 */
		function clear()
		{
			// Empty the query
			vm.query = '';
			// Empty results to hide the results view
		}

		/**
		 * Absorb the given event
		 *
		 * @param event
		 */
		function absorbEvent(event)
		{
			event.preventDefault();
		}

		/**
		 * Handle keydown
		 *
		 * @param event
		 */
		function handleKeydown(event)
		{
			var keyCode = event.keyCode,
				keys = [27, 38, 40];

			// Prevent the default action if
			// one of the keys are pressed that
			// we are listening
			if ( keys.indexOf(keyCode) > -1 )
			{
				event.preventDefault();
			}

			switch ( keyCode )
			{
				// Enter
				case 13:

					// Trigger result click
					vm.handleResultClick(vm.results[vm.selectedResultIndex]);

					break;

				// Escape
				case 27:

					// Clear  the search bar
					vm.clear();

					break;

				// Up Arrow
				case 38:

					// Decrease the selected result index
					if ( vm.selectedResultIndex - 1 >= 0 )
					{
						// Decrease the selected index
						vm.selectedResultIndex--;

						// Make sure the selected result is in the view
						vm.ensureSelectedResultIsVisible();
					}

					break;

				// Down Arrow
				case 40:

					if ( !vm.results )
					{
						return;
					}

					// Increase the selected result index
					if ( vm.selectedResultIndex + 1 < vm.results.length )
					{
						// Increase the selected index
						vm.selectedResultIndex++;

						// Make sure the selected result is in the view
						vm.ensureSelectedResultIsVisible();
					}

					break;

				default:
					break;
			}
		}

		/**
		 * Handle mouseenter
		 *
		 * @param index
		 */
		function handleMouseenter(index)
		{
			if ( vm.ignoreMouseEvents )
			{
				return;
			}

			// Update the selected result index
			// with the given index
			vm.selectedResultIndex = index;
		}

		/**
		 * Set a variable for a limited time
		 * to make other functions to ignore
		 * the mouse events
		 */
		function temporarilyIgnoreMouseEvents()
		{
			// Set the variable
			vm.ignoreMouseEvents = true;

			// Cancel the previous timeout
			$timeout.cancel(vm.mouseEventIgnoreTimeout);

			// Set the timeout
			vm.mouseEventIgnoreTimeout = $timeout(function ()
			{
				vm.ignoreMouseEvents = false;
			}, 250);
		}

		/**
		 * Handle the result click
		 *
		 * @param item
		 */
		function handleResultClick(item)
		{
			if ( vm.onResultClick )
			{
				vm.onResultClick({item: item});
			}
		}

		/**
		 * Ensure the selected result will
		 * always be visible on the results
		 * area
		 */
		function ensureSelectedResultIsVisible()
		{
			var resultsEl = $element.find('.ms-search-bar-results'),
				selectedItemEl = angular.element(resultsEl.find('.result')[vm.selectedResultIndex]);

			if ( resultsEl && selectedItemEl )
			{
				var top = selectedItemEl.position().top - 8,
					bottom = selectedItemEl.position().top + selectedItemEl.outerHeight() + 8;

				// Start ignoring mouse events
				vm.temporarilyIgnoreMouseEvents();

				if ( resultsEl.scrollTop() > top )
				{
					resultsEl.scrollTop(top);
				}

				if ( bottom > (resultsEl.height() + resultsEl.scrollTop()) )
				{
					resultsEl.scrollTop(bottom - resultsEl.height());
				}
			}
		}
	}

	/** @ngInject */
	function msSearchBarDirective($document,$timeout)
	{
		return {
			restrict        : 'E',
			scope           : {},
			require         : 'msSearchBar',
			controller      : 'MsSearchBarController as MsSearchBar',
			bindToController: {
				debounce     : '=?',
				onSearch     : '@',
				onResultClick: '&?'
			},
			templateUrl     : 'app/directives/ms-search-bar/ms-search-bar.html',
			compile         : function (tElement)
			{
				// Add class
				tElement.addClass('ms-search-bar');

				return function postLink(scope, iElement)
				{
					// Data
					var inputEl,
						bodyEl = $document.find('body');

					// Methods

					//////////

					// Initialize
					init();

					/**
					 * Initialize
					 */
					function init()
					{
						inputEl = iElement.find('#ms-search-bar-input');
						// Add expanded class
						iElement.addClass('expanded');
						// Focus on the input
						inputEl.focus();
					}
				};
			}
		};
	}
})();
