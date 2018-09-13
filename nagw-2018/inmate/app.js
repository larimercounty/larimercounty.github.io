(function () {
	var app = angular.module('app',
		[
		'ui.bootstrap'
		])

	.controller('appCtrl', function($scope, $http, $timeout, $filter) { 
		var vm = this;
		vm.api="https://apps.larimer.org/data/sheriff/";		
		vm.tableClass="table table-condensed table-responsive table-striped table-hover";
		vm.fixTime = function(tm) {
			if(tm!=undefined && tm.length==4) {
				var hr=tm.substr(0,2);
				var min=tm.substr(2,2);
				var ap = " AM";
				if(hr>12) { 
					ap=" PM"; 
					hr=hr-12; 
				}
				return(hr+":"+min+ap);				
			}
		}

		vm.list = function(val) {
			console.log(val);
			return $http.get(vm.api+'?query=autocomplete', {
				params: {
				name: val,
				sensor: false
			  }
			}).then(function(response){
			  return response.data.map(function(item){
				return item.BOOKING_NAME + " | DOB: " + item.DATE_OF_BIRTH;
			  });
			});
		  };

		vm.getData = function() {
			// vm.name_array = vm.name.split(" | ");
			// vm.value = vm.name_array[1];
			var response = [];
			console.log(vm.name);
			$http.get(vm.api+"?query=info&name="+vm.name)
				.success(function (response) {
					if (response) {
						vm.info = response;
						vm.bookingno = response[0].BOOKING_NO;
						$http.get(vm.api+"?query=court&bookingno="+vm.bookingno)
							.success(function (response) {
									if (response) {
										vm.court = response;
									}
								}
							);
					}
				}	
			);
		};

		
	})
	
	;
	
}());
