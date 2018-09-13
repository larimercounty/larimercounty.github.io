<div class="container"  ng-app="app" ng-controller="appCtrl as vm">
	<ul class="nav nav-pills ng-scope">
		<li role="presentation"><a href="/sheriff/jail-info/jail-population#/totals" class="nav-link"><i class="fa fa-users" aria-hidden="true"></i> Jail Population</a></li>	
		<li role="presentation"><a href="/sheriff/jail-info/jail-population#/trans" ui-sref="trans" class="nav-link"><i class="fa fa-book" aria-hidden="true"></i> Transient/Homeless Bookings</a></li>
		<li role="presentation" class="active"><a href="/sheriff/jail/inmate-search" class="nav-link"><i class="fa fa-search" aria-hidden="true"></i> Search All Inmates</a></li>
		<li role="presentation"><a href="/sheriff/booking-report/" class="nav-link"><i class="fa fa-calendar" aria-hidden="true"></i> View Booking Reports</a></li>
	</ul>	
	
	<br><label class="bold" for="name">Type 2+ letters of last name, then click a name in the list.</label>
	<div class="row">
		<div class="col-xs-9">
			<div class="auto-complete"><input type="text" id="name" ng-model="vm.name" typeahead-min-length="2" placeholder="Last Name" uib-typeahead="name for name in vm.list($viewValue)" typeahead-loading="loadingList" typeahead-no-results="noResults" typeahead-on-select="vm.getData()" class="form-control">
				<i ng-show="loadingList" class="fa fa-refresh"></i>
			</div>	
			<div ng-show="noResults">
				<i class="fa fa-times"></i> No Inmates Found
			</div>
		</div>
		<div class="col-xs-3">
			<button class="btn" ng-show="vm.name" ng-click="vm.name=''; vm.bookingno=''"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
		</div>
	</div>
	
	<div ng-show="vm.bookingno">	
		<h3>Inmate Information</h3>
		<div class="row assessor">
			<div class="col-sm-6">
				<span class="labeli">Name:</span> <strong class="maroon">{{ vm.info[0].BOOKING_NAME }}</strong><br>
				<span class="labeli">Date of Birth:</span> {{ vm.info[0].DATE_OF_BIRTH }}<br>
				<span class="labeli">MNI:</span> {{ vm.info[0].MNI }}<br>
				<span class="labeli">Booking No:</span> {{ vm.info[0].BOOKING_NO }}<br>
			</div>
			<div class="col-sm-6">
				<!-- .substring(0, vm.info[0].ARREST_DATE.length-8).replace(',','') -->
				<span class="labeli">Arrested:</span> {{ vm.info[0].ARREST_DATE }}&nbsp;&nbsp;&nbsp;{{ vm.fixTime(vm.info[0].ARREST_TIME) }}<br>
				<span class="labeli">Agency:</span> {{ vm.info[0].ARREST_AGY }} - {{ vm.info[0].ARRESTING_AGENCY }}<br>
				<span ng-show="vm.info[0].CASE_NO"><span class="labeli">Agency Case No:</span> 
				<span ng-if="vm.agencies.indexOf(vm.info[0].ARRESTING_AGENCY)">{{ vm.info[0].CASE_NO }}</span></span>
				<span ng-if="!vm.agencies.indexOf(vm.info[0].ARRESTING_AGENCY) && vm.info.CTN>0">{{ vm.info[0].CTN }}</span><br>
				<span class="labeli">Vehicle:</span> {{ vm.info[0].VEHICLE_LOCATION }}<br>
			</div>
		</div>
		
		<h3>Charge<span ng-show="vm.info.length>1">s</span></h3>
		<table ng-class="vm.tableClass">
			<thead>
				<tr>
					<th rowspan="2">Charge</th>
					<th rowspan="2">Description</th>
					<th rowspan="2">Authority</th>
				<th colspan="4" class="text-center">Sentencing information</th></tr>
				<tr>
					<th>Judge</th>
					<th>Sentence</th>
					<th>Time Credited</th>
				<th>Disposition</th></tr>
			</thead>
			<tbody ng-repeat="i in vm.info">
				<tr ng-show="i.WARRANT_DOCKETNO!=vm.info[$index-1].WARRANT_DOCKETNO">
					<td class="docket" colspan="10">Warrant/docket # {{ i.WARRANT_DOCKETNO }}&nbsp;&nbsp;&nbsp;
						Bond Out: <span ng-if="i.BOND_OUT=='Y'">Yes&nbsp;&nbsp;&nbsp;
							Bond Type: {{ i.BOND_TYPE }}&nbsp;&nbsp;&nbsp;
						Bond Amount: {{ i.BOND_AMOUNT | currency: "$" : 0 }}</span><span ng-if="i.BOND_OUT!='Y'">No</span>
					</td>
				</tr>
				<tr>
					<td>{{ i.CHARGE }}</td>
					<td>{{ i.CHARGE_LITERAL }}</td>
					<td>{{ i.AUTHORITY }}</td>
					<td>{{ i.SENTENCE_JUDGE.replace('-','-&#8203;') }}</td>
					<td><span ng-show="i.SENTENCE_YEARS">{{ i.SENTENCE_YEARS }} YR<span ng-show="i.SENTENCE_YEARS>1">S</span>&nbsp;</span>
						<span ng-show="i.SENTENCE_MONTHS">{{ i.SENTENCE_MONTHS }} MO<span ng-show="i.SENTENCE_MONTHS>1">S</span>&nbsp;</span>
					<span ng-show="i.SENTENCE_DAYS">{{ i.SENTENCE_DAYS }} DAY<span ng-show="i.SENTENCE_DAYS>1">S</span></span></td>
					<td>{{ i.CREDIT_TIME }}</td>
					<td>{{ i.DISPOSITION }}</td>
				</tr>
			</tbody>
		</table>
		
		<div ng-if="vm.court.length>0">
			<h3>Upcoming Court Date<span ng-show="vm.court.length>1">s</span></h3>
			<table ng-class="vm.tableClass" class="table-striped">
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>Court</th>
					<th>Description</th>
				</tr>
				<tr ng-repeat="c in vm.court">
					<td>{{ c.DATE }}</td>
					<td>{{ c.TIME }}</td>
					<td>{{ c.COURT }} <span ng-if="c.DESC.substring(0,2)=='CR'">- Fort Collins Justice Center, Laporte Ave.</span>
					<span ng-if="c.DESC.substring(0,1)=='L'"> - Loveland Courthouse</span></td>
					<td>{{ c.DESC }}</td>
				</tr>
			</table>
		</div>			
	</div>	
</div>					