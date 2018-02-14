describe('Movie factory', function() {
	var movieService, mock, $http;
	var query = "Star";

	beforeEach(module('app'));

	beforeEach(module('app.core'));

	beforeEach(function() {
		mock = {alert: jasmine.createSpy()};

		module(function($provide) {
			$provide.value('$http', mock);
		});

		inject(function($injector) {
			movieService = $injector.get('movieService');
			$http = $injector.get('$http');
		});
	});

	it('should exist', function() {
		expect(movieService).toBeDefined();
	});
});
