(function () {
	var app = angular.module('app',
		[
//		'ngJustGage',
		'ui.router',
		'ui.bootstrap',
		'ngSanitize',
		'gaugejs',
		'angular-loading-bar',
		'chart.js'
		])
	.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
		$urlRouterProvider.otherwise('/totals');

		$stateProvider
			.state('totals', {
				url: '/totals',
				templateUrl : '/sites/all/modules/custom/jailpop/app/totals.htm',
				title: 'Current Jail Population',
				controller  : 'totalsCtrl',
				controllerAs: 'vm'
			})
			.state('trans', {
				url: '/trans',
				templateUrl : '/sites/all/modules/custom/jailpop/app/trans.htm',
				title: 'Transient/Homeless Bookings',
				controller  : 'transCtrl',
				controllerAs: 'vm'
			})
		;
	})
	// .run(['$rootScope', function($rootScope) {
		// $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
			// $rootScope.pgTitle = toState.title;
		// });
	// }])
	
	;
	
}());
