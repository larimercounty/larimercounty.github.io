(function () {
	var app = angular.module('app',
		['ui.bootstrap',
		'chart.js',
		'angular-loading-bar'
		])

	.controller('appCtrl', function($scope, $http, $timeout, $filter, dates) { // $state, $stateParams,
		var vm = this;
		vm.api="https://apps.larimer.org/data/sheriff/";
		vm.chartColors = ['#04a04d', '#144a20', '#115597', '#585453', '#133051', '#287d72', '#222222', '#7a0c00','#5488a7', '#9f481b'];
		vm.agencies = ['CSP','CSUP','FCPS','LCCC','LCSO','LPD','PAR','TPD','BPD','EPPD'];
		vm.agencyFullNames = ["Colorado State Police", "Colorado State University Police", "Fort Collins Police Services", "Larimer County Community Corrections", "Larimer County Sheriff's Office", "Loveland Police Department", "Parole", "Timnath Police Department", "Berthoud Police Department", "Estes Park Police Department"];
		vm.tableClass="table table-condensed table-responsive";
		vm.dates = dates.getDates();	
		vm.bookdate = vm.dates[0];
		$scope.isOpen = false;	
		vm.pageSizeList = [20,50,100,250,500];
		vm.defaultPageSize = 20;
		
		vm.norecords=0;
		vm.getData = function() {
			vm.bookingnos = [];
			var response = [];
			$http.get(vm.api+"?query=bookingreport&bookdate=" + vm.bookdate + "&bookagency="+ vm.bookagency)
				.success(function (response) {
					if (response) {
						vm.agency = new Array();
						vm.agencyData=new Array();
						vm.agencyNames=new Array();							
						vm.agencyColors=new Array();
						vm.agencyNumbers=new Array();						
						vm.data = [];
						if(response.records===null || !response.length) { 
							vm.norecords=1;
						} else {
							vm.norecords=0;
							angular.forEach(vm.agencies, function (a) {
								vm.agency.push(0);
							});
							var idx;
							vm.data = response;
							angular.forEach(response, function (r) {
								vm.bookingnos.push(r.BOOKING_NO);
								idx = vm.agencies.indexOf(r.ARREST_AGY);
								if(idx!==-1) {
									console.log(vm.agencies.indexOf(r.ARREST_AGY));
									vm.agency[idx]=vm.agency[idx]+1;
								}
							});
							$timeout(function () {
								getData2(vm.bookingnos);							
							}, 1000);
						}
					}
				}
			);
	
		};
		
		// $timeout(function () {
			vm.getData();
		// }, 1000);
			
		var getData2 = function(bookingnos) {
			var i=-1;
			angular.forEach(vm.agency, function (a) {
				i++;
				if(a>0) {
					vm.agencyData.push(a);
					vm.agencyNames.push(vm.agencies[i]);
					vm.agencyColors.push(vm.chartColors[i]);
					vm.agencyNumbers.push(i);
				}
			});		
			vm.charge = [];
			$http.get(vm.api+"?query=charge&bookingnos=" + bookingnos)
				.success(function (response) {
					var i=0;
					if (response) {
						angular.forEach(response, function (r) {
							if(vm.charge[r.BOOKING_NO]==undefined) {
								i=0;
								vm.charge[r.BOOKING_NO]=new Array();
							}
							vm.charge[r.BOOKING_NO][i] = { data: r }; 
							i++;
						});
					}
				}
			);
			
		};
		
		vm.getAge = function(bday) { 
			var birthday=new Date(bday);
			var ageDifMs = Date.now() - birthday.getTime();
			var ageDate = new Date(ageDifMs); // miliseconds from epoch
			return Math.abs(ageDate.getUTCFullYear() - 1970);
		}
		
		vm.getTime = function (fourDigitTime) {
			/* make sure add radix*/
			var hours24 = parseInt(fourDigitTime.substring(0, 2),10);
			var hours = ((hours24 + 11) % 12) + 1;
			var amPm = hours24 > 11 ? ' pm' : ' am';
			var minutes = fourDigitTime.substring(2);
			return hours + ':' + minutes + amPm;
		}
		
/* 		vm.getAgency = function(abbrev) {
			var name="";
			if(abbrev=='CSP') {
				name="Colorado State Police";
			} else if(abbrev=='CSUP') {
				name="Colorado State University Police";
			} else if(abbrev=='FCPS') {
				name="Fort Collins Police Services";
			} else if(abbrev=='LCSO') {
				name="Larimer County Sheriff's Office";
			} else if(abbrev=='LPD') {
				name="Loveland Police Department";
			} else if(abbrev=='PAR') {
				name="Parole";
			} else if(abbrev=='TPD') {
				name="Timnath Police Department";
			} else if(abbrev=='LPD') {
				name="Berthoud Police Department";
			} else if(abbrev=='EPPD') {
				name="Estes Park Police Department";
			}
			if(name) {
				return name;
			}
		} */

		vm.getAgencyIndex = function(abbrev) {
			var idx = vm.agencies.indexOf(abbrev);
			return idx; 
		}
		
	})	
	.factory('dates', ['dateFilter',
	  function(dateFilter) {
		return {
		  getDates: function() {
			var result = [];
			var day="";
			var month="";
			for (var i=0; i<14; i++) {
				var d = new Date();
				d.setDate(d.getDate() - i);
				day=d.getDate();
				month=d.getMonth()+1;
				if(day<10) { 
					day='0' + day;
				}
				if(month<10) { 
					month='0' + month;
				}
				result.push(month+'-'+day+'-'+d.getFullYear())
			}
			return(result);
		  }
		};
	  }
	])
	
	;
	
}());
