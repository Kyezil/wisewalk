import { Template } from 'meteor/templating';

Template.home.onCreated(function homeOnCreated() {
	console.log('created');
});

Template.home.helpers({
	'myName': () => {
		return [{a: 1, b: 'a'},{a: 2, b: 'b'},{a: 3, b: 'c'}];
	}
});
