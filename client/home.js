import { Template } from 'meteor/templating';

const terms = [
	{ value: "atm", text: 'Atm' },
	{ value: "bakery", text: 'Bakery'},
	{ value: "bank", text: 'Bank'},
	{ value: "book_store", text: 'Book store'},
	{ value: "bus_station", text: 'Bus station'},
	{ value: "cafe", text: 'Café'},
	{ value: "convenience_store", text: 'Convenience store'},
	{ value: "gas_station", text: 'Gas station'},
	{ value: "grocery_or_supermarket", text: 'Supermarket'},
	{ value: "library", text: 'Library'},
	{ value: "park", text: 'Park'},
	{ value: "parking", text: 'Parking'},
	{ value: "pharmacy", text: 'Pharmacy'},
	{ value: "shopping_mall", text: 'Shopping mall'},
	{ value: "subway_station", text: 'Subway station'}
];

Template.home.helpers({
	buttons: () => terms
});

Template.home.events({
	'click #generate-walk': function clickGenerate(event, templateInstance) {
		const terms = templateInstance.findAll('.term');
		const newTerms = terms.filter((el) => el.checked).map((el) => el.name);
		console.log(newTerms);
	}
});

Template.termButton.helpers({
	icon: (prop) => 'map-icon-'+prop.replace(/_/g, '-')
});
