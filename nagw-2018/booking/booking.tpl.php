<div class="container"  ng-app="app" ng-controller="appCtrl as vm">
	<ul class="nav nav-pills ng-scope">
		<li role="presentation"><a href="/sheriff/jail-info/jail-population#/totals" class="nav-link"><i class="fa fa-users" aria-hidden="true"></i> Jail Population</a></li>	
		<li role="presentation"><a href="/sheriff/jail-info/jail-population#/trans" ui-sref="trans" class="nav-link"><i class="fa fa-book" aria-hidden="true"></i> Transient/Homeless Bookings</a></li>
		<li role="presentation"><a href="/sheriff/jail/inmate-search" class="nav-link"><i class="fa fa-search" aria-hidden="true"></i> Search All Inmates</a></li>
		<li role="presentation" class="active"><a href="/sheriff/booking-report/" class="nav-link"><i class="fa fa-calendar" aria-hidden="true"></i> View Booking Reports</a></li>
	</ul>	
<br>
	<div class="row">
		<div class="col-md-6">
			<form>
				<p style="line-height: 300%;">
					<label class="label2" for="bookdate">Booking Date:</label>&nbsp;
					<!--  ng-init="vm.bookdate=vm.bookdate || vm.dates" -->
					<select ng-model="vm.bookdate" id="bookdate" class="form-control input-15" ng-change="vm.getData()">
						<option value="3">Past 3 days</option>
						<option ng-repeat="d in vm.dates">{{ d }}</option>
					</select>
					<br>
					<label class="label2" for="bookagency">Arresting Agency:</label>&nbsp;
					<select ng-model="vm.bookagency" id="bookagency" class="form-control input-30" ng-change="vm.getData()">
						<option value="">All</option>
						<option ng-repeat="a in vm.agencies" value="{{ a }}">{{ vm.agencyFullNames[$index] }} ({{ a }})</option>
					</select>
					<button class="btn btn-sm btn-primary" type="submit" ng-click="vm.getData()"><i class="fa fa-search" aria-hidden="true"></i> <span>Submit</span></button>
				</p>
				<p ng-show="vm.data.length" class="hidden-print"><label class="label2" for="name">Filter by Name:</label>&nbsp; <input ng-model="vm.search" id="name"  class="form-control" style="display: inline-block; width: 160px" placeholder="Name"></p>
			</form>
		</div>
		<div class="col-md-6">
			<div ng-if="vm.data.length && vm.agencyData.length>1" style="height:240px;">
				<div class="pie"><canvas id="pie" class="chart chart-pie"
					chart-data="vm.agencyData" chart-labels="vm.agencyNames" chart-colours="vm.agencyColors" chart-options="{tooltipFontSize: 11}" chart-legend="false" width="120" height="120">
					</canvas>
				</div>
				<div class="chart-legend">
					<h4>{{ vm.data.length }} Bookings<br><span style="font-size: .9em;">By Arresting Agency:</span></h4>
					<ul>
						<li ng-repeat="a in vm.agencyNames">
							<span class="number">{{ vm.agencyData[$index] }}</span>
							<span class="sq" ng-style="{'background-color': vm.agencyColors[$index] }"></span>
						<a href="#{{ a }}">{{ a }}</a></li>
					</ul>  
				</div>
			</div>
		</div>
	</div>
	
	
	<h3 ng-if="vm.norecords==1" class="text-center">No Bookings by {{ vm.bookagency }} <span ng-show="vm.bookdate==3">in past 3 days</span><span ng-show="vm.bookdate!=3">on {{ vm.bookdate }}</span></h3>
	
	<div ng-show="vm.data.length"> 
		<span ng-init="aa=''"></span>
		<h4 ng-if="vm.data.length && vm.agencyData.length<2" class="text-center">
			{{ vm.data.length }} Booking<span ng-show="vm.data.length>1">s</span> 
			<span ng-show="vm.bookagency"> by {{ vm.bookagency }}</span> 
			<span ng-show="vm.bookdate">on {{ vm.bookdate }}</span>
			<span ng-show="!vm.bookdate">in the past 3 days</span>
		</h4>
		
		<div ng-repeat="d in vm.data | filter: {BOOKING_NAME:vm.search}"  ng-init="bn=d.BOOKING_NO">			
			<h3>
				<span class="pull-right arresting" ng-style="{'background-color': vm.chartColors[vm.getAgencyIndex(d.ARREST_AGY)] }" tooltip-placement="bottom" uib-tooltip="{{ vm.agencyFullNames[vm.getAgencyIndex(d.ARREST_AGY)] }}"><a name="{{ d.ARREST_AGY }}"></a>{{ d.ARREST_AGY }}</span>
				{{ d.BOOKING_NAME.replace(",",", ") }}
			</h3>
			
			<span ng-init="aa=d.ARREST_AGY"></span>
			<div class="row i0">
				<div class="col-sm-5">
					<table ng-class="vm.tableClass">
						<tr>
							<td class="labelbr">Booking no.:</td>
							<td>{{ d.BOOKING_NO }}</td>
						</tr>
						<tr>
							<td class="labelbr">MNI:</td>
							<td>{{ d.MNI }}</td>
						</tr>
						<tr>
							<td class="labelbr">Citizenship:</td>
							<td>{{ d.CITIZEN }}</td>
							<tr>
								<td class="labelbr">DOB:</td>
								<td>{{ d.DOB }} ({{ vm.getAge(d.DATE_OF_BIRTH) }})</td>
							</tr>
							<tr>
								<td class="labelbr">Sex, Race:</td>
								<td>{{ d.SEX }}, {{ d.RACE }}</td>
							</tr>
						</table>
					</div>
					<div class="col-sm-7">
						<table ng-class="vm.tableClass">
							<tr>
								<td class="labelbr2">Arrest date:</td>
								<td>{{ d.ARREST_DATE }}<span ng-show="d.ARREST_TIME.length==4"> @ {{ vm.getTime(d.ARREST_TIME) }}</span></td>
							</tr>
							<tr>
								<td class="labelbr2 text-nowrap">Arrest location:</td>
								<td>{{ d.ARREST_LOCATION }}</td>
							</tr>
							<tr>
								<td class="labelbr2 text-nowrap">Arresting officer 1:</td>
								<td>{{ d.ARREST_OFFICER }} <span ng-if="d.ARR_OFFICER">({{ d.ARR_OFFICER }})</span></td>
							</tr>
							<tr ng-if="d.OTHER_OFFICER2 || d.OTHER_OFFICER">
								<td class="labelbr2">Arresting officer 2:</td>
								<td>{{ d.OTHER_OFFICER2 }} <span ng-if="d.OTHER_OFFICER">({{ d.OTHER_OFFICER }})</span></td>
							</tr>
						</table>
					</div>
					<div style="clear: both;"></div>
				</div>
				<div class="row i15">
					<table ng-class="vm.tableClass">
						<thead>
							<tr>
								<th>Authority</th>
								<th>Charge no.</th>
								<th>Charge</th>
							</tr>
						</thead>
						<tbody>
							<tr ng-repeat="c in vm.charge[bn]">
								<td>{{ c.data.AUTHORITY }}</td>
								<td>{{ c.data.CHARGE }}</td>
								<td>{{ c.data.CHARGE_LITERAL }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div> 
			
		</div>
	</div>    							