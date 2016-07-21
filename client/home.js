import { Template } from 'meteor/templating';

Template.home.onCreated(function homeOnCreated() {
	console.log('created');
});

const terms = ["atm","bakery","bank","book_store","bus_station",
			"café","convenience_store","gas_station","grocery_or_supermarket",
			"library","park","parking","pharmacy","shopping_mall","subway_station"];
Template.home.helpers({
	'buttons': () => {
		return terms;
	}
});
