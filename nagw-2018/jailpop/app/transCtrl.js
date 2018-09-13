(function () {
    'use strict';

    angular
        .module('app')
        .controller('transCtrl', transCtrl);

    transCtrl.$inject = ['$scope', '$http', '$filter', '$timeout', '$location', '$state', '$stateParams', 'settings'];
    function transCtrl($scope, $http, $filter, $timeout, $location, $state, $stateParams, settings) {
        var vm = this;
		vm.settings=settings;
	
		vm.fixTime = function(tm=0) {
			if(tm.length==4) {
				var hr=tm.substr(0,2);
				var min=tm.substr(2,2);
				var ap = " AM";
				if(hr>12) { 
					ap=" PM"; 
					hr=hr-12; 
				} else if(hr.substr(0,1)==0) {
					hr=hr.substr(1,1);	
				}	
				return(hr+":"+min+ap);	
			}
		}
		vm.book=false;
		
		vm.dataDtl = [];
		var getData = function() {
			var detailQueries = ["cnt", "inmate"]; // "cntall", "types", 
			vm.bookingnos = [];
			var response = [];
			angular.forEach(detailQueries, function (value) {
				$http.get("https://apps.larimer.org/data/sheriff/jail/?query=" + value)
					.success(function (response) {				
						if (response) {
							vm.dataDtl[value] = response;
								if(value=="inmate") {							
									var i=0;
									angular.forEach(response, function (r) {
										vm.bookingnos.push(r.BOOKING_NO);
									});
									$timeout(function () {
										getData2(vm.bookingnos);							
									}, 300);
								}
						}
					});
				}
			);
		};
			
		var getData2 = function(bookingnos) {
			var detailQueries2 = ["charge", "date"];
			angular.forEach(detailQueries2, function (value) {
					vm.dataDtl[value] = {};
					$http.get("https://apps.larimer.org/data/sheriff/jail/?query=" + value + "&bookingnos=" + bookingnos)
						.success(function (response) {
							var i=0;
							
							if (response) {
								angular.forEach(response, function (r) {	
									console.log(r);
									if(vm.dataDtl[value][r.BOOKING_NO]==undefined) {
										i=0;
										vm.dataDtl[value][r.BOOKING_NO]=new Array();
									}
									vm.dataDtl[value][r.BOOKING_NO][i] = { data: r }; 
									i++;
								});
							}
						}
					);
				}
			);
			
		};
		
		function init() {
			getData();
		};	
		init();
		

    }

}());