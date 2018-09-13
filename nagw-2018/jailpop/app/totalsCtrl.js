(function () {
    'use strict';

    angular
        .module('app')
        .controller('totalsCtrl', totalsCtrl);
		
    totalsCtrl.$inject = ['$scope', '$http', '$filter', '$timeout', '$location', '$state', '$stateParams', '$sce', 'settings'];
    function totalsCtrl($scope, $http, $filter, $timeout, $location, $state, $stateParams, $sce, settings) {
        var vm = this;
		vm.settings=settings;
		vm.isOpenPop = vm.isOpenTrans = vm.isOpenMf = vm.isOpenTypes = false;
							
		var getData2 = function() {
			vm.total=vm.male+vm.female;
			vm.totalPct=(vm.total/vm.settings.capacity)*100+'%';
			vm.targetPct=(vm.settings.target/vm.settings.capacity)*100+'%';
			if(vm.total>=Number(settings.capacityRed)) {
				vm.total_color=settings.red;
			} else if(vm.total>=Number(settings.capacityYellow)) {
				vm.total_color=settings.yellow;				
			} else {
				vm.total_color=settings.blue;
			}
			vm.empty=vm.settings.capacity - vm.total;
		};
		
		var getData = function() {
			var detailNames = ["gender", "cat", "type", "felony"];
			var detailQueries = ["JailPopulation?$format=json&$select=INMATE_GENDER,AVERAGE_JAIL_POPULATION&$filter=FILTER_LAST_RUN%20eq%20%27Yes%27%20and%20FACILITY_CATEGORY%20eq%20%27ADP%20Facility%27",	"JailPopulation?$format=json&$select=INMATE_HTS_CATEGORY,AVERAGE_JAIL_POPULATION&$filter=FILTER_LAST_RUN%20eq%20%27Yes%27%20and%20FACILITY_CATEGORY%20eq%20%27ADP%20Facility%27",	"JailPopulation?$format=json&$select=INMATE_TYPE_CATEGORY,AVERAGE_JAIL_POPULATION&$filter=FILTER_LAST_RUN%20eq%20%27Yes%27%20and%20FACILITY_CATEGORY%20eq%20%27ADP%20Facility%27",	"JailCharges?$format=json&$select=PERSON_COUNT,CHARGE_LEVEL_GROUP,CAV_INMATE_TYPE_INMATE_TYPE_CATEGORY&$filter=FILTER_LAST_RUN%20eq%20%27Yes%27%20and%20TOP_CHARGE_RANK%20eq%201%20and%20CAV_INMATE_TYPE_INMATE_TYPE_CATEGORY%20eq%20%27Pre-Sentenced%27%20and%20(CHARGE_LEVEL_GROUP%20eq%20%27Misdemeanor%27%20or%20CHARGE_LEVEL_GROUP%20eq%20%27Felony%27)"
			];
			vm.dataDtl = [];
			vm.bookingnos = [];
			var response = [];
			var cnt="";
			var i=0;
			angular.forEach(detailQueries, function (value) {
				$http.get(settings.restPath + value) //settings.restPath+
					.success(function (response) {
						if (response) {
							angular.forEach(response.d.results, function (r) {										
								if(r.AVERAGE_JAIL_POPULATION!=undefined) {
									cnt=r.AVERAGE_JAIL_POPULATION;
								} else if(r.PERSON_COUNT!=undefined) {
									cnt=r.PERSON_COUNT;
								}
								if(r.INMATE_GENDER!=undefined) {
									if(r.INMATE_GENDER=='MALE') {
										vm.male=cnt;
										getData2();
									} else if(r.INMATE_GENDER=='FEMALE') {
										vm.female=cnt;
									}
								} else if(r.INMATE_HTS_CATEGORY!=undefined) {
									if(r.INMATE_HTS_CATEGORY=="HTS") {
										vm.totalths=cnt;
									} else if(r.INMATE_HTS_CATEGORY=='Other') {
										vm.other=cnt;
									}
								} else if(r.INMATE_TYPE_CATEGORY!=undefined) {
									if(r.INMATE_TYPE_CATEGORY=='Pre-Sentenced') {
										vm.pretrial=cnt;
									} else if(r.INMATE_TYPE_CATEGORY=='Hold') {
										vm.hold=cnt;
									}  else if(r.INMATE_TYPE_CATEGORY=='Sentenced') {
										vm.sentenced=cnt;
									} 		
								} else if(r.CHARGE_LEVEL_GROUP!=undefined) {
									if(r.CHARGE_LEVEL_GROUP=='Felony') {
										vm.felony=cnt;
									} else if(r.CHARGE_LEVEL_GROUP=='Misdemeanor') {
										vm.misdemeanor=cnt;
										vm.felonyPct1 = Math.round((Number(vm.felony)/(Number(vm.felony)+Number(vm.misdemeanor)))*100);
										vm.misdemeanorPct=Number(100-vm.felonyPct1)+'%';
										vm.felonyPct = vm.felonyPct1+'%';
									}
								}	 		
							});
						}
					});
				});
		};
		
		vm.monthly=[];
		vm.monthly['d']=[];
		vm.monthly['m']=[];
		vm.monthly['f']=[];
		vm.monthly['t']=[];
		var months = new Array('', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
		vm.getMonthly = function() {
			$http.get(settings.restPath+"JailPopulation?$format=json&$select=SNAPSHOT_YEAR,SNAPSHOT_PERIOD_NUMBER,AVERAGE_JAIL_POPULATION&$filter=FACILITY_CATEGORY%20eq%20%27ADP%20Facility%27")
				.success(function (response) {
					if (response) {
						var i=0;
						angular.forEach(response.d.results, function (r) {
							vm.monthly['d'].push(months[r.SNAPSHOT_PERIOD_NUMBER]+' '+r.SNAPSHOT_YEAR);
							vm.monthly['t'].push(r.AVERAGE_JAIL_POPULATION);
						});	
						}
					}
				);
		}			

		$scope.gaugeOptions = {
			lines: 12,
			angle: 0,
			lineWidth: 0.44,
			pointer: {
				length: 0.9,
				strokeWidth: 0.035,
				color: '#000000'
			},
			percentColors: [[0.0, "#84b761" ], [0.811, "#fdd400"], [0.909, "#cc4748"]],
			limitMax: 'false',
			// If true, the pointer will not go past the end of the gauge
			colorStart: '#F2E30F',
			colorStop: '#DA0202',
			strokeColor: '#E0E0E0',
			generateGradient: true
		};

 		var gaugeChart = AmCharts.makeChart( "chartdiv", {
			"type": "gauge",
		  "theme": "light",
		  "axes": [ {
			"axisThickness": 1,
			"axisAlpha": .5,
			"tickAlpha": .5,
			"valueInterval": 100,
			"bands": [ {
			  "color": "#84b761",
			  "innerRadius": "96%",
			  "endValue": settings.capacityGreen,
			  "startValue": 0
			}, {
			  "color": "#fdd400",
			  "innerRadius": "94%",
			  "endValue": settings.capacityRed,
			  "startValue": 500
			}, {
			  "color": "#cc4748",
			  "endValue": settings.capacity,
			  "innerRadius": "92%",
			  "startValue": 560
			} ],
			"bottomText": "0 inmates / MAX: "+settings.capacity,
			"bottomTextYOffset": 40,
			"endValue": settings.capacity
		  } ],
		  "arrows": [ {} ],
		  "export": {
			"enabled": true
		  }
		});

		// set random value
		function moveneedle() {
		  var value = vm.total;
		  if ( gaugeChart ) {
			if ( gaugeChart.arrows ) {
			  if ( gaugeChart.arrows[ 0 ] ) {
				if ( gaugeChart.arrows[ 0 ].setValue ) {
				  gaugeChart.arrows[ 0 ].setValue( value );
				  gaugeChart.axes[ 0 ].setBottomText( value + " inmates / MAX: "+settings.capacity );
				}
			  }
			}
		  }
		}
				
		function init() {
			vm.getMonthly();
			getData();
			setInterval( moveneedle,2000 );
		};	
		init();
		
		
    }

}());