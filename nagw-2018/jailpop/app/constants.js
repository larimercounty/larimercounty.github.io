(function () {
	angular.module('app')

	.constant('env', 'development')
	.constant('settings', {
//		'restPath': 'https://apps.larimer.org/api/sheriff/',
		'restPath': 'https://larimercounty.apimanagement.us2.hana.ondemand.com/LarimerCountyJail/',
		'nodata': 'Sorry, the data is not currently available. Please check back later.',
		'capacity': 617,
		'target': 500,
		'capacityRed': 560,
		'capacityGreen': 480,
		'capacityYellow': 520,
//		'pgTitleTotals': "Current Jail Population", // in app.js routes title
//		'pgTitleTrans': "Transient/Homeless Bookings", // in app.js routes title
		'popHeader': "Current Population",
		'popBold': "The total number of all inmates incarcerated at the Larimer County Jail and other contracted jail facilities.",
		'popText': "The Larimer County jail was designed and built with the capacity to house 450 inmates.  With our expanding jail population, we had to make adjustments in order to increase the number of inmates that we can house to 617.  Unfortunately, those adjustments do not impact the design capacity of our jail which remains at 450.</p><p>Our target capacity is identified as being <em style='text-shadow: 0 0 0 #222;'>no more than</em> 80% of the total number inmates that we can house.  The reason for this target capacity is to allow us to appropriately house the many different classifications (or types) of inmates.  For instance, females cannot be housed in the same area as males, juveniles cannot be housed in the same area as adults, co-defendants for a case will not be housed together, consideration must be made to house transgender, transsexual and intersex inmates, etc.</p><p>In addition, we also have a responsibility to house inmates that are violent away from other inmates in order to ensure everyone's safety.  When the population number rises above 80% of available bed space, it makes it difficult to appropriately house these different inmate populations.  When we operate at 100% capacity or above, it becomes impossible to keep these groups separated and housed safely.",
		'transHeader': "Transient/Homeless",
		'transBold': "This is a comparison of Homeless, Transient or Shelter inmates versus other inmates.",
		'transText': 'This is a designation applied to those individuals who do not have an address either by choice or by circumstance.  If someone without an address has been in the area for less than 30 days we consider them to be Transient, greater than 30 days Homeless.  We also track a number of known charities, halfway houses or other non-profit/community housing in the community to identify those individuals as "Shelter".',
		'mfHeader': "Male / Female",
		'mfBold': "This number reflects a breakdown of male vs. female inmates at the jail.",
		'mfText': "All genders of inmates must be appropriately housed in our facility.  Housing consideration is made when housing both males and females, which includes transgender, transsexual and intersex inmates.  We endeavor to use the facility in such a manner as to most effectively house our different gender populations.  For instance, if our female population is high and our male population is low, even marginally, we will adjust the gender assigned to an area from male to female in order to best balance our male and female population to our available space.  Our current female population accounts for approximately 20% of our overall inmate population.",
		'typesHeader': "Pre-Trial / Sentenced / Hold",
		'typesBold': "The basic categorization of the inmates that we house.",
		'typesText': "<p>Pre-Trial inmates are individuals that haven't been found guilty or innocent of their criminal case yet.  If a court has established and set a bond(s), pre-trial inmates are eligible to be released after posting bond.  In some cases, a court has determined an inmate is not eligible to receive a bond and must stay in jail until their case reaches a conclusion.</p><p>Sentenced inmates have been found guilty of their charges and have been sentenced to either the Larimer County Jail or Larimer County Community Corrections and awaiting bed space in their program.</p><p>Hold inmates are those that we are holding for other agencies.  These can include inmates being held for other county agencies within Colorado, inmates awaiting pickup by agencies in other states, inmates awaiting transfer to the Colorado Department of Corrections and inmates awaiting pick-up for federal cases.</p>",
		'typesText1': "Pre-Trial inmates are individuals that haven't been found guilty or innocent of their criminal case yet. If a court has established and set a bond(s), pre-trial inmates are eligible to be released after posting bond.  In some cases, a court has determined an inmate is not eligible to receive a bond and must stay in jail until their case reaches a conclusion.",
		'typesText2': "Sentenced inmates have been found guilty of their charges and have been sentenced to either the Larimer County Jail or Larimer County Community Corrections and awaiting bed space in their program.",
		'typesText3': "Hold inmates are those that we are holding for other agencies.  These can include inmates being held for other county agencies within Colorado, inmates awaiting pickup by agencies in other states, inmates awaiting transfer to the Colorado Department of Corrections and inmates awaiting pick-up for federal cases.</p>",
		'chartColors': ['#408000', '#00BDBD', '#004080', '#800000', '#ffffff', '#400080', '#800080'],
		'red': '#990000',
		'yellow': '#E6E600',
		'blue': '#004D99',
		'teal': '#00BDBD'
	});

})();
